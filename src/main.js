'use strict';

import * as util from 'util/scene-helpers.js';
import {FPSCounter} from 'util/fps-counter.js';
import {createSimpleScene} from 'builders/simple-scene-builder.js';
import {createDeferredRenderer} from 'builders/deferred-renderer-builder.js';
import {GLContextManager} from 'managers/gl-context-manager.js';

window.onload = function() {
  window.showHUD = true;
  const gl = GLContextManager.gl;
  const overlay = util.getOverlay();
  const scene = createSimpleScene(gl);
  const renderer = createDeferredRenderer(gl, scene);
  const counter = new FPSCounter(overlay);
  drawFrame(gl, scene.hud, renderer, counter);
};

/**
 * Draw a single frame to the screen and request another.
 * @param {WebGL2RenderingContext} gl the webgl context
 * @param {OverlayGrid} hud the scene's HUD container, for enabling
 * @param {Object} renderer an object with an array of RenderPasses and a
 *     render() method
 * @param {FPSCounter} counter
 */
function drawFrame(gl, hud, renderer, counter) {
  counter.logFrame();

  hud.enabled = window.showHUD;

  renderer.render();

  requestAnimationFrame(function() {
    drawFrame(gl, hud, renderer, counter);
  });
}