'use strict';

import {RenderTargetInterface} from 'render/render-target-interface.js';

export class ScreenTarget extends RenderTargetInterface {
  constructor(gl) {
    super(gl, gl.canvas.clientWidth, gl.canvas.clientHeight);
  }

  setUp() {
    this.gl.viewport(0, 0, this.width, this.height);
  }

  tearDown() {
    return;
  }
}
