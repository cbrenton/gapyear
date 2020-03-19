'use strict';

// @TODO: move this into a more appropriate dir

import {m4} from 'twgl.js';
import {createShaders} from 'util/scene-helpers.js';

export class Renderable {
  constructor(gl, shaders, initialTransform) {
    if (initialTransform === undefined) {
      initialTransform = m4.identity();
    }

    this.gl = gl;
    this.programInfo = createShaders(this.gl, shaders);
    this.initialTransform = initialTransform;
  }

  /**
   * Render using a WebGL context and a specific camera.
   * @param {Object} globalUniforms uniforms passed from SceneGraph applicable
   *     to all objects
   */
  drawWithProgramInfo(globalUniforms, programInfo) {
    this.draw(globalUniforms, programInfo);
  }

  draw(globalUniforms, overrideProgramInfo) {
    throw Error('unimplemented draw()');
  }
}
