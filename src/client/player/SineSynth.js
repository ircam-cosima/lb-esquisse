import { audioContext } from 'soundworks/client';

class Synth {
  constructor() {
    const now = audioContext.currentTime;

    this.gain = audioContext.createGain();
    this.gain.gain.value = 0;
    this.gain.gain.setValueAtTime(0, now);

    this.env = audioContext.createGain();
    this.env.connect(this.gain);
    this.env.gain.value = 0;
    this.env.gain.setValueAtTime(0, now);

    this.lowpass = audioContext.createBiquadFilter();
    this.lowpass.connect(this.env);
    this.lowpass.type = 'lowpass';
    this.lowpass.frequency.value = 0;
    this.lowpass.frequency.setValueAtTime(0, audioContext.currentTime);

    this.highpass = audioContext.createBiquadFilter();
    this.highpass.connect(this.lowpass);
    this.highpass.type = 'highpass';
    this.highpass.frequency.value = 16000;
    this.highpass.frequency.setValueAtTime(0, audioContext.currentTime);

    // tremolo
    this.tremolo = audioContext.createGain();
    this.tremolo.connect(this.highpass);

    this.depth = audioContext.createGain();
    this.depth.connect(this.tremolo.gain);

    this.osc = null;
    this.rate = null;
    this.started = false;

    this._frequency = 0;
    this._tremoloFrequency = 0;
  }

  start() {
    if (!this.started) {
      // tremolo rate
      this.rate = audioContext.createOscillator();
      this.rate.connect(this.depth);
      this.rate.frequency.value = this._tremoloFrequency;

      // main oscillator
      this.osc = audioContext.createOscillator();
      this.osc.connect(this.tremolo);
      this.osc.frequency.value = this._frequency;
      this.osc.type = 'sine';

      this.osc.start();
      this.rate.start();
    }

    this.started = true;
  }

  stop() {
    if (this.started) {
      this.osc.stop();
      this.rate.stop();

      this.osc = null;
      this.rate = null;
    }

    this.started = false;
  }

  connect(destination) {
    this.gain.connect(destination);
  }

  set frequency(frequency) {
    this._frequency = frequency;

    if (this.started) {
      const now = audioContext.currentTime;
      this.osc.frequency.linearRampToValueAtTime(this._frequency, now + 0.005);
    }
  }

  set tremoloFrequency(tremoloFrequency) {
    this._tremoloFrequency = tremoloFrequency;

    if (this.started) {
      const now = audioContext.currentTime;
      this.rate.frequency.linearRampToValueAtTime(this._tremoloFrequency, now + 0.005);
    }
  }

  set tremoloDepth(depth) {
    const now = audioContext.currentTime;
    this.depth.gain.linearRampToValueAtTime(depth, now + 0.005);
    this.tremolo.gain.linearRampToValueAtTime(1 - depth, now + 0.005);
  }

  set gain(gain) {
    const now = audioContext.currentTime;
    this.env.gain.linearRampToValueAtTime(gain, now + 0.005);
  }

  setEnvelop(gain, rampTime) {
    const now = audioContext.currentTime;
    this.env.gain.linearRampToValueAtTime(gain, now + rampTime);
  }

  setHighpassCutoff(freq, rampTime) {
    const cutoff = Math.min(audioContext.sampleRate / 2, Math.max(0, value));
    const now = audioContext.currentTime;

    this.highpass.frequency.linearRampToValueAtTime(freq, now + rampTime);
  }

  setLowpassCutoff(freq, rampTime) {
    const cutoff = Math.min(audioContext.sampleRate / 2, Math.max(0, value));
    const now = audioContext.currentTime;

    this.lowpass.frequency.linearRampToValueAtTime(freq, now + rampTime);
  }

}

export default Synth;
