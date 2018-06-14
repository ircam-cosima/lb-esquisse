import { ControllerExperience } from 'soundworks/client';

class GroupFeedback {
  constructor(label) {
    this.label = label;
    this.synths = [];
    this.$container = document.createElement('div');
    this.$container.classList.add('group-feedback');

    const $title = document.createElement('h3');
    $title.textContent = this.label;

    this.$container.appendChild($title);

    for (let i = 0; i < 2; i++) {
      const $synth = document.createElement('div');

      const $state = document.createElement('div');
      $state.classList.add('state');

      const $part = document.createElement('div');
      $part.classList.add('part');

      const $envelop = document.createElement('div');
      $envelop.classList.add('envelop');

      $synth.appendChild($state);
      $synth.appendChild($part);
      $synth.appendChild($envelop);

      this.synths.push({ $state, $part, $envelop });
      this.$container.appendChild($synth);
    }
  }

  get $el() {
    return this.$container;
  }

  setState(synthIndex, active) {
    if (active)
      this.synths[synthIndex].$state.classList.add('active');
    else
      this.synths[synthIndex].$state.classList.remove('active');
  }

  setPart(synthIndex, part) {
    this.synths[synthIndex].$part.textContent = part;
  }

  setEnvelop(synthIndex, value) {
    this.synths[synthIndex].$envelop.textContent = value;
  }
}

class Controller extends ControllerExperience {
  constructor() {
    super({ auth: true });

    this.setGuiOptions('/reload', {
      confirm: true,
    });

    this.setGuiOptions('/state', {
      type: 'buttons',
    });

    this.setGuiOptions('/volume', {
      type: 'slider',
      size: 'large',
    });

    this.setGuiOptions('/group-1/volume', {
      type: 'slider',
      size: 'large',
    });

    this.setGuiOptions('/group-2/volume', {
      type: 'slider',
      size: 'large',
    });

    this.setGuiOptions('/group-3/volume', {
      type: 'slider',
      size: 'large',
    });

    this.groupViews = [];
  }

  start() {
    super.start();

    setTimeout(() => {
      for (let i = 0; i < 3; i++) {
        const groupFeedback = new GroupFeedback(`group-${i + 1}`);
        this.view.$el.appendChild(groupFeedback.$el);

        this.groupViews[i] = groupFeedback;
      }

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 2; j++) {
          this.receive(`/group-${i + 1}/synth/${j}/toggle`, value => {
            if (value === 'start')
              this.groupViews[i].setState(j, true);
            else
              this.groupViews[i].setState(j, false);
          });

          this.receive(`/group-${i + 1}/synth/${j}/parts`, value => {
            this.groupViews[i].setPart(j, value);
          });

          this.receive(`/group-${i + 1}/synth/${j}/envelop`, value => {
            this.groupViews[i].setEnvelop(j, value);
          });
        }
      }
    }, 100);
  }
}

export default Controller;

