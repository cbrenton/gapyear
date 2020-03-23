'use strict';

import {BufferTarget} from './buffer-target';

export class GBuffer {
  constructor(gl, programInfo) {
    this.gl = gl;
    this.w = this.gl.canvas.clientWidth;
    this.h = this.gl.canvas.clientHeight;
    this.fbo = null;
    this.programInfo = programInfo;
  }

  /**
   * Initialize class members. Create all color and depth attachments, then
   * validate the framebuffer.
   * Warning: will unbind texture.
   * @param {string[]} colorAttachments
   * @param {string} geometryType one of 'main', 'overlay', or 'lights'
   */
  init(colorAttachments, geometryType) {
    this.renderTarget =
        new BufferTarget(this.gl, this.w, this.h, colorAttachments, true);

    // @TODO: make this not hardcoded
    const types = {main: 0, lights: 0};
    if (!(geometryType in types)) {
      throw new Error(`g-buffer geometry type "${geometryType}" unsupported`);
    }
    this.geometryType = geometryType;
  }

  bindAndSetViewport() {
    this.renderTarget.setUp();
  }

  unbind() {
    this.renderTarget.tearDown();
  }

  get colorAttachments() {
    return this.renderTarget.colorAttachments;
  }

  get depthAttachment() {
    return this.renderTarget.depthAttachment;
  }
}