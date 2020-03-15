'use strict';

import {v3, m4} from 'twgl.js';
import {createBlankTexture} from 'util/scene-helpers.js';
import {OverlayGrid} from 'util/overlay-grid';

export class SceneGraph {
  constructor() {
    this.lights = [];
    this.hud = new OverlayGrid();
    this.geometry = {
      main: [],
      overlay: [this.hud],
    };
    this.cameras = [];
    this.defaultCamera = 0;
    this.blankTexture = createBlankTexture();
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

  /**
   * Add a HUD element to be drawn with an orthographic projection on top.
   * @TODO: update this description
   * @param {Primitive} geom
   */
  addHUDElement(texture, programInfo) {
    this.hud.addElement(texture, programInfo);
  }

  /**
   * Add a light to the scene.
   * @param {Light} light
   */
  addLight(light) {
    this.lights.push(light);
  }

  /**
   * Draw to the scene using the specified camera, or the default camera if none
   * is specified.
   * @param {WebGL2RenderingContext} gl
   * @param {int} [cameraIndex] optional camera index
   */
  draw(gl, cameraIndex) {
    if (cameraIndex === undefined) {
      cameraIndex = this.defaultCamera;
    }
    const mainCamera = this.cameras[cameraIndex];
    if (mainCamera === undefined) {
      throw new Error('no camera exists in scene.');
    }

    const light = this.lights[0];
    if (light === undefined) {
      throw new Error('no lights exist in scene.')
    }

    // Draw main geometry (in-camera view)
    const globalUniforms = {
      u_viewMatrix: mainCamera.viewMatrix,
      u_projectionMatrix: mainCamera.projMatrix,
      u_cameraPos: mainCamera.position,
      u_lightPos: light.position,
      u_lightColor: light.color,
      u_texture: this.blankTexture,
    };
    for (const el of this.geometry.main) {
      el.draw(gl, globalUniforms);
    }
    // @TODO: add a way to render lights and cameras as geometry when needed
  }

  /**
   * Draw all overlay geometry with depth testing disabled.
   * @param {WebGL2RenderingContext} gl
   */
  drawOverlay(gl) {
    gl.disable(gl.DEPTH_TEST);
    // Draw overlay geometry (on-screen view)
    const overlayGlobalUniforms = {
      u_viewMatrix: m4.identity(),
      u_projectionMatrix: m4.identity(),
      u_cameraPos: v3.create(0, 0, 0),
    };
    for (const el of this.geometry.overlay) {
      el.draw(gl, overlayGlobalUniforms);
    }
    gl.enable(gl.DEPTH_TEST);
  }
}