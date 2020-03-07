'use strict';

import {v3, m4, primitives} from 'twgl.js';

class Primitive {
  constructor(type) {
    this.position = v3.create();
    if (type == 'cube') {
      this.bufferInfo = primitives.createSphereBufferInfo(gl, 1, 24, 12);
    }
    this.transform = m4.translation([0, 3, 0]);
    this.material = {
      color: {
        diffuse: v3.create(1, 0, 0),
      },
    };
    this.texture = null;
    this.programInfo = null;
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
   * @param {Camera} camera
   * @param {Object} globalUniforms uniforms passed from SceneGraph applicable
   *     to all objects
   */
  draw(gl, camera, globalUniforms) {
    console.log('drew it');
  }
}

export {Primitive};