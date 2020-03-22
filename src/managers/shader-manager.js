'use strict';

import {createShaders} from 'util/scene-helpers.js';
import flatTextureShader from 'shaders/flat-texture.js';
import gBufferShader from 'shaders/gbuffer.js';
import lBufferShader from 'shaders/lbuffer.js';
import phongShader from 'shaders/phong.js';

export const ShaderManager = {
  init: function(gl) {
    if (this.shaders !== undefined) {
      throw new Error('ShaderManager is already initialized');
    }
    this.shaders = loadShaders(gl);
  },
  get: function(shaderName) {
    return this.shaders[shaderName];
  },
}

function loadShaders(gl) {
  const shaders = {
    'flatTexture': flatTextureShader,
    'gBuffer': gBufferShader,
    'lBuffer': lBufferShader,
    'phong': phongShader,
  };

  const result = {};
  for (let shaderName in shaders) {
    result[shaderName] = createShaders(gl, shaders[shaderName]);
  }
  return result;
}