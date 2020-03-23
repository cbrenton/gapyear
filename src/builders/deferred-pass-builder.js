'use strict';

import {m4, v3} from 'twgl.js';
import {BufferTarget} from 'render/buffer-target.js';
import {ScreenTarget} from 'render/screen-target.js';
import {ShaderManager} from 'managers/shader-manager.js';
import {RenderPass} from 'render/render-pass.js';

export function createDeferredPasses(gl, sceneManager) {
  const passes = [
    createGBufferPass(gl, sceneManager),
    createLBufferPass(gl, sceneManager),
    createOverlayPass(gl, sceneManager),
  ];

  addPassResultsToOverlay(passes, sceneManager);

  return passes;
}

function addPassResultsToOverlay(renderPasses, sceneManager) {
  sceneManager.addBufferAttachmentsToHUD(renderPasses[0].renderTarget)
  sceneManager.addBufferAttachmentsToHUD(renderPasses[1].renderTarget)
  sceneManager.addScreenAlignedQuad(
      renderPasses[1].renderTarget.colorAttachments.result);
}

/**
 * Create a render pass to hold gbuffer data.
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
 * Create a render pass to hold lighting results.
 * @param {WebGL2RenderingContext} gl
 * @param {SceneManager} sceneManager
 * @return {RenderPass}
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
 * Create a render pass to display overlay geometry.
 * @param {WebGL2RenderingContext} gl
 * @param {SceneManager} sceneManager
 * @return {RenderPass}
 */
function createOverlayPass(gl, sceneManager) {
  const overlayTarget = new ScreenTarget(gl);

  const overlayCamera = {
    viewMatrix: m4.identity(),
    projMatrix: m4.identity(),
    position: v3.create(0, 0, 0),
  };

  const setUp = function(cb_gl) {
    cb_gl.disable(cb_gl.DEPTH_TEST);
    cb_gl.clearColor(0.58, 0.78, 0.85, 1);
    cb_gl.clear(cb_gl.COLOR_BUFFER_BIT | cb_gl.DEPTH_BUFFER_BIT);
  };

  const tearDown = function(cb_gl) {
    cb_gl.enable(cb_gl.DEPTH_TEST);
  };

  const overlayPass = new RenderPass(
      gl, overlayTarget, ShaderManager.shader('flatTexture'),
      sceneManager.geometry.overlay, overlayCamera, setUp, tearDown, {});
  return overlayPass;
}