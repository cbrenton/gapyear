'use strict';

import * as util from 'util/scene-helpers.js';
import {logFrame} from 'util/fps-counter.js';
import {SceneGraph} from 'scene/scene-graph.js';
import {Camera} from 'scene/camera.js';

window.onload = function() {
  const label = 'Hello WebGL!';
  const gl = util.createGLCanvas(label);
  const overlay = util.getOverlay();
  const scene = createScene();
  drawFrame(gl, overlay, scene);
};

/**
 * Create a scene graph holding all objects in the scene.
 * @return {SceneGraph} a scene graph containing all lights, geometry, and
 *     cameras
 */
function createScene() {
  const graph = new SceneGraph();
  const aspect =
      parseFloat(gl.canvas.clientWidth) / parseFloat(gl.canvas.clientHeight);
  const eye = [0, 0, 10];
  const target = [0, 0, 0];
  const up = [0, 1, 0];

  const camera = new Camera(eye, target, up, aspect);
  graph.addCamera(camera);
  return graph;
}

/**
 * Draw a single frame to the screen and request another.
 * @param {WebGL2RenderingContext} gl the webgl context
 * @param {CanvasRenderingContext2D} overlay the 2d drawing context for the
 *     overlay
 * @param {SceneGraph} scene the scene graph object
 */
function drawFrame(gl, overlay, scene) {
  logFrame(overlay);

  gl.clearColor(0, 1, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  scene.draw();

  requestAnimationFrame(function() {
    drawFrame(gl, overlay, scene);
  });
}
