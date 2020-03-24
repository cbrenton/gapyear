'use strict';

import {createGLCanvas} from 'util/scene-helpers.js';

export const GLContextManager = {
  init_: function() {
    if (this.gl_ === undefined) {
      this.gl_ = createGLCanvas('GAPYEAR');
      // @TODO: remove this once I remove position buffer
      const ext = gl.getExtension('EXT_color_buffer_float');
      if (!ext) {
        alert('color buffer float extension not found');
      }
    }
  },
  get gl() {
    this.init_();
    return this.gl_;
  }
};