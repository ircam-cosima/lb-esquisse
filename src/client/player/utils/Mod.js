/**
 * Modulate a value in a given range, around a given offset
 */
class Mod {
  constructor() {
    this._offset = 0;
    this._lower = 0;
    this._upper = 0;
    this._linearTransform = null;

    this._updateLinearTransform();
  }

  _updateLinearTransform() {
    const a = this._upper - this._lower; // dx === 1;
    const b = this._lower;

    this._linearTransform = x => a * x + b;
  }

  set offset(offset) {
    this._offset = offset;
    this._updateLinearTransform();
  }

  set min(min) {
    this._lower = min;
    this._updateLinearTransform();
  }

  set max(max) {
    this._upper = max;
    this._updateLinearTransform();
  }

  set range(range) {
    this._lower = range[0];
    this._uppper = range[1];
    this._updateLinearTransform();
  }

  /**
   * Process a normalized value
   */
  process(value) {
    const decay = this._linearTransform(value);
    return this._offset + decay;
  }
}

export default Mod;
