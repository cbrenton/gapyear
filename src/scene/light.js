'use strict';

import {m4, v3} from 'twgl.js';
import {Material} from 'scene/material.js';
import {Primitive} from 'scene/primitive.js';
import {ShaderManager} from 'managers/shader-manager.js';

export class Light extends Primitive {
  constructor(gl, position, size, color) {
    const initialTransform = m4.identity();
    m4.translate(initialTransform, position, initialTransform);
    const scale = size;
    m4.scale(
        initialTransform, v3.create(scale, scale, scale), initialTransform);
    const material = new Material();
    material.setAllColors(color);

    super(gl, 'sphere', material, initialTransform);

    this.position = position;
    this.color = color;

    this.tag = 'light';
  }
}