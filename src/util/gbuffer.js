'use strict';

export class GBuffer {
  constructor(gl) {
    this.gl = gl;
    this.w = this.gl.canvas.clientWidth;
    this.h = this.gl.canvas.clientHeight;
    this.fbo = null;
    this.colorAttachments = {};
  }

  /**
   * Initialize class members. Create all color and depth attachments, then
   * validate the framebuffer.
   * Warning: will unbind texture.
   * @param {string[]} colorAttachments
   */
  init(colorAttachments) {
    this.fbo = this.gl.createFramebuffer();

    this.bindAndSetViewport();
    this.initColorAttachments(colorAttachments);
    this.initDepthAttachment();
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
      const attachment = colorAttachments[i];
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(
          gl.TEXTURE_2D, 0, gl.RGB, this.w, this.h, 0, gl.RGB, gl.UNSIGNED_BYTE,
          null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.framebufferTexture2D(
          gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, tex, 0);

      this.colorAttachments[attachment] = tex;
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