'use strict';

import {m4, v3} from 'twgl.js';
import {degToRad} from 'util/scene-helpers.js';
import {Primitive} from 'scene/primitive.js';
import {Material} from 'scene/material.js';
import {RenderableInterface} from 'scene/renderable-interface.js';
import {ShaderManager} from 'managers/shader-manager.js';

export class OverlayGrid extends RenderableInterface {
  constructor(gl) {
    super(gl);
    this.items = [];
    this.numRows = 3;
    this.numCols = 3;
    this.enabled = false;
    this.defaultProgram = ShaderManager.shader('flatTexture');
  }

  /**
   * Add a screen to the grid.
   * @param {WebGLTexture} texture
   * @param {WebGLProgram} programInfo defaults to this.defaultProgram
   */
  addElement(texture, programInfo) {
    programInfo = programInfo || this.defaultProgram;

    const el = {
      geom: this.createScreenGeometry_(texture),
      programInfo: programInfo,
    };
    this.items.push(el);
  }

  createScreenGeometry_(texture) {
    const i = this.items.length;

    const screenScale = 0.4;
    const screenPadding = 0.05;
    const aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;

    // Start drawing in top right corner
    const screenOffsetX = -(screenScale + screenPadding) * aspect;
    const screenOffsetY = -(screenScale * this.numRows) / 2;

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
    mat.addTexture(texture);

    return new Primitive(this.gl, 'plane', mat, screenTransform);
  }

  /**
   * Render using a WebGL context and a specific camera, using each element's
   * individual shader.
   * @param {Object} globalUniforms uniforms passed from SceneManager applicable
   *     to all overlay objects
   */
  draw(globalUniforms) {
    if (!this.enabled) {
      return;
    }

    for (let i = 0; i < this.items.length; ++i) {
      const plane = this.items[i].geom;
      const programInfo = this.items[i].programInfo;

      plane.draw(globalUniforms, programInfo);
    }
  }
}