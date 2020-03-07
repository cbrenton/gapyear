'use strict';

class SceneGraph {
  constructor() {
    this.lights = [];
    this.geometry = [];
    this.cameras = [];
    this.defaultCamera = 0;
  }

  draw() {
    if (this.cameras[this.defaultCamera] === undefined) {
      throw 'Error: no camera exists in scene.';
      return;
    }
    for (const el of this.geometry) {
      console.log(`drawing instance of ${el.tag}`)
      el.draw();
    }
    // @TODO: add a way to render lights as geometry when needed
  }
}

export {SceneGraph};