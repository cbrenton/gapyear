'use strict';

import {v3, m4} from 'twgl.js';

import * as util from 'util/scene-helpers.js';
import phongShader from 'shaders/phong.js';
import {logFrame} from 'util/fps-counter.js';
import {SceneGraph} from 'scene/scene-graph.js';
import {Camera} from 'scene/camera.js';
import {Light} from 'scene/light.js';
import {Primitive} from 'scene/primitive.js';
import {Material} from 'scene/material.js';

window.onload = function() {
  const label = 'Hello WebGL!';
  const gl = util.createGLCanvas(label);
  const overlay = util.getOverlay();
  const scene = createScene(gl);
  drawFrame(gl, overlay, scene);
};

/**
 * Create a scene graph holding all objects in the scene.
 * @return {SceneGraph} a scene graph containing all lights, geometry, and
 *     cameras
 */
function createScene(gl) {
  const graph = new SceneGraph();
  const aspect =
      parseFloat(gl.canvas.clientWidth) / parseFloat(gl.canvas.clientHeight);
  const fovDegrees = 45.0;
  const eye = [0, 1, 10];
  const target = [0, 0, 0];
  const up = [0, 1, 0];

  const camera = new Camera(eye, target, up, aspect, fovDegrees);
  graph.addCamera(camera);

  const lightPos = v3.create(10, 10, 10);
  const light = new Light(lightPos, v3.create(1, 1, 1));
  graph.addLight(light);

  const phongInfo = util.createShaders(gl, phongShader);

  const numCubes = 10;
  for (let i = 0; i < numCubes; ++i) {
    const cubeTransform = util.randomTransform(0.0, 0.0);
    const cubeMat = new Material();
    cubeMat.randomize();
    cubeMat.shininess = 32.0;
    const cube = new Primitive('cube', phongInfo, cubeMat, cubeTransform);
    graph.addGeom(cube);
  }

  const numSpheres = 10;
  for (let i = 0; i < numSpheres; ++i) {
    const sphereTransform = util.randomTransform(0.0, 0.0);
    const sphereMat = new Material();
    sphereMat.randomize();
    const sphere =
        new Primitive('sphere', phongInfo, sphereMat, sphereTransform);
    graph.addGeom(sphere);
  }

  const planeTransform = m4.translation([0, -1, 0]);
  m4.scale(planeTransform, [10, 10, 10], planeTransform);
  const planeMat = new Material();
  planeMat.randomize('monochrome');
  const plane = new Primitive('plane', phongInfo, planeMat, planeTransform);
  graph.addGeom(plane);

  return graph;
}

/**
 * Draw a single frame to the screen and request another.
 * @param {WebGL2RenderingContext} gl the webgl context
 * @param {CanvasRenderingContext2D} overlay the 2d drawing context for the
 *     overlay
 * @param {SceneGraph} scene the scene graph object
 */
function drawFrame(gl, overlay, scene) {
  logFrame(overlay);

  gl.clearColor(0, 1, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  scene.draw(gl);

  requestAnimationFrame(function() {
    drawFrame(gl, overlay, scene);
  });
}
