'use strict';

import {createGLCanvas} from 'util/scene-helpers.js';

export const GLContextManager = {
  init_: function() {
    if (this.gl_ === undefined) {
      this.gl_ = createGLCanvas('GAPYEAR');
    }
  },
  get gl() {
    this.init_();
    return this.gl_;
  }
};