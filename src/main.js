'use strict';

import * as util from 'util/scene-helpers.js';
import {logFrame} from 'util/fps-counter.js';
import {createSimpleScene} from 'builders/simple-scene-builder.js';
import {createDeferredRenderer} from 'builders/deferred-pass-builder.js';
import {GLContextManager} from 'managers/gl-context-manager.js';

window.onload = function() {
  window.showHUD = true;
  const gl = GLContextManager.gl;
  const overlay = util.getOverlay();
  const scene = createSimpleScene(gl);
  const renderer = createDeferredRenderer(gl, scene);
  drawFrame(gl, overlay, scene.hud, renderer);
};

/**
 * Draw a single frame to the screen and request another.
 * @param {WebGL2RenderingContext} gl the webgl context
 * @param {CanvasRenderingContext2D} overlay the 2d drawing context for the
 *     overlay
 * @param {OverlayGrid} hud the scene's HUD container, for enabling
 * @param {Object} renderer an object with an array of RenderPasses and a
 *     render() method
 */
function drawFrame(gl, overlay, hud, renderer) {
  logFrame(overlay);

  hud.enabled = window.showHUD;

  renderer.render();

  requestAnimationFrame(function() {
    drawFrame(gl, overlay, hud, renderer);
  });
}