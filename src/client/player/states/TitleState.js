import * as soundworks from 'soundworks/client';
import BaseState from './BaseState';

const fadeOutDuration = 2;

const template = `
  <div class="section-top"></div>
  <div class="section-center flex-center">
    <div>
      <h1>Color Fields</h1>
      <h2>Luciano Leite Barbosa</h2>
    </div>
  </div>
  <div class="section-bottom"></div>
`;

class TitleState extends BaseState {
  constructor(name) {
    super(name);

    this.view = new soundworks.SegmentedView(template, {}, {}, {
      className: 'state',
      id: this.name,
    });
    this.view.render();
  }

  enter(experience) {
    super.enter(experience);

    this.view.show();
    this.view.appendTo(experience.view.$el);
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

export default TitleState;
