'use strict';

import {createGLCanvas} from 'util/scene-helpers.js';

export const GLContextManager = {
  init: function(label) {
    if (this.gl !== undefined) {
      throw new Error('GLContextManager is already initialized');
    }
    this.gl = createGLCanvas(label);
  }
};