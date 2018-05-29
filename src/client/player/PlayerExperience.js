import * as soundworks from 'soundworks/client';
import { centToLinear, decibelToLinear } from 'soundworks/utils/math';
import SineSynth from './SineSynth';
import CircleRenderer from './CircleRenderer';
import score from '../../../score/model.json';


const DEBUG_VIEW = true;
const rampTime = 0.04;

const audioContext = soundworks.audioContext;
const audio = soundworks.audio;
const client = soundworks.client;
const scheduler = audio.getScheduler();
scheduler.lookahead = 0.1;

const template = `
  <canvas class="background"></canvas>
  <div class="foreground">
    <div class="main">
      <% if (debug) { %>
        <p><b>GENERAL</b></p>
        <p>group: <%= group %></p>
        <p>index: <%= index %></p>
        <p>part: <%= part %></p>
        <br />

        <p><b>SINE</b></p>
        <p>state: <%= sine %></p>
        <p>frequency: <%= frequency %></p>
        <p>gain: <%= gain %></p>
        <p>tremoloFrequency: <%= tremoloFrequency %></p>
        <p>tremoloDepth: <%= tremoloDepth %></p>
        <p>lowpass cutoff: <%= lowpassCutoff %></p>
        <p>highpass cutoff: <%= highpassCutoff %></p>
        <br />

        <p><b>GRANULAR</b></p>
        <p>state: <%= granular %></p>
        <p>buffer: <%= buffer %></p>
        <p>position: <%= position %></p>
        <p>positionVar: <%= positionVar %></p>
        <p>period: <%= period %></p>
        <p>duration: <%= duration %></p>
        <p>resampling: <%= resampling %></p>
        <p>resamplingVar: <%= resamplingVar %></p>
      <% } %>
    </div>
  </div>
`;

// this experience plays a sound when it starts, and plays another sound when
// other clients join the experience
class PlayerExperience extends soundworks.Experience {
  constructor(assetsDomain, audioFiles) {
    super();

    const files = {};
    audioFiles.forEach(file => files[file] = file);

    this.platform = this.require('platform', { features: ['web-audio', 'wake-lock'] });
    this.checkin = this.require('checkin', { showDialog: false });
    this.sharedParams = this.require('shared-params');

    if (client.platform.isMobile)
      this.motionInput = this.require('motion-input', { descriptors: ['accelerationIncludingGravity'] });

    this.audioBufferManager = this.require('audio-buffer-manager', { files });

    this.group = null;
  }

