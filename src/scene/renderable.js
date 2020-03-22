'use strict';

// @TODO: move this into a more appropriate dir

import {m4} from 'twgl.js';

export class Renderable {
  constructor(gl, initialTransform) {
    if (initialTransform === undefined) {
      initialTransform = m4.identity();
    }

    this.gl = gl;
    this.initialTransform = initialTransform;
  }

  /**
   * Render using a WebGL context and a specific camera.
   * @param {Object} globalUniforms uniforms passed from SceneGraph applicable
   *     to all objects
   * @param {WebGLProgram} overrideProgramInfo
   */
  drawWithProgramInfo(globalUniforms, overrideProgramInfo) {
    this.draw(globalUniforms, overrideProgramInfo);
  }

  draw(globalUniforms, overrideProgramInfo) {
    throw new Error('unimplemented draw()');
  }
}
