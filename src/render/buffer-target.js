'use strict';

import {RenderTargetInterface} from 'render/render-target-interface.js';

export class BufferTarget extends RenderTargetInterface {
  constructor(gl, width, height, colorAttachments, hasDepthAttachment = true) {
    super(gl, width, height);
    this.colorAttachments = {};
    this.depthAttachment = null;
    this.createFBO_(colorAttachments, hasDepthAttachment);
  }

  setUp() {
    if (this.fbo === undefined) {
      throw new Error('calling setUp() with undefined FBO');
    }
    this.bindFBO_(this.fbo);
    this.gl.viewport(0, 0, this.width, this.height);
  }

  tearDown() {
    this.unbindFBO_();
  }

  /**
   * Create the framebuffer object for this target and initialize all of its
   * attachments.
   * @param {string[]} colorAttachments
   * @param {bool} hasDepthAttachment
   */
  createFBO_(colorAttachments, hasDepthAttachment) {
    this.fbo = this.gl.createFramebuffer();

    this.setUp();
    this.createColorAttachments_(colorAttachments);
    if (hasDepthAttachment) {
      this.createDepthAttachment_();
    }
    this.setDrawBuffers_();
    this.tearDown();

    this.validateFBO_();
  }

  /**
   * Initializes and binds a texture for each named colorAttachment.
   * Warning: will unbind texture.
   * @param {string[]} colorAttachments
   */
  createColorAttachments_(colorAttachments) {
    const gl = this.gl;
    for (let i = 0; i < colorAttachments.length; ++i) {
      const attachmentName = colorAttachments[i];
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(
          gl.TEXTURE_2D, 0, gl.RGB, this.width, this.height, 0, gl.RGB,
          gl.UNSIGNED_BYTE, null);
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
  createDepthAttachment_() {
    const gl = this.gl;
    const depth = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, depth);
    gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT32F, this.width, this.height, 0,
        gl.DEPTH_COMPONENT, gl.FLOAT, null);
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depth, 0);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

    this.depthAttachment = depth;

    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  /**
   * Sets the gl draw buffers for this render target's FBO.
   * @param {string[]} colorAttachments
   */
  setDrawBuffers_() {
    const numAttachments = Object.keys(this.colorAttachments).length;
    const buffers = [];
    for (let i = 0; i < numAttachments; ++i) {
      buffers.push(this.gl.COLOR_ATTACHMENT0 + i);
    }
    gl.drawBuffers(buffers);
  }

  /**
   * Make sure the current FBO is valid according to the WebGL specification.
   */
  validateFBO_() {
    const gl = this.gl;
    this.bindFBO_();
    const e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (e !== gl.FRAMEBUFFER_COMPLETE) {
      throw new Error(`incomplete fbo: ${e.toString()}`);
    }
    this.unbindFBO_();
  }

  bindFBO_() {
    if (this.fbo === undefined) {
      throw new Error('FBO has not yet been created');
    }
    this.gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
  }

  unbindFBO_() {
    this.gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
}
