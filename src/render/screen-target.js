'use strict';

import {RenderTargetInterface} from 'render/render-target-interface.js';

export class ScreenTarget {
  constructor(gl, width, height) {
    super(gl, width, height);
  }

  setUp() {
    this.gl.viewport(0, 0, this.gl.canvas.clientWidth, this.gl.canvas.clientHeight);
  }

  tearDown() {
    return;
  }
}
