'use strict';

import {v3} from 'twgl.js';

class Material {
  constructor() {
    this.color = {
      diffuse: v3.create(1, 1, 0),
      specular: v3.create(1, 1, 0),
      ambient: v3.create(1, 1, 0)
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
