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
      <label>
        frequency:
        <input id="frequency" type="number" value="<%= frequency %>" />
      </label>
      <label>
        gain:
        <input id="gain" type="number" value="<%= gain %>" />
      </label>
      <label>
        tremolo frequency:
        <input id="tremolo-frequency" type="number" value="<%= tremoloFrequency %>" />
      </label>
      <label>
        tremolo depth:
        <input id="tremolo-depth" type="number" value="<%= tremoloDepth %>" />
      </label>
      <label>
        mute:
        <input id="mute" type="checkbox" />
      </label>
    </div>
    <div class="section-bottom flex-middle"></div>
  </div>
`;

// this experience plays a sound when it starts, and plays another sound when
// other clients join the experience
class PlayerExperience extends soundworks.Experience {
  constructor(assetsDomain) {
    super();

    this.platform = this.require('platform', { features: ['web-audio'] });
    this.checkin = this.require('checkin', { showDialog: false });
    this.sharedParams = this.require('shared-params');
  }

  start() {
    super.start();

    // initialize the view
    this.master = audioContext.createGain();
    this.master.connect(audioContext.destination);
    this.master.gain.value = 1;
    this.master.gain.setValueAtTime(1, audioContext.currentTime);

    this.mute = audioContext.createGain();
    this.mute.connect(this.master);
    this.mute.gain.value = 1;

    this.synth = new Synth();
    this.synth.connect(this.mute);

    // view
    this.view = new soundworks.View(template, {
      frequency: 0,
      gain: 0,
      tremoloFrequency: 0,
      tremoloDepth:0,
    }, {
      'change #frequency': e => {
        this.synth.frequency = parseInt(e.target.value);
      },
      'change #gain': e => {
        this.synth.gain = parseFloat(e.target.value);
      },
      'change #tremolo-frequency': e => {
        this.synth.tremoloFrequency = parseInt(e.target.value);
      },
      'change #tremolo-depth': e => {
        this.synth.tremoloDepth = parseFloat(e.target.value);
      },
      'change #mute': e => {
        if (e.target.checked)
          this.mute.gain.value = 0;
        else
          this.mute.gain.value = 1;
      },
    }, {
      id: this.id,
      preservePixelRatio: true,
    });

    // params
    this.sharedParams.addParamListener('volume', value => {
      const gain = decibelToLinear(value);
      const now = audioContext.currentTime;
      this.master.gain.linearRampToValueAtTime(gain, now + 0.01);
    });

    this.sharedParams.addParamListener('start-stop', value => {
      if (value === 'start')
        this.mute.gain.value = 1;
      else if (value === 'stop')
        this.mute.gain.value = 0;
    });

    this.sharedParams.addParamListener('parts', label => {
      const part = score.find(part => part.label === label);

      const frequency = part.frequencies[client.index % part.frequencies.length];
      const gain = part.gains[client.index % part.gains.length];
      const tremoloFrequency = part.tremoloFrequencies[client.index % part.tremoloFrequencies.length];
      const tremoloDepth = part.tremoloDepths[client.index % part.tremoloDepths.length];

      this.synth.frequency = frequency;
      this.synth.gain = gain;
      this.synth.tremoloFrequency = tremoloFrequency;
      this.synth.tremoloDepth = tremoloDepth;

      this.view.model.frequency = frequency;
      this.view.model.gain = gain;
      this.view.model.tremoloFrequency = tremoloFrequency;
      this.view.model.tremoloDepth = tremoloDepth;
      this.view.render();
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
