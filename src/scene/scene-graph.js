'use strict';

import {v3, m4} from 'twgl.js';
import {OverlayGrid} from 'util/overlay-grid.js';
import {ScreenAlignedQuad} from 'util/screen-aligned-quad.js';
import {TextureManager} from 'managers/texture-manager.js';

export class SceneGraph {
  constructor(gl) {
    this.gl = gl;
    this.hud = new OverlayGrid(this.gl);
    this.geometry = {
      main: [],
      lights: [],
      overlay: [this.hud],
    };
    this.cameras = [];
    this.defaultCamera = 0;
    this.blankTexture = TextureManager.texture('blankTexture');
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
   * Add the textures from a GBuffer as HUD elements.
   * @param {GBuffer} gbuffer
   */
  addGBufferToHUD(gbuffer) {
    for (let el in gbuffer.colorAttachments) {
      this.hud.addElement(gbuffer.colorAttachments[el]);
    }
    this.hud.addElement(gbuffer.depthAttachment);
  }

  /**
   * Draw to the scene using the specified camera, or the default camera if none
   * is specified.
   * @param {string} geometryType one of 'main', 'lights', or 'overlay'
   * @param {WebGLProgram} programInfo
   * @param {int} [cameraIndex] optional camera index
   */
  draw(geometryType, programInfo, cameraIndex) {
    if (cameraIndex === undefined) {
      cameraIndex = this.defaultCamera;
    }
    const mainCamera = this.cameras[cameraIndex];
    if (mainCamera === undefined) {
      throw new Error('no camera exists in scene.');
    }
    if (!(geometryType in this.geometry)) {
      throw new Error(`geometry type ${geometryType} doesn't exist in scene`);
    }

    const light = this.geometry.lights[0];
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
    for (const el of this.geometry[geometryType]) {
      el.drawWithProgramInfo(globalUniforms, programInfo);
    }
    // @TODO: add a way to render lights and cameras as geometry when needed
  }

  /**
   * Draw all overlay geometry with depth testing disabled.
   */
  drawOverlay() {
    this.gl.disable(this.gl.DEPTH_TEST);
    // Draw overlay geometry (on-screen view)
    const overlayGlobalUniforms = {
      u_viewMatrix: m4.identity(),
      u_projectionMatrix: m4.identity(),
      u_cameraPos: v3.create(0, 0, 0),
    };
    for (const el of this.geometry.overlay) {
      el.draw(overlayGlobalUniforms);
    }
    this.gl.enable(this.gl.DEPTH_TEST);
  }
}