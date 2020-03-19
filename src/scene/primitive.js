'use strict';

import {m4, primitives} from 'twgl.js';

import * as util from 'util/scene-helpers.js';
import {Material} from 'scene/material.js'

export class Primitive {
  /**
   * @param {WebGL2RenderingContext} gl
   * @param {string} type one of 'cube', 'sphere', 'plane'
   * @param {WebGLProgram} programInfo
   * @param {Material} material
   * @param {m4} transform
   */
  constructor(gl, type, programInfo, material, transform) {
    this.gl = gl;
    if (transform === undefined) {
      transform = m4.identity();
    }
    switch (type) {
      case 'cube':
        this.bufferInfo = primitives.createCubeBufferInfo(this.gl, 1);
        break;
      case 'sphere':
        this.bufferInfo = primitives.createSphereBufferInfo(this.gl, 1, 24, 12);
        break;
      case 'plane':
        this.bufferInfo = primitives.createPlaneBufferInfo(this.gl, 1, 1);
        break;
      default:
        throw Error(`Undefined primitive ${type}`);
    }
    this.tag = `primitive.${type}`;
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
   * @param {Object} globalUniforms uniforms passed from SceneGraph applicable
   *     to all objects
   */
  draw(globalUniforms) {
    util.drawBuffer(
        this.gl, this.programInfo, this.bufferInfo, this.uniforms,
        globalUniforms);
  }
}