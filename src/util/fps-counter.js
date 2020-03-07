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
}

function drawFPS(textContext, renderTime) {
  const fps = parseInt(1000.0 / renderTime);
  const yOffset = textContext.canvas.clientHeight - 10;

  // Resize overlay to true size (makes text smaller and sharper)
  textContext.canvas.width = textContext.canvas.clientWidth;
  textContext.canvas.height = textContext.canvas.clientHeight;
  // Clear the overlay canvas
  textContext.clearRect(
      0, 0, textContext.canvas.width, textContext.canvas.height);
  // Write text to overlay
  textContext.fillText(`${renderTime} ms / ${fps} fps`, 10, yOffset);
}