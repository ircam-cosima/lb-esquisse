import { audioContext, client } from 'soundworks/client';
import { rampParam, setParam } from '../utils/audioParamPoly';


class ModSynth {
  constructor() {
    const now = audioContext.currentTime;

    this.level = audioContext.createGain();
    setParam(this.level.gain, 0);

    this.envelop = audioContext.createGain();
    this.envelop.connect(this.level);
    setParam(this.envelop.gain, 0);

    this.lowpass = audioContext.createBiquadFilter();
    this.lowpass.connect(this.envelop);
    this.lowpass.type = 'lowpass';
    setParam(this.lowpass.frequency, audioContext.sampleRate / 2);

    this.highpass = audioContext.createBiquadFilter();
    this.highpass.connect(this.lowpass);
    this.highpass.type = 'highpass';
    setParam(this.highpass.frequency, 0);

    // AM
    this.tremolo = audioContext.createGain();
    this.tremolo.connect(this.highpass);
    setParam(this.tremolo.gain, 1);

    this.depth = audioContext.createGain();
    this.depth.connect(this.tremolo.gain);
    setParam(this.depth.gain, 0);

    // FM
    this.modRatio = audioContext.createGain();
    setParam(this.modRatio.gain, 0);

    // SRC
    this.osc = null;
    this.tremoloFrequency = null;
    this.modFrequency = null;

    this.started = false;

    this._frequency = 0;
    this._modFrequency = 0;
    this._tremoloFrequency = 0;
  }

  connect(destination) {
    this.level.connect(destination);
  }

  disconnect() {
    this.level.disconnect();
  }

  reset() {
    setParam(this.level.gain, 0);
    setParam(this.envelop.gain, 0);
    setParam(this.lowpass.frequency, audioContext.sampleRate / 2);
    setParam(this.highpass.frequency, 0);
    setParam(this.tremolo.gain, 1);
    setParam(this.depth.gain, 0);
    setParam(this.modRatio.gain, 0);

    if (this.started) {
      setParam(this.osc.frequency, 0);
      setParam(this.tremoloFrequency.frequency, 0);
      setParam(this.modFrequency.frequency, 0);
      // @todo - recheck
      this._frequency = 0;
      this._modFrequency = 0;
      this._tremoloFrequency = 0;
    }
  }

  start() {
    if (!this.started) {
      this.started = true;

      // carrier
      this.osc = audioContext.createOscillator();
      this.osc.connect(this.tremolo);
      setParam(this.osc.frequency, this._frequency);

      // FM mod
      this.tremoloFrequency = audioContext.createOscillator();
      this.tremoloFrequency.connect(this.depth);
      setParam(this.tremoloFrequency.frequency, this._tremoloFrequency);

      // AM frequency
      this.modFrequency = audioContext.createOscillator();
      this.modFrequency.connect(this.modRatio);
      setParam(this.modFrequency.frequency, this._modFrequency);

      this.modRatio.connect(this.osc.frequency);

      const now = audioContext.currentTime;

      this.osc.start(now);
      this.tremoloFrequency.start(now);
      this.modFrequency.start(now);
    }
  }

  stop() {
    if (this.started) {
      const now = audioContext.currentTime;

      this.osc.stop(now);
      this.tremoloFrequency.stop(now);

      this.osc = null;
      this.tremoloFrequency = null;

      this.started = false;

      this.reset();
    }
  }

  // main osc
  setFrequency(value, rampDuration = 0.01) {
    this._frequency = value;

    if (this.osc)
      rampParam(this.osc.frequency, value, rampDuration)
  }

  setDetune(value, rampDuration = 0.01) {
    if (this.osc)
      rampParam(this.osc.detune, value, rampDuration)
  }

  //
  setLevel(value, rampDuration = 0.01) {
    rampParam(this.level.gain, value, rampDuration)
  }

  setEnvelop(value, rampDuration = 0.01) {
    rampParam(this.envelop.gain, value, rampDuration)
  }

    // Filters
  setHighpassCutoff(value, rampDuration = 0.01) {
    const cutoff = Math.min(audioContext.sampleRate / 2, Math.max(0, value));
    rampParam(this.highpass.frequency, cutoff, rampDuration);
  }

  setLowpassCutoff(value, rampDuration = 0.01) {
    const cutoff = Math.min(audioContext.sampleRate / 2, Math.max(0, value));
    rampParam(this.lowpass.frequency, cutoff, rampDuration);
  }

  // FM
  setModFrequency(value, rampDuration = 0.01) {
    this._modFrequency = value;

    if (this.modFrequency)
      rampParam(this.modFrequency.frequency, value, rampDuration);
  }

  setModRatio(value, rampDuration = 0.01) {
    rampParam(this.modRatio.gain, value, rampDuration);
  }

  // AM
  setTremoloDepth(value, rampDuration = 0.01) {
    rampParam(this.depth.gain, value, rampDuration);
    rampParam(this.tremolo.gain, 1 - value, rampDuration);
  }

  setTremoloFrequency(value, rampDuration = 0.01) {
    this._tremoloFrequency = value;

    if (this.tremoloFrequency)
      rampParam(this.tremoloFrequency.frequency, value, rampDuration);
  }
}

export default ModSynth;
