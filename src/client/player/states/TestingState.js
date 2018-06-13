import * as soundworks from 'soundworks/client';
import BaseState from './BaseState';
import BufferSynth from '../audio/BufferSynth';

const audioContext = soundworks.audioContext;
const template = ``;

class TestState extends BaseState {
  constructor(name) {
    super(name);

    this.view = new soundworks.View(template, {}, {}, {
      className: 'state',
      id: this.name,
    });
    this.view.render();
    this.view.$el.style.opacity = 0;

    this.synth = null;
  }

  enter(experience) {
    super.enter(experience);

    this.view.show();
    this.view.appendTo(experience.view.$el);

    const testBuffer = experience.audioBufferManager.data['testing'];
    const fadeInDuration = 2;

    this.synth = new BufferSynth(testBuffer);
    this.synth.connect(experience.masterBus);
    this.synth.start(audioContext.currentTime, fadeInDuration);

    setTimeout(() => {
      this.view.$el.style.transition = `opacity ${fadeInDuration}s`;
      this.view.$el.style.opacity = 1;
    }, 100);
  }

  exit(experience) {
    super.exit(experience);

    const delay = Math.random() * 4;
    const fadeOutDuration = Math.random() * 4 + 2;

    setTimeout(() => {
      this.synth.stop(audioContext.currentTime, fadeOutDuration);

      this.view.$el.style.transition = `opacity ${fadeOutDuration}s`;
      this.view.$el.style.opacity = 0;

      setTimeout(() => {
        this.view.hide();
        this.view.remove();
      }, fadeOutDuration * 1000);
    }, delay * 1000);
  }

}

export default TestState;
