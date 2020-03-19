'use strict';

import {m4, v3} from 'twgl.js';
import {degToRad} from 'util/scene-helpers.js';
import {Primitive} from 'scene/primitive.js';
import {Material} from 'scene/material';
import {createShaders} from 'util/scene-helpers.js';
import flatTextureShader from 'shaders/flatTexture.js';

export class OverlayGrid {
  constructor(gl) {
    this.gl = gl;
    this.items = [];
    this.numRows = 3;
    this.numCols = 3;
    this.enabled = false;
    this.defaultShader = createShaders(this.gl, flatTextureShader);
  }

  /**
   * Add a screen to the grid.
   * @param {WebGLTexture} texture
   * @param {WebGLProgram} shaderInfo defaults to this.defaultShader
   */
  addElement(texture, shaderInfo) {
    shaderInfo = shaderInfo || this.defaultShader;

    const el = {
      texture: texture,
      shaderInfo: shaderInfo,
    };
    this.items.push(el);
  }

  /**
   * Render using a WebGL context and a specific camera.
   * @param {Object} globalUniforms uniforms passed from SceneGraph applicable
   *     to all overlay objects
   */
  draw(globalUniforms) {
    if (!this.enabled) {
      return;
    }
    // @TODO: move transform construction to initialization, not render time
    // @TODO: move Plane construction to initialization, not render time
    const screenScale = 0.4;
    const screenPadding = 0.05;
    const aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;

    // Start drawing in top right corner
    const screenOffsetX = -(screenScale + screenPadding) * aspect;
    const screenOffsetY = -(screenScale * this.numRows) / 2;

    for (let i = 0; i < this.items.length; ++i) {
      // Draw in reverse order
      const col = this.numCols - (i % this.numCols);
      const row = this.numRows - parseInt(i / this.numRows);

      const translateDistanceX =
          screenOffsetX + (screenScale + screenPadding) * row;
      const translateDistanceY =
          screenOffsetY + (screenScale + screenPadding) * col;

      const screenTransform = m4.identity();
      m4.translate(
          screenTransform, v3.create(translateDistanceX, translateDistanceY, 0),
          screenTransform);
      m4.rotateX(screenTransform, degToRad(-90), screenTransform);
      m4.scale(
          screenTransform, v3.create(screenScale, screenScale, screenScale),
          screenTransform);

      const mat = new Material();
      mat.addTexture(this.items[i].texture);
      const shaderInfo = this.items[i].shaderInfo;

      const plane =
          new Primitive(this.gl, 'plane', shaderInfo, mat, screenTransform);
      plane.draw(globalUniforms);
    }
  }
}
