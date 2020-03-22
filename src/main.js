'use strict';

import * as util from 'util/scene-helpers.js';
import {GBuffer} from 'util/gbuffer.js';
import {logFrame} from 'util/fps-counter.js';
import {createSimpleScene} from 'scene/simple-scene.js';
import {TextureManager} from 'managers/texture-manager.js';
import {ShaderManager} from 'managers/shader-manager.js';
import {GLContextManager} from 'managers/gl-context-manager.js';

window.onload = function() {
  GLContextManager.init('Hello WebGL!');
  TextureManager.init();
  ShaderManager.init();
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
  result.render = {
    gbuffer: createGBuffer(gl),
    lbuffer: createLBuffer(gl),
  };
  result.graph = createSimpleScene(gl, TextureManager.textures);
  result.graph.addScreenAlignedQuad(
      result.render.lbuffer.colorAttachments.result);
  result.graph.addGBufferToHUD(result.render.gbuffer)
  return result;
}

/**
 * Create and initialize a gbuffer.
 * @param {WebGL2RenderingContext} gl
 * @return {GBuffer}
 */
function createGBuffer(gl) {
  const attachments = ['albedo', 'normal', 'shininess'];
  const gbuffer = new GBuffer(gl, ShaderManager.get('gBuffer'));
  gbuffer.init(attachments, 'main');
  return gbuffer;
}

/**
 * Create and initialize a gbuffer for lighting results.
 * @param {WebGL2RenderingContext} gl
 * @return {GBuffer}
 */
function createLBuffer(gl) {
  const attachments = ['result'];
  const lbuffer = new GBuffer(gl, ShaderManager.get('lBuffer'));
  lbuffer.init(attachments, 'lights');
  return lbuffer;
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
  renderToBuffer(gl, sceneInfo.graph, sceneInfo.render.lbuffer);

  renderOverlayToScreen(gl, sceneInfo.graph);

  requestAnimationFrame(function() {
    drawFrame(gl, overlay, sceneInfo);
  });
}

function renderOverlayToScreen(gl, graph) {
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0.58, 0.78, 0.85, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  graph.drawOverlay();
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

  graph.draw(buffer.geometryType, buffer.programInfo);
  buffer.unbind();
}