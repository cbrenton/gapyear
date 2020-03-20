'use strict';

import {m4, v3} from 'twgl.js';
import {degToRad} from 'util/scene-helpers.js';
import {Primitive} from 'scene/primitive.js';
import {Material} from 'scene/material.js';
import flatTextureShader from 'shaders/flatTexture.js';
import {Renderable} from 'scene/renderable.js';

export class OverlayGrid extends Renderable {
  constructor(gl) {
    super(gl, flatTextureShader);
    this.items = [];
    this.numRows = 3;
    this.numCols = 3;
    this.enabled = false;
    this.defaultShader = flatTextureShader;
  }

  /**
   * Add a screen to the grid.
   * @param {WebGLTexture} texture
   * @param {Shader} shader defaults to this.defaultShader
   */
  addElement(texture, shader) {
    shader = shader || this.defaultShader;

    const el = {
      texture: texture,
      shader: shader,
    };
    this.items.push(el);
  }

  /**
   * Render using a WebGL context and a specific camera.
   * @param {Object} globalUniforms uniforms passed from SceneGraph applicable
   *     to all overlay objects
   */
  draw(globalUniforms, overrideProgramInfo) {
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
      const shader = this.items[i].shader;

      const plane =
          new Primitive(this.gl, shader, 'plane', mat, screenTransform);
      plane.draw(globalUniforms, overrideProgramInfo);
    }
  }
}
