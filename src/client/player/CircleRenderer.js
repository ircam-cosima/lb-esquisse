import { Canvas2dRenderer } from 'soundworks/client';


class CircleRenderer extends Canvas2dRenderer {
  constructor(position) {
    super();

    this.position = position;
    this.radius = null;
    this._opacity = 1;

    this.flag = true;
    this._flash = false;
  }

  set opacity(value) {
    this._opacity = Math.max(this._opacity, value);
  }

  init() {
    this.x = this.canvasWidth / 2;
    this.y = this.canvasHeight / 2;
    this.radius = Math.min(this.canvasWidth, this.canvasHeight) / 6;
  }

  update(dt) {
    super.update(dt);
  }

  flash() {
    this._flash = true;
  }

  render(ctx) {
    this.flag = !this.flag;

    if (!this.flag)
      return;

    const width = this.canvasWidth;
    const height = this.canvasHeight;

    ctx.clearRect(0, 0, width, height);

    if (this._flash === true) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      this._flash = false;
    }

    ctx.save();
    const x = this.position.x * width;
    const y = this.position.y * height;

    // const offset = - this.radius / 2;
    // ctx.translate(offset, offset);
    ctx.globalAlpha = this._opacity;
    ctx.fillStyle = '#ffffff';

    ctx.beginPath();
    ctx.arc(x, y, this.radius, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.closePath();

    ctx.restore();
  }
}

export default CircleRenderer;
