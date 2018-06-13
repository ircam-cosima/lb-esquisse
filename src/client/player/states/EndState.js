import * as soundworks from 'soundworks/client';
import BaseState from './BaseState';

const template = ``;

const fadeInDuration = 2;
const fadeOutDuration = 0.4;

class EndState extends BaseState {
  constructor(name) {
    super(name);

    this.view = new soundworks.View(template, {}, {}, {
      className: 'state',
      id: this.name,
    });
    this.view.render();
    this.view.$el.style.opacity = 0;
  }

  enter(experience) {
    super.enter(experience);

    this.view.show();
    this.view.appendTo(experience.view.$el);

    setTimeout(() => {
      this.view.$el.style.transition = `opacity ${fadeInDuration}s`;
      this.view.$el.style.opacity = 1;
    }, 100);
  }

  exit(experience) {
    super.exit(experience);

    this.view.$el.style.transition = `opacity ${fadeOutDuration}s`;
    this.view.$el.style.opacity = 0;

    setTimeout(() => {
      this.view.hide();
      this.view.remove();
    }, fadeOutDuration * 1000);
  }
}

export default EndState;
