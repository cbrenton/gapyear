'use strict';

import {v3, m4, primitives} from 'twgl.js';

import * as util from 'util/scene-helpers.js';

class Primitive {
  /**
   * @param {string} type one of 'cube', 'sphere'
   * @param {WebGLProgram} programInfo
   * @param {m4} transform
   */
  constructor(type, programInfo, transform) {
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
    this.transform = transform;
    this.material = {
      color: {
        diffuse: v3.create(0, 0, 1),
      },
    };
    this.texture = null;
    this.programInfo = programInfo;
  }

  get uniforms() {
    return {
      u_modelMatrix: this.transform,
      u_diffuseColor: this.material.color.diffuse,
    };
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