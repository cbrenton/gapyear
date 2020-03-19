'use strict';

import {m4, v3} from 'twgl.js';
import {Primitive} from 'scene/primitive.js';
import {Material} from 'scene/material';
import {createShaders, degToRad} from 'util/scene-helpers.js';
import flatTextureShader from 'shaders/flatTexture.js';

export class ScreenAlignedQuad {
  constructor() {
    this.geometry = null;
  }

  /**
   * Initialize this object's geometry field as an untextured quad. Must be
   * called before draw().
   */
  init(texture) {
    const flatTextureInfo = createShaders(gl, flatTextureShader);

    const planeTransform = m4.identity();
    m4.rotateX(planeTransform, degToRad(-90), planeTransform);
    const screenScale = 2.0;
    m4.scale(
        planeTransform, v3.create(screenScale, screenScale, screenScale),
        planeTransform);
    const planeMat = new Material();
    if (texture !== undefined) {
      planeMat.addTexture(texture);
    }
    const plane =
        new Primitive('plane', flatTextureInfo, planeMat, planeTransform);
    this.geometry = plane;
  }

  draw(gl, globalUniforms) {
    if (this.geometry == null) {
      throw Error('ScreenAlignedQuad must be initialized before drawing');
    }
    this.geometry.draw(gl, globalUniforms);
  }
}