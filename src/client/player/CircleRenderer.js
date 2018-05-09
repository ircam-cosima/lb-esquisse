import { Canvas2dRenderer } from 'soundworks/client';


class CircleRenderer extends Canvas2dRenderer {
  constructor(position) {
    super();

    this.position = position;
    this.radius = null;
    this.opacity = 0;

    this.flag = true;
  }

  init() {
    this.x = this.canvasWidth / 2;
    this.y = this.canvasHeight / 2;
    this.radius = Math.min(this.canvasWidth, this.canvasHeight) / 6;
  }

  update(dt) {
    super.update(dt);

    // this.x += this.vx * dt;
    // this.y += this.vy * dt;
    // // clamp to screen
    // this.x = Math.max(0, Math.min(this.canvasWidth, this.x));
    // this.y = Math.max(0, Math.min(this.canvasHeight, this.y));

    // if (this.timeFadeIn < this.fadeInDuration) {
    //   this.timeFadeIn += dt;
    //   this.opacity = Math.min(1, this.timeFadeIn / this.fadeInDuration);
    // } else {
    //   this.opacity = 1;
    // }
  }

  render(ctx) {
    this.flag = !this.flag;

    if (!this.flag)
      return;

    ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    ctx.save();
    const x = this.position.x * this.canvasWidth;
    const y = this.position.y * this.canvasHeight;

    // const offset = - this.radius / 2;
    // ctx.translate(offset, offset);
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = '#ffffff';

    ctx.beginPath();
    ctx.arc(x, y, this.radius, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.closePath();

    ctx.restore();
  }
}

export default CircleRenderer;
