'use strict';

import {OverlayGrid} from 'scene/overlay-grid.js';
import {ScreenAlignedQuad} from 'scene/screen-aligned-quad.js';
import {GLContextManager} from 'managers/gl-context-manager.js';

export class SceneManager {
  constructor() {
    this.gl = GLContextManager.gl;
    this.hud = new OverlayGrid(this.gl);
    this.geometry = {
      main: [],
      lights: [],
      overlay: [this.hud],
    };
    this.cameras = [];
  }

  /**
   * Add a camera to the scene.
   * @param {Camera} camera
   */
  addCamera(camera) {
    this.cameras.push(camera);
  }

  /**
   * Add a renderable object to the scene.
   * @param {(Primitive|Mesh)} geom
   */
  addGeom(geom) {
    this.geometry.main.push(geom);
  }

  addScreenAlignedQuad(texture) {
    const quad = new ScreenAlignedQuad(this.gl);
    quad.init(texture);
    // Needs to be unshift because we draw overlay elements back to front.
    this.geometry.overlay.unshift(quad);
  }

  /**
   * Add a light to the scene.
   * @param {Light} light
   */
  addLight(light) {
    this.geometry.lights.push(light);
  }

  /**
   * Add the color and depth attachments from a BufferTarget as HUD elements.
   * @param {BufferTarget} buffer
   */
  addBufferAttachmentsToHUD(buffer) {
    for (let el in buffer.colorAttachments) {
      this.addTextureToHUD(buffer.colorAttachments[el]);
    }
    this.addTextureToHUD(buffer.depthAttachment);
  }

  /**
   * Add a single color or depth attachment as a HUD element.
   * @param {WebGLTexture} texture
   */
  addTextureToHUD(texture) {
    this.hud.addElement(texture);
  }
}