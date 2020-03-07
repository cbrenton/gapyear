'use strict';

import {v3} from 'twgl.js';
import {randomColor} from 'util/scene-helpers.js';

class Material {
  constructor() {
    const defaultColor = v3.create(1, 1, 1);
    this.color = {
      diffuse: defaultColor,
      specular: defaultColor,
      ambient: defaultColor,
    };
    this.shininess = 10.0;
  }

  randomize(hue) {
    const color = randomColor(hue);
    this.color.diffuse = color;
    this.color.specular = color;
    this.color.ambient = color;
    this.shininess = Math.random() * 100.0;
  }

  get uniforms() {
    return {
      u_diffuseColor: this.color.diffuse,
      u_specularColor: this.color.specular,
      u_ambientColor: this.color.ambient,
      u_shininess: this.shininess,
    };
  }
}

export {Material};
