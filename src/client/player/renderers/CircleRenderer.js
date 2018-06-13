import { Canvas2dRenderer } from 'soundworks/client';

class CircleRenderer extends Canvas2dRenderer {
  constructor(model) {
    super();

    this.model = model;
    this.radius = null;
  }

  init() {
    this.radius = Math.min(this.canvasWidth, this.canvasHeight) / 6;
  }

  render(ctx) {
    const opacity = Math.sqrt(this.model.value);

    if (this.model.state === 'stop' || opacity < 0.001)
      return;

    const x = this.model.x * this.canvasWidth;
    const y = this.model.y * this.canvasHeight;

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = '#ffffff';

    ctx.beginPath();
    ctx.arc(x, y, this.radius, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }
}

export default CircleRenderer;
