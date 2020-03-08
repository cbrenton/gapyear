'use strict';

import * as util from 'util/scene-helpers.js';
import {logFrame} from 'util/fps-counter.js';
import {createSimpleScene} from 'scene/simple-scene.js';

window.onload = function() {
  const label = 'Hello WebGL!';
  const gl = util.createGLCanvas(label);
  const overlay = util.getOverlay();
  const sceneInfo = createSceneInfo(gl);
  drawFrame(gl, overlay, sceneInfo);
};

/**
 * Create a scene graph holding all objects in the scene.
 * @return {SimpleScene}
 */
function createSceneInfo(gl) {
  return {
    graph: createSimpleScene(gl), render: {},
  }
}

/**
 * Draw a single frame to the screen and request another.
 * @param {WebGL2RenderingContext} gl the webgl context
 * @param {CanvasRenderingContext2D} overlay the 2d drawing context for the
 *     overlay
 * @param {Object} sceneInfo
 */
function drawFrame(gl, overlay, sceneInfo) {
  logFrame(overlay);

  gl.clearColor(0.58, 0.78, 0.85, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  sceneInfo.graph.draw(gl);

  requestAnimationFrame(function() {
    drawFrame(gl, overlay, sceneInfo);
  });
}