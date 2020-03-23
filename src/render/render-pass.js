'use strict';

import {TextureManager} from 'managers/texture-manager.js';

export class RenderPass {
  constructor(
      gl, renderTarget, programInfo, renderables, camera, setUpFunc,
      tearDownFunc, extraUniforms = {}) {
    this.gl = gl;
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
    };
    for (let uniform in this.extraUniforms) {
      globalUniforms[uniform] = this.extraUniforms[uniform];
    }
    return globalUniforms;
  }

  render() {
    this.renderTarget.setUp();

    this.setUp(this.gl);
    for (const el of this.renderables) {
      el.draw(this.uniforms, this.programInfo);
    }
    this.tearDown(this.gl);

    this.renderTarget.tearDown();
  }
}