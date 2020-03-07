'use strict';

import {v3} from 'twgl.js';
import {randomColor} from 'util/scene-helpers.js';

class Material {
  constructor() {
    const defaultColor = randomColor();
    this.color = {
      diffuse: defaultColor,
      specular: defaultColor,
      ambient: defaultColor,
    };
    this.shininess = 10.0;
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
