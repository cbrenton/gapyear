'use strict';

import {m4, v3} from 'twgl.js';
import {Material} from 'scene/material.js';
import {Primitive} from 'scene/primitive.js';

// ~3.5 unit radius - see table at
// https://learnopengl.com/Lighting/Light-casters
const constant = 1.0;
const linear = 0.7;
const quadratic = 1.8;

export class Light extends Primitive {
  constructor(gl, position, color) {
    const initialTransform = m4.identity();
    m4.translate(initialTransform, position, initialTransform);
    const affectedRadius = calculateRadius(color);
    m4.scale(
        initialTransform,
        v3.create(affectedRadius, affectedRadius, affectedRadius),
        initialTransform);
    const material = new Material();
    material.setAllColors(color);

    super(gl, 'sphere', material, initialTransform);

    this.position = position;
    this.radius = affectedRadius;
    this.color = color;

    this.tag = 'light';
  }

  get uniforms() {
    const uniforms = super.uniforms;
    uniforms.u_lightPos = this.position;
    uniforms.u_lightRadius = this.radius;
    uniforms.u_lightColor = this.color;
    uniforms.u_lightConstant = constant;
    uniforms.u_lightLinear = linear;
    uniforms.u_lightQuadratic = quadratic;
    return uniforms;
  }
}

function calculateRadius(color) {
  const lightMax = Math.max(color[0], color[1], color[2]);
  const radius = (-linear +
                  Math.sqrt(
                      linear * linear -
                      4 * quadratic * (constant - (256.0 / 5.0) * lightMax))) /
      (2 * quadratic);
  return radius;
}
