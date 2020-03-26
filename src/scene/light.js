'use strict';

import {m4, v3} from 'twgl.js';
import {Material} from 'scene/material.js';
import {Primitive} from 'scene/primitive.js';

export class Light extends Primitive {
  constructor(gl, position, radius, color) {
    const material = new Material();
    material.setAllColors(color);
    super(gl, 'sphere', material);

    this.setAttenuationInfo(color, radius);

    const initialTransform = m4.identity();
    m4.translate(initialTransform, position, initialTransform);
    m4.scale(
        initialTransform, v3.create(this.radius, this.radius, this.radius),
        initialTransform);

    this.transform = initialTransform;
    this.position = position;
    this.color = color;

    this.tag = 'light';
  }

  get uniforms() {
    const uniforms = super.uniforms;
    uniforms.u_lightPos = this.position;
    uniforms.u_lightRadius = this.radius;
    uniforms.u_lightColor = this.color;
    uniforms.u_lightConstant = this.attenuation.constant;
    uniforms.u_lightLinear = this.attenuation.linear;
    uniforms.u_lightQuadratic = this.attenuation.quadratic;
    return uniforms;
  }

  /**
   * Calculates attenuation factors that will give the light something sort of
   * close to the desired radius, but in practice probably a bit smaller.
   * Doesn't really matter because most of the light falls in the first 20% of
   * its range.
   * @param {v3} color
   * @param {float} radius the desired radius
   */
  setAttenuationInfo(color, radius) {
    this.attenuation = {
      constant: 1.0,
      linear: 4.5 / radius,
      quadratic: 75.0 / (radius * radius),
    };
    const lightMax = Math.max(color[0], color[1], color[2]);
    this.radius =
        (-this.attenuation.linear +
         Math.sqrt(
             this.attenuation.linear * this.attenuation.linear -
             4 * this.attenuation.quadratic *
                 (this.attenuation.constant - (256.0 / 5.0) * lightMax))) /
        (2 * this.attenuation.quadratic);
  }
}