'use strict';

import {m4, v3} from 'twgl.js';
import {Primitive} from 'scene/primitive.js';
import {Material} from 'scene/material';
import {degToRad} from 'util/scene-helpers.js';
import {ShaderManager} from 'managers/shader-manager.js';

export class ScreenAlignedQuad extends Primitive {
  constructor(gl) {
    super(
        gl, 'plane', new Material(),
        ScreenAlignedQuad.createScreenTransform_());
    this.defaultProgram = ShaderManager.shader('flatTexture');
  }

  /**
   * Create the transform to make this plane fill the screen.
   * @return {m4}
   */
  static createScreenTransform_() {
    const transform = m4.identity();
    m4.rotateX(transform, degToRad(-90), transform);
    const screenScale = 2.0;
    m4.scale(
        transform, v3.create(screenScale, screenScale, screenScale), transform);
    return transform;
  }

  /**
   * Initialize this object's geometry field as an untextured quad.
   */
  init(texture) {
    if (texture !== undefined) {
      this.material.addTexture(texture);
    }
  }

  /**
   * Render using a WebGL context and a specific camera.
   * @param {Object} globalUniforms uniforms passed from SceneManager applicable
   *     to all overlay objects
   */
  draw(globalUniforms) {
    super.draw(globalUniforms, this.defaultProgram)
  }
}
