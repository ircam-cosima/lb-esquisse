import { audioContext } from 'soundworks/client';

class Synth {
  constructor() {
    this.volume = audioContext.createGain();
    this.volume.gain.value = 0;

    // tremolo
    this.tremolo = audioContext.createGain();
    this.tremolo.connect(this.volume);

    this.depth = audioContext.createGain();
    this.depth.connect(this.tremolo.gain);

    this.rate = audioContext.createOscillator();
    this.rate.connect(this.depth);

    // main oscillator
    this.osc = audioContext.createOscillator();
    this.osc.connect(this.tremolo);
    this.osc.type = 'sine';

    this.osc.start();
    this.rate.start();
  }

  // start() {
  //   if (this.osc)
  //     return;
  //   // tremolo rate
  //   this.rate = audioContext.createOscillator();
  //   this.rate.connect(this.depth);

  //   // main oscillator
  //   this.osc = audioContext.createOscillator();
  //   this.osc.connect(this.tremolo);
  //   this.osc.type = 'sine';

  //   this.osc.start();
  //   this.rate.start();
  //   console.log('start');
  // }

  // stop() {
  //   if (this.osc) {
  //     this.osc.stop();
  //     this.rate.stop();

  //     this.osc = null;
  //     this.rate = null;
  //   }
  // }

  connect(destination) {
    this.volume.connect(destination);
  }

  set frequency(frequency) {
    // if (this.osc) {
      const now = audioContext.currentTime;
      this.osc.frequency.linearRampToValueAtTime(frequency, now + 0.005);
    // }
  }

  set tremoloFrequency(frequency) {
    // if (this.rate) {
      const now = audioContext.currentTime;
      this.rate.frequency.linearRampToValueAtTime(frequency, now + 0.005);
    // }
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
