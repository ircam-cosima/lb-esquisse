class BaseState {
  constructor(name) {
    this.name = name;
  }

  enter(experience) {}

  exit(experience) {}
}

export default BaseState;
