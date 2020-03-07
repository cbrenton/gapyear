'use strict';

import * as util from 'util/scene-helpers.js';
import {logFrame} from 'util/fps-counter.js';
import {SceneGraph} from 'scene/scene-graph.js';

window.onload = function() {
  const label = 'Hello WebGL!';
  const gl = util.createGLCanvas(label);
  const overlay = util.getOverlay();
  const scene = createScene();
  drawFrame(gl, overlay, null, scene);
};

function createScene() {
  return new SceneGraph();
}

function drawFrame(gl, overlay, programInfos, scene) {
  logFrame(overlay);

  gl.clearColor(1, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  scene.draw();

  requestAnimationFrame(function() {
    drawFrame(gl, overlay, null, scene);
  });
}
