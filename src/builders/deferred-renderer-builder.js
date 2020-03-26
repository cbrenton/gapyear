'use strict';

import {m4, v3} from 'twgl.js';
import {BufferTarget} from 'render/buffer-target.js';
import {ScreenTarget} from 'render/screen-target.js';
import {ShaderManager} from 'managers/shader-manager.js';
import {RenderPass} from 'render/render-pass.js';

export function createDeferredRenderer(gl, sceneManager) {
  const renderer = {
    passes: createPasses(gl, sceneManager),
    render: function() {
      for (const renderPass of this.passes) {
        renderPass.render();
      }
    }
  };

  addPassResultsToOverlay(renderer.passes, sceneManager);

  return renderer;
}

function createPasses(gl, sceneManager) {
  const gBufferPass = createGBufferPass(gl, sceneManager);
  const lBufferPass =
      createLBufferPass(gl, sceneManager, gBufferPass.renderTarget);
  const overlayPass = createOverlayPass(gl, sceneManager);
  return [
    gBufferPass,
    lBufferPass,
    overlayPass,
  ];
}

function addPassResultsToOverlay(renderPasses, sceneManager) {
  sceneManager.addBufferAttachmentsToHUD(renderPasses[0].renderTarget)
  sceneManager.addTextureToHUD(
      renderPasses[1].renderTarget.colorAttachments.lightGeometry);
  sceneManager.addScreenAlignedQuad(
      renderPasses[1].renderTarget.colorAttachments.lightingResult);
}

/**
 * Create a render pass to hold gbuffer data.
 * @param {WebGL2RenderingContext} gl
 * @param {SceneManager} sceneManager
 * @return {RenderPass}
 */
function createGBufferPass(gl, sceneManager) {
  const attachments = ['albedo', 'normal', 'specular', 'position'];
  const gBufferTarget = new BufferTarget(
      gl, gl.canvas.clientWidth, gl.canvas.clientHeight, attachments);

  const setUp = function() {
    // Doesn't really matter, but we'll set it for now since
    // the position buffer makes things kinda nasty
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
  };

  const tearDown = function() {};

  const gBufferPass = new RenderPass(
      gBufferTarget, ShaderManager.shader('gBuffer'),
      sceneManager.geometry.main, sceneManager.cameras[0], setUp, tearDown, {});
  return gBufferPass;
}

/**
 * Create a render pass to hold lighting results.
 * @param {WebGL2RenderingContext} gl
 * @param {SceneManager} sceneManager
 * @param {BufferTarget} gbuffer the FBO from the gbuffer pass
 * @return {RenderPass}
 */
function createLBufferPass(gl, sceneManager, gbuffer) {
  const attachments = ['lightingResult', 'lightGeometry'];
  const lBufferTarget = new BufferTarget(
      gl, gl.canvas.clientWidth, gl.canvas.clientHeight, attachments);

  const setUp = function() {
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.FRONT);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendEquation(gl.FUNC_ADD);
    gl.blendFunc(gl.ONE, gl.ONE);
  };

  const tearDown = function() {
    gl.disable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.disable(gl.BLEND);
  };

  const uniforms = {
    u_albedoTexture: gbuffer.colorAttachments.albedo,
    u_normalTexture: gbuffer.colorAttachments.normal,
    u_specularTexture: gbuffer.colorAttachments.specular,
    u_positionTexture: gbuffer.colorAttachments.position,
  };

  const lBufferPass = new RenderPass(
      lBufferTarget, ShaderManager.shader('lBuffer'),
      sceneManager.geometry.lights, sceneManager.cameras[0], setUp, tearDown,
      uniforms);
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

  const setUp = function() {
    gl.disable(gl.DEPTH_TEST);
    gl.clearColor(0.58, 0.78, 0.85, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  };

  const tearDown = function() {
    gl.enable(gl.DEPTH_TEST);
  };

  const overlayPass = new RenderPass(
      overlayTarget, ShaderManager.shader('flatTexture'),
      sceneManager.geometry.overlay, overlayCamera, setUp, tearDown, {});
  return overlayPass;
}