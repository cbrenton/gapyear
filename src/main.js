'use strict';

import * as util from 'util/scene-helpers.js';
import {logFrame} from 'util/fps-counter.js';
import {createSimpleScene} from 'builders/simple-scene-builder.js';
import {createDeferredPasses, addPassResultsToOverlay} from 'builders/deferred-pass-builder.js';
import {TextureManager} from 'managers/texture-manager.js';
import {GLContextManager} from 'managers/gl-context-manager.js';

window.onload = function() {
  const gl = GLContextManager.gl;
  const overlay = util.getOverlay();
  const sceneInfo = createSceneInfo(gl);
  window.showHUD = true;
  drawFrame(gl, overlay, sceneInfo);
};

/**
 * Create a scene graph holding all objects in the scene.
 * @return {Object}
 */
function createSceneInfo(gl) {
  const result = {};
  result.graph = createSimpleScene(gl, TextureManager.textures);
  result.renderPasses = createDeferredPasses(gl, result.graph);
  addPassResultsToOverlay(result.renderPasses, result.graph);
  return result;
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

  sceneInfo.graph.hud.enabled = window.showHUD;

  for (const pass of sceneInfo.renderPasses) {
    pass.render();
  }

  requestAnimationFrame(function() {
    drawFrame(gl, overlay, sceneInfo);
  });
}