'use strict';

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
   * Draw to the scene using the specified camera, or the default camera if none
   * is specified.
   * @param {int} [cameraIndex] optional camera index
   */
  draw(cameraIndex) {
    if (cameraIndex === undefined) {
      cameraIndex = this.defaultCamera;
    }
    const mainCamera = this.cameras[cameraIndex];
    if (mainCamera === undefined) {
      throw new Error('no camera exists in scene.');
    }

    for (const el of this.geometry) {
      el.draw(mainCamera);
    }
    // @TODO: add a way to render lights and cameras as geometry when needed
  }
}

export {SceneGraph};