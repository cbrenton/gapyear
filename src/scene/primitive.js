'use strict';

import {v3, m4, primitives} from 'twgl.js';

import * as util from 'util/scene-helpers.js';
import {Material} from 'scene/material.js'

class Primitive {
  /**
   * @param {string} type one of 'cube', 'sphere'
   * @param {WebGLProgram} programInfo
   * @param {Material} material
   * @param {m4} transform
   */
  constructor(type, programInfo, material, transform) {
    if (transform === undefined) {
      transform = m4.identity();
    }
    this.position = v3.create();
    if (type == 'cube') {
      this.bufferInfo = primitives.createCubeBufferInfo(gl, 1);
    }
    if (type == 'sphere') {
      this.bufferInfo = primitives.createSphereBufferInfo(gl, 1, 24, 12);
    }
    this.material = material;
    this.transform = transform;
    this.programInfo = programInfo;
  }

  get uniforms() {
    const uniforms = {
      u_modelMatrix: this.transform,
    };

    Object.assign(uniforms, this.material.uniforms);

    return uniforms;
  }

  /**
   * Render using a WebGL context and a specific camera.
   * @param {WebGL2RenderingContext} gl
   * @param {Object} globalUniforms uniforms passed from SceneGraph applicable
   *     to all objects
   */
  draw(gl, globalUniforms) {
    util.drawBuffer(
        gl, this.programInfo, this.bufferInfo, this.uniforms, globalUniforms);
  }
}

export {Primitive};