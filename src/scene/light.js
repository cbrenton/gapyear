'use strict';

import {m4, v3} from 'twgl.js';
import {Material} from 'scene/material.js';
import {Primitive} from 'scene/primitive.js';

export class Light extends Primitive {
  constructor(gl, position, radius, color) {
    const initialTransform = m4.identity();
    m4.translate(initialTransform, position, initialTransform);
    m4.scale(
        initialTransform, v3.create(radius, radius, radius), initialTransform);
    const material = new Material();
    material.setAllColors(color);

    super(gl, 'sphere', material, initialTransform);

    this.position = position;
    this.radius = radius;
    this.color = color;

    this.tag = 'light';
  }

  get uniforms() {
    const primitiveUniforms = super.uniforms;
    primitiveUniforms.u_lightPos = this.position;
    primitiveUniforms.u_lightRadius = this.radius;
    primitiveUniforms.u_lightColor = this.color;
    return primitiveUniforms;
  }
}