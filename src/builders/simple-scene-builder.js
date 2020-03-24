'use strict';

import {v3, m4} from 'twgl.js';

import {SceneManager} from 'managers/scene-manager.js';
import {Camera} from 'scene/camera.js';
import {Light} from 'scene/light.js';
import {Primitive} from 'scene/primitive.js';
import {Material} from 'scene/material.js';
import {randomTransform} from 'util/scene-helpers.js';
import {TextureManager} from 'managers/texture-manager.js';

export function createSimpleScene(gl) {
  const graph = new SceneManager();

  createCameras(gl, graph);

  createLights(gl, graph);

  createGeometry(gl, graph);

  return graph;
}

// Assign an update(t) function to SceneManager
SceneManager.prototype.update =
    function(t) {
  const secondsPerRotation = 60.0;
  const rotationsPerMs = 1.0 / secondsPerRotation / 1000;
  const rotationRadians = rotationsPerMs * 2 * Math.PI * t;
  const camera = this.cameras[0];
  camera.transform = m4.identity();
  m4.rotateY(camera.transform, rotationRadians, camera.transform);
  m4.translate(camera.transform, v3.create(0, 4, 8), camera.transform);
}

function createCameras(gl, graph) {
  const aspect =
      parseFloat(gl.canvas.clientWidth) / parseFloat(gl.canvas.clientHeight);
  const fovDegrees = 45.0;
  const eye = [0, 0, 0];
  const target = [0, 0, 0];
  const up = [0, 1, 0];

  const camera = new Camera(eye, target, up, aspect, fovDegrees);
  graph.addCamera(camera);
}

function createLights(gl, graph) {
  const lights = {
    // 0: v3.create(1, 0, 0),
    1: v3.create(0, 1, 0),
    // 2: v3.create(0, 0, 1),
  };
  for (const lightNdx in lights) {
    const lightPos = v3.create(-3 + lightNdx * 3, 0, -4);
    const lightColor = lights[lightNdx];
    const lightSize = 3.0;
    const light = new Light(gl, lightPos, lightSize, lightColor);
    graph.addLight(light);
  }
}

function createGeometry(gl, graph, textures) {
  const checkerboardTexture = TextureManager.texture('checkerboardTexture');

  const numCubes = 0;
  for (let i = 0; i < numCubes; ++i) {
    const cubeTransform = randomTransform(0.0, 0.0);
    const cubeMat = new Material();
    cubeMat.randomize();
    cubeMat.shininess = 32.0;
    const cube = new Primitive(gl, 'cube', cubeMat, cubeTransform);
    graph.addGeom(cube);
  }

  const numSpheres = 10;
  for (let i = 0; i < numSpheres; ++i) {
    const sphereTransform = m4.identity();
    m4.translate(
        sphereTransform, v3.create(-10 + i * 2, 0, -4), sphereTransform);
    const sphereMat = new Material();
    sphereMat.randomize();
    const sphere = new Primitive(gl, 'sphere', sphereMat, sphereTransform);
    graph.addGeom(sphere);
  }

  const planeTransform = m4.translation([0, -1, 0]);
  m4.scale(planeTransform, [20, 20, 20], planeTransform);
  const planeMat = new Material();
  planeMat.randomize('monochrome');
  planeMat.addTexture(checkerboardTexture);
  const plane = new Primitive(gl, 'plane', planeMat, planeTransform);
  graph.addGeom(plane);
}