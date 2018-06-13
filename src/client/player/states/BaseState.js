

class BaseState {
  constructor(name) {
    this.name = name;
  }

  enter(experience) {
    console.log('enter', this.name);
  }

  exit(experience) {
    console.log('exit', this.name);
  }
}

export default BaseState;
