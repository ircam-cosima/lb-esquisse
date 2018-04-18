import * as soundworks from 'soundworks/client';
import { centToLinear, decibelToLinear } from 'soundworks/utils/math';
import Synth from './Synth';
import score from '../../../score/model.json';

const audioContext = soundworks.audioContext;
const client = soundworks.client;

const template = `
  <canvas class="background"></canvas>
  <div class="foreground">
    <div class="section-top flex-middle"></div>
    <div class="section-center">
      <% if (debug) { %>
        <p>group: <%= group %></p>
        <p>index: <%= index %></p>
        <p>frequency: <%= frequency %></p>
        <p>gain: <%= gain %></p>
        <p>tremoloFrequency: <%= tremoloFrequency %></p>
        <p>tremoloDepth: <%= tremoloDepth %></p>

        <div class="gain-feedback" style="opacity: <%= currentGain %>"></div>
      <% } %>
    </div>
    <div class="section-bottom flex-middle"></div>
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
    this.master.gain.value = 1;
    this.master.gain.setValueAtTime(1, audioContext.currentTime);

    this.synth = new Synth();
    this.synth.connect(this.master);

    const debugView = true;

    // view
    this.view = new soundworks.View(template, {
      debug: debugView,
      group: this.groupLabel,
      index: this.indexInGroup,
      frequency: 0,
      gain: 0,
      tremoloFrequency: 0,
      tremoloDepth:0,
      currentGain: 0,
    }, {}, {
      id: this.id,
      preservePixelRatio: true,
    });

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

      if (debugView) {
        this.view.model.currentGain = Math.sqrt(gain);
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

      this.synth.gain = gain;
      this.synth.frequency = frequency;
      this.synth.tremoloFrequency = tremoloFrequency;
      this.synth.tremoloDepth = tremoloDepth;

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
        this.synth.start();
      else if (value === 'stop')
        this.synth.stop();
    });

    // as show can be async, we make sure that the view is actually rendered
    this.show().then(() => {});
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
