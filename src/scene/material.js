'use strict';

import {v3} from 'twgl.js';

class Material {
  constructor() {
    this.color = {diffuse: v3.create(1, 1, 0)};
  }

  get uniforms() {
    return {
      u_diffuseColor: this.color.diffuse,
    };
  }
}

export {Material};
