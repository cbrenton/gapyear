'use strict';

const nFrames = 100;  // Keep track of the last n render times
let lastNTimes =
    new Array(nFrames);  // Store per-frame render times in circular buffer

let lastFrameTime = 0;  // When the last frame was rendered
let nTimeSum = 0;  // Keep a running sum so we don't have to constantly sum all
                   // buffer elements
let frameIndex = 0;  // Index of the current frame

/**
 * Add the current render time to the circular buffer and return the current
 * average render time.
 * @return time since last frame
 */
export function logFrame(textContext) {
  // Get current time
  const time = performance.now();

  // Figure out if an entry needs to be removed from the historical render times
  let toBeRemoved = lastNTimes[frameIndex];
  let isUnset = false;

  // If the time to be removed is undefined, we haven't looped through the
  // buffer yet
  if (toBeRemoved === undefined) {
    toBeRemoved = 0;
    isUnset = true;
  }

  // Calculate the current time to render (time elapsed since last frame)
  const diff = time - lastFrameTime;
  // Record the current time to render, then update running sum
  lastNTimes[frameIndex] = diff;
  nTimeSum -= toBeRemoved;
  nTimeSum += diff;

  // Increment frameIndex along circular buffer
  frameIndex = (frameIndex + 1) % nFrames;

  // Update time of last recorded frame and draw FPS
  lastFrameTime = time;
  if (!isUnset) {
    const renderTime = nTimeSum / nFrames;
    drawFPS(textContext, renderTime.toFixed(2));
  } else {
    const renderTimeSoFar = nTimeSum / frameIndex;
    drawFPS(textContext, renderTimeSoFar.toFixed(2));
  }
  return diff;
}

function drawFPS(ctx, renderTime) {
  const fps = parseInt(1000.0 / renderTime);

  // Resize overlay to true size (makes text smaller and sharper)
  ctx.canvas.width = ctx.canvas.clientWidth;
  ctx.canvas.height = ctx.canvas.clientHeight;

  // Clear the overlay canvas
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
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