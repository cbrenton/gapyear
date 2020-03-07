'use strict';

import {v3} from 'twgl.js';

class SceneGraph {
  constructor() {
    this.lights = [];
    this.geometry = [];
    this.cameras = [];
    this.defaultCamera = 0;
  }

  /**
   * Add a camera to the list.
   * @param {Camera} camera
   */
  addCamera(camera) {
    this.cameras.push(camera);
  }

  /**
   * Add a renderable object to the list.
   * @param {(Primitive|Mesh)} geom
   */
  addGeom(geom) {
    this.geometry.push(geom);
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

    const globalUniforms = {
      u_viewMatrix: mainCamera.viewMatrix,
      u_projectionMatrix: mainCamera.projMatrix,
      u_cameraPos: mainCamera.position,
    };
    for (const el of this.geometry) {
      el.draw(gl, globalUniforms);
    }
    // @TODO: add a way to render lights and cameras as geometry when needed
  }
}

export {SceneGraph};