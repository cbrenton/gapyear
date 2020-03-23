'use strict';

import {TextureManager} from 'managers/texture-manager.js';

export class RenderPass {
  constructor(
      renderTarget, programInfo, renderables, camera, setUpFunc, tearDownFunc,
      // setUpPreBindFunc = function() {}, tearDownPreBindFunc = function() {},
      extraUniforms = {}) {
    this.renderables = renderables;
    this.programInfo = programInfo;
    this.renderTarget = renderTarget;
    this.camera = camera;
    this.setUp = setUpFunc;
    this.tearDown = tearDownFunc;
    this.extraUniforms = extraUniforms;
  }

  get uniforms() {
    const globalUniforms = {
      u_viewMatrix: this.camera.viewMatrix,
      u_projectionMatrix: this.camera.projMatrix,
      u_cameraPos: this.camera.position,
      u_texture: TextureManager.texture('blankTexture'),
      u_resolutionX: this.renderTarget.width,
      u_resolutionY: this.renderTarget.height,
    };
    for (let uniform in this.extraUniforms) {
      globalUniforms[uniform] = this.extraUniforms[uniform];
    }
    return globalUniforms;
  }

  render() {
    this.renderTarget.setUp();

    this.setUp();
    for (const el of this.renderables) {
      el.draw(this.uniforms, this.programInfo);
    }
    this.tearDown();

    this.renderTarget.tearDown();
  }
}
