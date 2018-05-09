import * as soundworks from 'soundworks/client';
import { centToLinear, decibelToLinear } from 'soundworks/utils/math';
import SineSynth from './SineSynth';
import CircleRenderer from './CircleRenderer';
import score from '../../../score/model.json';

const audioContext = soundworks.audioContext;
const client = soundworks.client;

const debugView = true;

const template = `
  <canvas class="background"></canvas>
  <div class="foreground">
    <div class="main">
      <% if (debug) { %>
        <p>group: <%= group %></p>
        <p>index: <%= index %></p>
        <p>frequency: <%= frequency %></p>
        <p>gain: <%= gain %></p>
        <p>tremoloFrequency: <%= tremoloFrequency %></p>
        <p>tremoloDepth: <%= tremoloDepth %></p>
        <br />
        <p>lowpass cutoff: <%= lowpassCutoff %></p>
        <p>highpass cutoff: <%= highpassCutoff %></p>
        <br />
        <p>mappingX: <%= mappingX %></p>
        <p>mappingY: <%= mappingY %></p>
      <% } %>
    </div>
  </div>
`;

// this experience plays a sound when it starts, and plays another sound when
// other clients join the experience
class PlayerExperience extends soundworks.Experience {
  constructor(assetsDomain) {
    super();

    this.platform = this.require('platform', { features: ['web-audio', 'wake-lock'] });
    this.checkin = this.require('checkin', { showDialog: false });
    this.sharedParams = this.require('shared-params');
    this.motionInput = this.require('motion-input', { descriptors: ['accelerationIncludingGravity'] });

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

    // initialize the view
    this.master = audioContext.createGain();
    this.master.connect(audioContext.destination);
    this.master.gain.value = 0;
    this.master.gain.setValueAtTime(0, audioContext.currentTime);

    this.lowpass = audioContext.createBiquadFilter();
    this.lowpass.connect(this.master);
    this.lowpass.type = 'lowpass';
    this.lowpass.frequency.value = 0;
    this.lowpass.frequency.setValueAtTime(0, audioContext.currentTime);

    this.highpass = audioContext.createBiquadFilter();
    this.highpass.connect(this.lowpass);
    this.highpass.type = 'highpass';
    this.highpass.frequency.value = 16000;
    this.highpass.frequency.setValueAtTime(0, audioContext.currentTime);

    this.masterBus = this.highpass;

    this.sineSynth = new SineSynth();
    this.sineSynth.connect(this.masterBus);

    this.mappings = { x: 0.5, y: 0.5 };

    // view
    this.view = new soundworks.CanvasView(template, {
      debug: debugView,
      group: this.groupLabel,
      index: this.indexInGroup,
      frequency: 0,
      gain: 0,
      tremoloFrequency: 0,
      tremoloDepth:0,
      lowpassCutoff: 0,
      highpassCutoff: 16000,
      mappingX: 0.5,
      mappingY: 0.5,
    }, {}, {
      id: this.id,
      preservePixelRatio: true,
      ratios: {
        '.main': 1,
      },
    });

    this.circleRenderer = new CircleRenderer(this.mappings);

    // params
    this.sharedParams.addParamListener('/reload', () => {
      window.location.reload(true);
    });

    this.sharedParams.addParamListener(`/${this.groupLabel}/volume`, value => {
      const gain = Math.min(1, Math.max(0, decibelToLinear(value)));
      const now = audioContext.currentTime;

      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setValueAtTime(this.master.gain.value, now);
      this.master.gain.linearRampToValueAtTime(gain, now + 0.05);

      this.circleRenderer.opacity = Math.sqrt(gain);
    });

    this.sharedParams.addParamListener(`/${this.groupLabel}/lowpass-cutoff`, value => {
      const cutoff = Math.min(audioContext.sampleRate / 2, Math.max(0, value));
      const now = audioContext.currentTime;

      this.lowpass.frequency.cancelScheduledValues(now);
      this.lowpass.frequency.setValueAtTime(this.lowpass.frequency.value, now);
      this.lowpass.frequency.linearRampToValueAtTime(cutoff, now + 0.05);

      if (debugView) {
        this.view.model.lowpassCutoff = cutoff;
        this.view.render();
      }
    });

    this.sharedParams.addParamListener(`/${this.groupLabel}/highpass-cutoff`, value => {
      const cutoff = Math.min(audioContext.sampleRate / 2, Math.max(0, value));
      const now = audioContext.currentTime;

      this.highpass.frequency.cancelScheduledValues(now);
      this.highpass.frequency.setValueAtTime(this.highpass.frequency.value, now);
      this.highpass.frequency.linearRampToValueAtTime(cutoff, now + 0.05);

      if (debugView) {
        this.view.model.highpassCutoff = cutoff;
        this.view.render();
      }
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

      if (debugView) {
        this.view.model.frequency = frequency;
        this.view.model.gain = gain;
        this.view.model.tremoloFrequency = tremoloFrequency;
        this.view.model.tremoloDepth = tremoloDepth;
        this.view.render();
      }
    });

    this.sharedParams.addParamListener('/start-stop', value => {
      if (value === 'start')
        this.sineSynth.start();
      else if (value === 'stop')
        this.sineSynth.stop();
    });

    // as show can be async, we make sure that the view is actually rendered
    this.show().then(() => {
      this.view.addRenderer(this.circleRenderer);

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
    });
  }

  updateMappings() {
    this.view.model.mappingX = this.mappings.x;
    this.view.model.mappingY = this.mappings.y;
    // this.view.render('.foreground');
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
