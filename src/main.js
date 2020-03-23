'use strict';

import * as util from 'util/scene-helpers.js';
import {logFrame} from 'util/fps-counter.js';
import {createSimpleScene} from 'scene/simple-scene.js';
import {TextureManager} from 'managers/texture-manager.js';
import {ShaderManager} from 'managers/shader-manager.js';
import {GLContextManager} from 'managers/gl-context-manager.js';
import {RenderPass} from 'render/render-pass.js';
import {BufferTarget} from 'render/buffer-target.js';

window.onload = function() {
  const gl = GLContextManager.gl;
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
  result.graph = createSimpleScene(gl, TextureManager.textures);
  result.renderPasses = [
    createGBufferPass(gl, result.graph),
    createLBufferPass(gl, result.graph),
  ];
  result.graph.addGBufferToHUD(result.renderPasses[0].renderTarget)
  result.graph.addScreenAlignedQuad(
      result.renderPasses[1].renderTarget.colorAttachments.result);
  return result;
}

/**
 * Create and initialize the gbuffer rendering pass.
 * @param {WebGL2RenderingContext} gl
 * @param {SceneManager} sceneManager
 * @return {RenderPass}
 */
function createGBufferPass(gl, sceneManager) {
  const attachments = ['albedo', 'normal', 'shininess'];
  const gBufferTarget = new BufferTarget(
      gl, gl.canvas.clientWidth, gl.canvas.clientHeight, attachments);

  const setUp = function(cb_gl) {
    cb_gl.clearColor(0.58, 0.78, 0.85, 1);
    cb_gl.clear(cb_gl.COLOR_BUFFER_BIT | cb_gl.DEPTH_BUFFER_BIT);
    cb_gl.enable(cb_gl.DEPTH_TEST);
  };

  const tearDown = function() {};

  const gBufferPass = new RenderPass(
      gl, gBufferTarget, ShaderManager.shader('gBuffer'),
      sceneManager.geometry.main, sceneManager.cameras[0], setUp, tearDown, {});
  return gBufferPass;
}

/**
 * Create and initialize a gbuffer for lighting results.
 * // @TODO update docstring
 * @param {WebGL2RenderingContext} gl
 * @return {GBuffer}
 */
function createLBufferPass(gl, sceneManager) {
  const attachments = ['result'];
  const lBufferTarget = new BufferTarget(
      gl, gl.canvas.clientWidth, gl.canvas.clientHeight, attachments);

  const setUp = function(cb_gl) {
    cb_gl.clearColor(0.58, 0.78, 0.85, 1);
    cb_gl.clear(cb_gl.COLOR_BUFFER_BIT | cb_gl.DEPTH_BUFFER_BIT);
    cb_gl.enable(cb_gl.DEPTH_TEST);
  };

  const tearDown = function() {};

  const lBufferPass = new RenderPass(
      gl, lBufferTarget, ShaderManager.shader('lBuffer'),
      sceneManager.geometry.lights, sceneManager.cameras[0], setUp, tearDown,
      {});
  return lBufferPass;
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

  renderOverlayToScreen(gl, sceneInfo.graph);

  requestAnimationFrame(function() {
    drawFrame(gl, overlay, sceneInfo);
  });
}

function renderOverlayToScreen(gl, graph) {
  gl.viewport(0, 0, gl.canvas.clientWidth, gl.canvas.clientHeight);
  gl.clearColor(0.58, 0.78, 0.85, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  graph.drawOverlay();
}

/**
 * Render to a framebuffer, not the screen.
 * @param {WebGL2RenderingContext} gl
 * @param {SceneManager} graph
 * @param {GBuffer} buffer
 */
function renderToBuffer(gl, graph, buffer) {
  buffer.bindAndSetViewport();
  gl.clearColor(0.58, 0.78, 0.85, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  graph.draw(buffer.geometryType, buffer.programInfo);
  buffer.unbind();
}