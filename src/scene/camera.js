'use strict';

import {m4} from 'twgl.js';
import {degToRad} from 'util/scene-helpers.js';

class Camera {
  /**
   * @param {v3} eye
   * @param {v3} target
   * @param {v3} up
   * @param {float} aspect camera's aspect ratio, usually from gl context
   * @param {number} fovDegrees field of view, in degrees
   */
  constructor(eye, target, up, aspect, fovDegrees) {
    this.position = eye;
    this.target = target;
    this.up = up;
    this.fov = degToRad(fovDegrees);
    this.aspect = aspect;
    this.near = 0.1;
    this.far = 100.0;
    this.tag = 'camera';
  }

  get position() {
    return this.eye;
  }

  set position(val) {
    this.eye = val;
  }

  get viewMatrix() {
    return new m4.lookAt(this.position, this.target, this.up);
  }

  get projMatrix() {
    return new m4.perspective(this.fov, this.aspect, this.near, this.far);
  }
}

export {Camera};