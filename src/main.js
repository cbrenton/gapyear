'use strict';

import * as util from 'util/scene-helpers.js';
import {FPSCounter} from 'util/fps-counter.js';
import {createSimpleScene} from 'builders/simple-scene-builder.js';
import {createDeferredRenderer} from 'builders/deferred-renderer-builder.js';
import {GLContextManager} from 'managers/gl-context-manager.js';
import * as dat from 'dat.gui';

window.onload = function() {
  window.showGBufferData = false;
  var gui = new dat.GUI();
  gui.add(window, 'showGBufferData');
  const gl = GLContextManager.gl;
  const overlay = util.getOverlay();
  const sceneManager = createSimpleScene(gl);
  const renderer = createDeferredRenderer(gl, sceneManager);
  const counter = new FPSCounter(overlay);
  drawFrame(gl, sceneManager, renderer, counter);
};

/**
 * Draw a single frame to the screen and request another.
 * @param {WebGL2RenderingContext} gl the webgl context
 * @param {SceneGraph} graph
 * @param {OverlayGrid} hud the scene's HUD container, for enabling
 * @param {Object} renderer an object with an array of RenderPasses and a
 *     render() method
 * @param {FPSCounter} counter
 */
function drawFrame(gl, sceneManager, renderer, counter) {
  counter.logFrame();

  sceneManager.hud.enabled = window.showGBufferData;

  sceneManager.update(counter.timeSinceStart());

  renderer.render();

  requestAnimationFrame(function() {
    drawFrame(gl, sceneManager, renderer, counter);
  });
}