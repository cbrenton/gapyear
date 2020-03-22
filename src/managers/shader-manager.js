'use strict';

import {createProgramInfo} from 'twgl.js';
import flatTextureShader from 'shaders/flat-texture.js';
import gBufferShader from 'shaders/gbuffer.js';
import lBufferShader from 'shaders/lbuffer.js';
import phongShader from 'shaders/phong.js';
import {GLContextManager} from 'managers/gl-context-manager.js';

export const ShaderManager = {
  init: function() {
    if (this.shaders !== undefined) {
      throw new Error('ShaderManager is already initialized');
    }
    this.shaders = loadShaders(GLContextManager.gl);
  },
  get: function(shaderName) {
    return this.shaders[shaderName];
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