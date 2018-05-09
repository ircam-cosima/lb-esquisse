import { audioContext } from 'soundworks/client';

class Synth {
  constructor() {
    const now = audioContext.currentTime;

    this.volume = audioContext.createGain();
    this.volume.gain.value = 0;
    this.volume.gain.setValueAtTime(0, now);

    // tremolo
    this.tremolo = audioContext.createGain();
    this.tremolo.connect(this.volume);

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
    this.volume.connect(destination);
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

  set gain(gain) {
    const now = audioContext.currentTime;
    this.volume.gain.linearRampToValueAtTime(gain, now + 0.005);
  }

  set tremoloDepth(depth) {
    const now = audioContext.currentTime;
    this.depth.gain.linearRampToValueAtTime(depth, now + 0.005);
    this.tremolo.gain.linearRampToValueAtTime(1 - depth, now + 0.005);
  }

}

export default Synth;
