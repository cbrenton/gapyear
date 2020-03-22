'use strict';

import {createProgramInfo} from 'twgl.js';
import flatTextureShader from 'shaders/flat-texture.js';
import gBufferShader from 'shaders/gbuffer.js';
import lBufferShader from 'shaders/lbuffer.js';
import phongShader from 'shaders/phong.js';
import {GLContextManager} from 'managers/gl-context-manager.js';

export const ShaderManager = {
  init_: function() {
    if (this.shaders_ === undefined) {
      this.shaders_ = loadShaders(GLContextManager.gl);
    }
  },
  shader: function(shaderName) {
    this.init_();
    return this.shaders_[shaderName];
  },
};

function loadShaders(gl) {
  const shaders = {
    'flatTexture': flatTextureShader,
    'gBuffer': gBufferShader,
    'lBuffer': lBufferShader,
    'phong': phongShader,
  };

  const result = {};
  for (let shaderName in shaders) {
    result[shaderName] =
        createProgramInfo(gl, [shaders[shaderName].vs, shaders[shaderName].fs]);
  }
  return result;
}