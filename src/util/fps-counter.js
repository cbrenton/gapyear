'use strict';

export class FPSCounter {
  constructor(textContext, bufferSize = 100) {
    this.context = textContext;
    this.startTime = performance.now();
    this.lastFrameTime = this.startTime;
    this.bufferSize = bufferSize;
    this.buffer = new Array(this.bufferSize);
    this.maxIndexSeen = 0;
    this.runningSum =
        0;  // so we don't have to constantly sum all buffer elements
    this.frameIndex = 0;  // circle buffer index
  }

  timeSinceStart() {
    return this.lastFrameTime - this.startTime;
  }

  lastFrameDelta() {
    const lastFrameIndex =
        (this.frameIndex + this.bufferSize) % this.bufferSize;
    return this.buffer[this.frameIndex] - this.buffer[lastFrameIndex];
  }

  /**
   * @return {float} time in ms since last frame
   */
  logFrame() {
    const time = performance.now();
    if (this.startTime === 0) {
      this.startTime = time;
    }

    // Figure out if an entry needs to be removed from the historical render
    // times
    const toBeRemoved = this.buffer[this.frameIndex] || 0;

    // Calculate the current time to render (time elapsed since last frame)
    const diff = time - this.lastFrameTime;
    // Record the current time to render, then update running sum
    this.buffer[this.frameIndex] = diff;
    this.runningSum -= toBeRemoved;
    this.runningSum += diff;

    // Increment frameIndex along circular buffer
    this.frameIndex = (this.frameIndex + 1) % this.bufferSize;
    this.maxIndexSeen = Math.max(this.frameIndex, this.maxIndexSeen);

    // Update time of last recorded frame and draw FPS
    this.lastFrameTime = time;
    const renderTime = this.runningSum / this.maxIndexSeen;
    drawFPS(this.context, renderTime.toFixed(2));
    return diff;
  }
}

function drawFPS(ctx, renderTime) {
  // Resize overlay to true size (makes text smaller and sharper)
  ctx.canvas.width = ctx.canvas.clientWidth;
  ctx.canvas.height = ctx.canvas.clientHeight;

  // Clear the overlay canvas
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Update display
  const fps = parseInt(1000.0 / renderTime);
  const displayStr = `${renderTime} ms / ${fps} fps`;
  const text = ctx.measureText(displayStr);

  // Calculate text bounds
  const textHeight =
      text.actualBoundingBoxAscent + text.actualBoundingBoxDescent;
  const xOffset = 10;
  const yOffset = ctx.canvas.clientHeight - textHeight - 5;
  const yBuffer = 4;
  const xBuffer = 2;

  // Draw white rect
  ctx.fillStyle = 'white';
  ctx.fillRect(
      xOffset - xBuffer / 2, yOffset - textHeight - yBuffer / 2,
      text.width + xBuffer, textHeight + yBuffer);

  // Draw black text
  ctx.fillStyle = 'black';
  ctx.fillText(displayStr, xOffset, yOffset);
}