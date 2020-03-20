'use strict';

import {m4} from 'twgl.js';
import {Material} from 'scene/material.js';
import {Primitive} from 'scene/primitive.js';
import flatTextureShader from 'shaders/flat-texture.js';

export class Light extends Primitive {
  constructor(gl, position, color) {
    const initialTransform = m4.identity();
    m4.translate(initialTransform, position, initialTransform);
    const material = new Material();
    material.setAllColors(color);

    super(gl, flatTextureShader, 'sphere', material, initialTransform);

    this.position = position;
    this.color = color;

    this.tag = 'light';
  }
}