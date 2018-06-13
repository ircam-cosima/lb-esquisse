class Osc {
  constructor(frequency) {
    this.frequency = frequency;
  }

  process(time) {
    return Math.sin(time * this.frequency * 2 * Math.PI);
  }
}

export default Osc;
