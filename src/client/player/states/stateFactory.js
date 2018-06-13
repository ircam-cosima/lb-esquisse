import TestingState from './TestingState';
import TitleState from './TitleState';
import PerformanceState from './PerformanceState';
import EndState from './EndState';

const states = {
  'testing': TestingState,
  'title': TitleState,
  'performance': PerformanceState,
  'end': EndState,
};

const stateFactory = {
  get(name, ...args) {
    if (!states[name])
      throw new Error(`Undefined state ${name}`);

    const ctor = states[name]
    const state = new ctor(name, ...args);

    return state;
  },
};

export default stateFactory;
