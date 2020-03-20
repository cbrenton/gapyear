'use strict';

import {createShaders} from 'util/scene-helpers.js';

export class GBuffer {
  constructor(gl, shader) {
    this.gl = gl;
    this.w = this.gl.canvas.clientWidth;
    this.h = this.gl.canvas.clientHeight;
    this.fbo = null;
    this.programInfo = createShaders(this.gl, shader);
    this.colorAttachments = {};
  }

  /**
   * Initialize class members. Create all color and depth attachments, then
   * validate the framebuffer.
   * Warning: will unbind texture.
   * @param {string[]} colorAttachments
   * @param {string} geometryType one of 'main', 'overlay', or 'lights'
   */
  init(colorAttachments, geometryType) {
    this.fbo = this.gl.createFramebuffer();
    // @TODO: make this not hardcoded
    const types = {main: 0, lights: 0};
    if (!(geometryType in types)) {
      throw new Error(`g-buffer geometry type "${geometryType}" unsupported`);
    }
    this.geometryType = geometryType;

    this.bindAndSetViewport();
    this.initColorAttachments(colorAttachments);
    this.initDepthAttachment();
    this.setDrawBuffers();

    this.unbind();

    this.validate();
  }

  /**
   * Initializes and binds a texture for each named colorAttachment.
   * Warning: will unbind texture.
   * @param {string[]} colorAttachments
   */
  initColorAttachments(colorAttachments) {
    const gl = this.gl;
    for (let i = 0; i < colorAttachments.length; ++i) {
      const attachmentName = colorAttachments[i];
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(
          gl.TEXTURE_2D, 0, gl.RGB, this.w, this.h, 0, gl.RGB, gl.UNSIGNED_BYTE,
          null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.framebufferTexture2D(
          gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, tex, 0);

      this.colorAttachments[attachmentName] = tex;
    }
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  /**
   * Initializes and binds a depth texture.
   * Warning: will unbind texture.
   */
  initDepthAttachment() {
    const gl = this.gl;
    const depth = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, depth);
    gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT32F, this.w, this.h, 0,
        gl.DEPTH_COMPONENT, gl.FLOAT, null);
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depth, 0);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

    this.depthAttachment = depth;

    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  setDrawBuffers() {
    const numAttachments = Object.keys(this.colorAttachments).length;
    const buffers = [];
    for (let i = 0; i < numAttachments; ++i) {
      buffers.push(this.gl.COLOR_ATTACHMENT0 + i);
    }
    gl.drawBuffers(buffers);
  }

  bindAndSetViewport() {
    this.gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    this.gl.viewport(0, 0, this.w, this.h);
  }

  unbind() {
    this.gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  validate() {
    const gl = this.gl;
    this.bindAndSetViewport();
    const e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (e !== gl.FRAMEBUFFER_COMPLETE) {
      throw Error(`incomplete fbo: ${e.toString()}`);
    }
    this.unbind();
  }
}