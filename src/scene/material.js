'use strict';

import {v3} from 'twgl.js';
import {randomColor} from 'util/scene-helpers.js';

export class Material {
  constructor() {
    const defaultColor = v3.create(1, 1, 1);
    this.color = {
      diffuse: defaultColor,
      specular: defaultColor,
      ambient: defaultColor,
    };
    this.shininess = 10.0;
    this.shininessMax = 1000.0;
    this.specularIntensity = 0.0;
    this.isTextured = false;
    this.texture = null;
  }

  randomize(hue) {
    const color = randomColor(hue);
    this.color.diffuse = color;
    this.color.specular = color;
    this.color.ambient = color;
    this.shininess = Math.random() * 99.0 + 1.0;
    this.specularIntensity = Math.random() > 0.5 ? 1.0 : 0.0;
  }

  setAllColors(color) {
    this.color.diffuse = [...color];
    this.color.specular = [...color];
    this.color.ambient = [...color];
  }

  get uniforms() {
    const result = {
      u_diffuseColor: this.color.diffuse,
      u_specularColor: this.color.specular,
      u_ambientColor: this.color.ambient,
      u_shininess: this.shininess,
      u_shininessMax: this.shininessMax,
      u_specularIntensity: this.specularIntensity,
    };

    if (this.isTextured) {
      result.u_texture = this.texture;
    }

    return result;
  }

  /**
   * Add a texture to this material.
   * NOTE: if no texture is set, a default texture needs to be set in global
   * uniforms (right now that happens in SceneManager)
   * @param {WebGLTexture} tex
   */
  addTexture(tex) {
    this.isTextured = true;
    this.texture = tex;
  }
}