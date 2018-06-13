import * as soundworks from 'soundworks/client';
import { decibelToLinear } from 'soundworks/utils/math';
import stateFactory from './states/stateFactory';
import { rampParam, setParam } from './utils/audioParamPoly';

const audioContext = soundworks.audioContext;
const audioFiles = {
  'testing': 'sounds/tuning.mp3',
};

const template = ``;

class PlayerExperience extends soundworks.Experience {
  constructor(assetsDomain, score) {
    super();

    this.score = score;

    this.platform = this.require('platform', { features: ['web-audio', 'wake-lock'] });
    this.checkin = this.require('checkin', { showDialog: false });
    this.sharedParams = this.require('shared-params');
    this.motionInput = this.require('motion-input', { descriptors: ['accelerationIncludingGravity'] });
    this.audioBufferManager = this.require('audio-buffer-manager', { files: audioFiles });

    this.state = null;

    this._motionListeners = new Set();
  }

  start() {
    super.start();

    this.view = new soundworks.View(template, {}, {}, {});

    this.master = audioContext.createGain();
    this.master.connect(audioContext.destination);
    setParam(this.master.gain, 1);

    this.masterBus = this.master;

    this.show().then(() => {
      this.sharedParams.addParamListener('/reload', () => {
        window.location.reload(true);
      });

      // init state when view is ready
      this.sharedParams.addParamListener('/state', name => {
        if (name)
          this.setState(name);
        else
          this.setState('testing');
      });

      this.sharedParams.addParamListener('/volume', db => {
        const gain = decibelToLinear(db);
        rampParam(this.master.gain, gain, 0.01);
      });

      // handle acceleration listeners
      const period = this.motionInput._descriptorsPeriod.accelerationIncludingGravity;

      this.motionInput.addListener('accelerationIncludingGravity', data => {
        this._motionListeners.forEach(callback => callback(data, period));
      });

    });
  }

  setState(name) {
    if (this.state !== null) {
      if (this.state.name === name)
        return;

      this.state.exit(this);
    }

    this.state = stateFactory.get(name, this.score);
    this.state.enter(this);
  }

  addMotionListener(callback) {
    this._motionListeners.add(callback);
  }

  removeMotionListener(callback) {
    this._motionListeners.delete(callback);
  }
}

export default PlayerExperience;
