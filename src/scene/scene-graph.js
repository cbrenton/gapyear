'use strict';

import {createBlankTexture} from 'util/scene-helpers.js';

export class SceneGraph {
  constructor() {
    this.lights = [];
    this.geometry = [];
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
    this.geometry.push(geom);
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

    const globalUniforms = {
      u_viewMatrix: mainCamera.viewMatrix,
      u_projectionMatrix: mainCamera.projMatrix,
      u_cameraPos: mainCamera.position,
      u_lightPos: light.position,
      u_lightColor: light.color,
      u_texture: this.blankTexture,
    };
    for (const el of this.geometry) {
      el.draw(gl, globalUniforms);
    }
    // @TODO: add a way to render lights and cameras as geometry when needed
  }
}