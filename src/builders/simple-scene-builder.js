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

  for (const el of this.geometry.main) {
    if (el.update !== undefined) {
      el.update(t);
    }
  }
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
    0: v3.create(1, 0, 0),
    1: v3.create(0, 1, 0),
    2: v3.create(0, 0, 1),
  };
  for (const lightNdx in lights) {
    const x = -3 + lightNdx * 3;
    const lightPos = v3.create(x, 0, -4);
    const lightColor = lights[lightNdx];
    const lightRadius = 3.0;
    const light = new Light(gl, lightPos, lightRadius, lightColor);
    graph.addLight(light);
  }
}

function createGeometry(gl, graph, textures) {
  const numCubes = 0;
  for (let i = 0; i < numCubes; ++i) {
    const cubeTransform = randomTransform(0.0, 0.0);
    const cubeMat = new Material();
    cubeMat.randomize();
    cubeMat.shininess = 32.0;
    const cube = new Primitive(gl, 'cube', cubeMat, cubeTransform);
    graph.addGeom(cube);
  }

  for (let level = 0; level < 4; ++level) {
    const y = -0.5;
    const numSpheres = 8 * level || 1;
    const radius = 2 * level;
    createRingOfSpheres(gl, graph, y, numSpheres, radius);
  }

  const xRotations = [0, Math.PI, Math.PI / 2, 3 * Math.PI / 2];
  const zRotations = [Math.PI / 2, 3 * Math.PI / 2];
  for (let rotation of xRotations) {
    const planeTransform = m4.identity();
    m4.rotateX(planeTransform, rotation, planeTransform);
    const plane = createWall(planeTransform);
    graph.addGeom(plane);
  }

  for (let rotation of zRotations) {
    const planeTransform = m4.identity();
    m4.rotateZ(planeTransform, rotation, planeTransform);
    const plane = createWall(planeTransform);
    graph.addGeom(plane);
  }
}

function createWall(planeTransform) {
  m4.translate(planeTransform, [0, -10, 0], planeTransform);
  m4.scale(planeTransform, [20, 20, 20], planeTransform);
  const planeMat = new Material();
  planeMat.addTexture(TextureManager.texture('checkerboardTexture'));
  return new Primitive(gl, 'plane', planeMat, planeTransform);
}

function createRingOfSpheres(gl, graph, startY, numSpheres, radius) {
  for (let i = 0; i < numSpheres; ++i) {
    const sphereTransform = m4.identity();

    const sphereMat = new Material();
    sphereMat.randomize();
    const sphere = new Primitive(gl, 'sphere', sphereMat, sphereTransform);
    sphere.update = function(t) {
      const y = startY + Math.cos(Math.PI * (t / 1000) % 4000);
      this.transform = m4.identity();
      m4.rotateY(this.transform, 2 * i * Math.PI / numSpheres, this.transform);
      m4.translate(this.transform, v3.create(0, y, radius), this.transform);
    };
    graph.addGeom(sphere);
  }
}