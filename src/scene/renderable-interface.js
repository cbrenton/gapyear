'use strict';

import {m4} from 'twgl.js';

export class RenderableInterface {
  constructor(gl, initialTransform = m4.identity()) {
    this.gl = gl;
    this.initialTransform = initialTransform;
  }

  /**
   * Render using a WebGL context and a specific camera.
   * @param {Object} globalUniforms uniforms passed from SceneManager applicable
   *     to all objects
   * @param {WebGLProgram} overrideProgramInfo
   */
  draw(globalUniforms, overrideProgramInfo) {
    throw new Error('unimplemented draw()');
  }
}
