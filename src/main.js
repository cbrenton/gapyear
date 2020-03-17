'use strict';

import * as util from 'util/scene-helpers.js';
import {GBuffer} from 'util/gbuffer.js';
import {logFrame} from 'util/fps-counter.js';
import {createSimpleScene, createTextures} from 'scene/simple-scene.js';

window.onload = function() {
  const label = 'Hello WebGL!';
  const gl = util.createGLCanvas(label);
  const overlay = util.getOverlay();
  const sceneInfo = createSceneInfo(gl);
  window.showHUD = true;
  drawFrame(gl, overlay, sceneInfo);
};

/**
 * Create a scene graph holding all objects in the scene.
 * @return {SimpleScene}
 */
function createSceneInfo(gl) {
  const result = {};
  result.textures = createTextures(gl);
  result.render = {
    gbuffer: createGBuffer(gl),
  };
  result.graph = createSimpleScene(gl, result.textures);
  result.graph.addGBufferToOverlay(result.render.gbuffer)
  return result;
}

/**
 * Create and initialize a gbuffer. Uses only one attachment for now.
 * @param {WebGL2RenderingContext} gl
 * @return {GBuffer}
 */
function createGBuffer(gl) {
  const attachments = ['albedo', 'normal', 'shininess'];
  const gbuffer = new GBuffer(gl);
  gbuffer.init(attachments);
  return gbuffer;
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

  renderToBuffer(gl, sceneInfo.graph, sceneInfo.render.gbuffer);

  renderOverlayToScreen(gl, sceneInfo.graph);

  requestAnimationFrame(function() {
    drawFrame(gl, overlay, sceneInfo);
  });
}

/**
 * Render to the screen, not a framebuffer.
 * @param {WebGL2RenderingContext} gl
 * @param {SceneGraph} graph
 */
function renderToScreen(gl, graph) {
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0.58, 0.78, 0.85, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  graph.draw(gl);
}

function renderOverlayToScreen(gl, graph) {
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0.58, 0.78, 0.85, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  graph.drawOverlay(gl);
}

/**
 * Render to a framebuffer, not the screen.
 * @param {WebGL2RenderingContext} gl
 * @param {SceneGraph} graph
 * @param {GBuffer} buffer
 */
function renderToBuffer(gl, graph, buffer) {
  buffer.bindAndSetViewport();
  gl.clearColor(0.58, 0.78, 0.85, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  graph.draw(gl);
  buffer.unbind();
}