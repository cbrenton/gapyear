'use strict';

export class RenderTargetInterface {
  constructor(gl, width, height) {
    this.gl = gl;
    this.width = width;
    this.height = height;
  }

  setUp() {
    throw new Error('unimplemented setUp() method');
  }

  tearDown() {
    throw new Error('unimplemented tearDown() method');
  }
}