  start() {
    super.start();

    const numGroups = score.length;
    const groupLabels = score.map(group => group.label);

    // define group and client index inside the group
    this.groupIndex = client.index % numGroups;
    this.score = score[this.groupIndex];
    this.groupLabel = this.score.label;
    this.indexInGroup = Math.floor(client.index / numGroups);

    // gains for audio chain
    this.master = audioContext.createGain();
    this.master.connect(audioContext.destination);
    this.master.gain.value = 1;
    this.master.gain.setValueAtTime(1, audioContext.currentTime);

    this.groupMaster = audioContext.createGain();
    this.groupMaster.connect(this.master);
    this.groupMaster.gain.value = 1;
    this.groupMaster.gain.setValueAtTime(1, audioContext.currentTime);

    this.sineGain = audioContext.createGain();
    this.sineGain.connect(this.groupMaster);
    this.sineGain.gain.value = 0;
    this.sineGain.gain.setValueAtTime(0, audioContext.currentTime);

    this.granularGain = audioContext.createGain();
    this.granularGain.connect(this.groupMaster);
    this.granularGain.gain.value = 0;
    this.granularGain.gain.setValueAtTime(0, audioContext.currentTime);

    this.sineSynth = new SineSynth();
    this.sineSynth.connect(this.sineGain);

    this.granular = new audio.GranularEngine();
    this.granular.connect(this.granularGain);

    this.mappings = { x: 0.5, y: 0.5 };

    // view
    this.view = new soundworks.CanvasView(template, {
      debug: DEBUG_VIEW,
      group: this.groupLabel,
      index: this.indexInGroup,
      part: 'none',

      sine: 'stop',
      frequency: 0,
      gain: 0,
      tremoloFrequency: 0,
      tremoloDepth:0,
      lowpassCutoff: 0,
      highpassCutoff: 16000,

      granular: 'stop',
      buffer: '',
      position: 0,
      positionVar: 0,
      period: 0,
      duration: 0,
      resampling: 0,
      resamplingVar: 0,
    }, {}, {
      id: this.id,
      preservePixelRatio: true,
      ratios: {
        '.main': 1,
      },
    });

    this.circleRenderer = new CircleRenderer(this.mappings);

    // ---------------------------------------------------------------------
    // BIND GENERAL PARAMS
    // ---------------------------------------------------------------------

    // this.circleRenderer.opacity = Math.sqrt(gain);

    this.sharedParams.addParamListener('/reload', () => {
      window.location.reload(true);
    });

    this.sharedParams.addParamListener(`/volume`, value => {
      const gain = Math.min(1, Math.max(0, decibelToLinear(value)));
      const now = audioContext.currentTime;

      this.master.gain.linearRampToValueAtTime(gain, now + rampTime);
    });


    this.sharedParams.addParamListener(`/${this.groupLabel}/volume`, value => {
      const gain = Math.min(1, Math.max(0, decibelToLinear(value)));
      const now = audioContext.currentTime;

      this.groupMaster.gain.linearRampToValueAtTime(gain, now + rampTime);
    });


    this.sharedParams.addParamListener(`/${this.groupLabel}/parts`, label => {
      const part = this.score.parts.find(part => part.label === label);
      const indexInGroup = this.indexInGroup;

      const frequency = part.frequencies[indexInGroup % part.frequencies.length];
      const gain = part.gains[indexInGroup % part.gains.length];
      const tremoloFrequency = part.tremoloFrequencies[indexInGroup % part.tremoloFrequencies.length];
      const tremoloDepth = part.tremoloDepths[indexInGroup % part.tremoloDepths.length];

      this.sineSynth.gain = gain;
      this.sineSynth.frequency = frequency;
      this.sineSynth.tremoloFrequency = tremoloFrequency;
      this.sineSynth.tremoloDepth = tremoloDepth;

      if (DEBUG_VIEW) {
        this.view.model.part = label;
        this.view.model.frequency = frequency;
        this.view.model.gain = gain;
        this.view.model.tremoloFrequency = tremoloFrequency;
        this.view.model.tremoloDepth = tremoloDepth;
        this.view.render();
      }
    });

    // ---------------------------------------------------------------------
    // BIND SINE PARAMS
    // ---------------------------------------------------------------------

    this.sharedParams.addParamListener(`/${this.groupLabel}/sine`, value => {
      if (value === 'start')
        this.sineSynth.start();
      else if (value === 'stop')
        this.sineSynth.stop();

      this.updateDebugViewAndFlash('sine', value);
    });

    this.sharedParams.addParamListener(`/${this.groupLabel}/sine/volume`, value => {
      const gain = Math.min(1, Math.max(0, decibelToLinear(value)));
      const now = audioContext.currentTime;

      this.sineGain.gain.linearRampToValueAtTime(gain, now + rampTime);
    });

    this.sharedParams.addParamListener(`/${this.groupLabel}/sine/envelop`, value => {
      const gain = Math.min(1, Math.max(0, decibelToLinear(value)));
      const now = audioContext.currentTime;

      this.sineSynth.setEnvelop(gain, rampTime);
    });

    this.sharedParams.addParamListener(`/${this.groupLabel}/sine/lowpass-cutoff`, value => {
      this.setLowpassCutoff(value, 0.04);
      this.updateDebugViewAndFlash('lowpassCutoff', cutoff);
    });

    this.sharedParams.addParamListener(`/${this.groupLabel}/sine/highpass-cutoff`, value => {
      this.setHighpassCutoff(value, 0.04);
      this.updateDebugViewAndFlash('highpassCutoff', cutoff);
    });

    // ---------------------------------------------------------------------
    // BIND GRANULAR PARAMS
    // ---------------------------------------------------------------------

    this.sharedParams.addParamListener(`/${this.groupLabel}/granular`, value => {
      if (value === 'start') {
        if (!this.granular.master)
          scheduler.add(this.granular);
      } else if (value === 'stop') {
        if (this.granular.master)
          scheduler.remove(this.granular);
      }

      this.updateDebugViewAndFlash('granular', value);
    });

    this.sharedParams.addParamListener(`/${this.groupLabel}/granular/volume`, value => {
      const gain = Math.min(1, Math.max(0, decibelToLinear(value)));
      const now = audioContext.currentTime;

      this.granularGain.gain.linearRampToValueAtTime(gain, now + rampTime);
    });

    this.sharedParams.addParamListener(`/${this.groupLabel}/granular/envelop`, value => {
      const gain = Math.min(1, Math.max(0, decibelToLinear(value)));
      const now = audioContext.currentTime;

      this.granular.gain = gain;
    });

    this.sharedParams.addParamListener(`/${this.groupLabel}/granular/buffer`, value => {
      const audioBuffer = this.audioBufferManager.data[value];
      this.granular.buffer = audioBuffer;

      this.updateDebugViewAndFlash('buffer', value);
    });

    this.sharedParams.addParamListener(`/${this.groupLabel}/granular/position`, value => {
      const duration = this.granular.buffer.duration;
      const position = value * duration;
      this.granular.position = position;

      this.updateDebugViewAndFlash('position', value);
    });

    ['positionVar', 'period',
      'duration', 'resampling', 'resamplingVar'].forEach(paramName => {
        this.sharedParams.addParamListener(`/${this.groupLabel}/granular/${paramName}`, value => {
          this.granular[paramName] = value;
          this.updateDebugViewAndFlash(paramName, value);
        });
    });

    // ---------------------------------------------------------------------
    // INIT VIEW
    // ---------------------------------------------------------------------

    // as show can be async, we make sure that the view is actually rendered
    this.show().then(() => {
      this.view.addRenderer(this.circleRenderer);

      // allow testing on desktop
      if (client.platform.isMobile) {
        const period = this.motionInput._descriptorsPeriod.accelerationIncludingGravity;

        this.motionInput.addListener('accelerationIncludingGravity', (data, ...args) => {
          const vx = - data[0] / 9.81;
          const vy = (data[1] - 5) / 9.81;

          this.mappings.x += (vx * 0.7 * period);
          this.mappings.y += (vy * 0.7 * period);

          this.mappings.y = Math.max(0, Math.min(1, this.mappings.y));
          this.mappings.x = Math.max(0, Math.min(1, this.mappings.x));

          this.updateMappings();
        });
      }
    });
  }

  updateDebugViewAndFlash(paramName, value) {
    if (DEBUG_VIEW) {
      this.view.model[paramName] = value;
      this.view.render();
    }
  }

  updateMappings() {

  }

  playSound(buffer, randomPitchVar = 0) {
    const src = audioContext.createBufferSource();
    src.connect(audioContext.destination);
    src.buffer = buffer;
    src.start(audioContext.currentTime);
    src.playbackRate.value = centToLinear((Math.random() * 2 - 1) * randomPitchVar);
  }
}

export default PlayerExperience;
