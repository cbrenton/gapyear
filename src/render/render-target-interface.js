'use strict';

export class RenderTargetInterface {
  constructor(gl, width, height) {
    this.gl = gl;
    this.width = width;
    this.height = height;
  }

  /**
   * Responsible at the minimum for setting the viewport and binding any
   * framebuffers.
   */
  setUp() {
    throw new Error('unimplemented setUp() method');
  }

  /**
   * Responsible at the minimum for unbinding any framebuffers.
   */
  tearDown() {
    throw new Error('unimplemented tearDown() method');
  }
}
