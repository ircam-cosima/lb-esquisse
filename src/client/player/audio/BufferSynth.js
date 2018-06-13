import { audio } from 'soundworks/client';

const audioContext = audio.audioContext;

class BufferSynth {
  constructor(buffer) {
    this.buffer = buffer;

    this.env = audioContext.createGain();
    this.env.gain.value = 0;
    this.env.gain.setValueAtTime(0, audioContext.currentTime);

    this.src = null;
  }

  connect(destination) {
    this.env.connect(destination);
  }

  start(time, fadeInDuration) {
    if (this.src === null) {
      this.src = audioContext.createBufferSource();
      this.src.connect(this.env);
      this.src.buffer = this.buffer;
      this.src.loop = true;

      this.env.gain.setValueAtTime(0, time);
      this.env.gain.linearRampToValueAtTime(1, time + fadeInDuration);

      this.src.start(time);
    }
  }

  stop(time, fadeOutDuration) {
    if (this.src !== null) {
      this.env.gain.setValueAtTime(this.env.gain.value, time);
      this.env.gain.linearRampToValueAtTime(0, time + fadeOutDuration);

      this.src.stop(time + fadeOutDuration);
      this.src.onended = () => {
        this.env.disconnect();
        this.src = null;
      };
    }
  }
}

export default BufferSynth;
