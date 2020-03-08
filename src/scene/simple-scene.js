'use strict';

import {v3, m4} from 'twgl.js';

import {SceneGraph} from 'scene/scene-graph.js';
import {Camera} from 'scene/camera.js';
import {Light} from 'scene/light.js';
import {Primitive} from 'scene/primitive.js';
import {Material} from 'scene/material.js';
import {createShaders, randomTransform} from 'util/scene-helpers.js';
import phongShader from 'shaders/phong.js';

export function createSimpleScene(gl) {
  const graph = new SceneGraph();

  createCameras(gl, graph);

  createLights(graph);

  createGeometry(graph);

  return graph;
}

function createCameras(gl, graph) {
  const aspect =
      parseFloat(gl.canvas.clientWidth) / parseFloat(gl.canvas.clientHeight);
  const fovDegrees = 45.0;
  const eye = [0, 1, 10];
  const target = [0, 0, 0];
  const up = [0, 1, 0];

  const camera = new Camera(eye, target, up, aspect, fovDegrees);
  graph.addCamera(camera);
}

function createLights(graph) {
  const lightPos = v3.create(10, 10, 10);
  const light = new Light(lightPos, v3.create(1, 1, 1));
  graph.addLight(light);
}

function createGeometry(graph) {
  const phongInfo = createShaders(gl, phongShader);

  const numCubes = 10;
  for (let i = 0; i < numCubes; ++i) {
    const cubeTransform = randomTransform(0.0, 0.0);
    const cubeMat = new Material();
    cubeMat.randomize();
    cubeMat.shininess = 32.0;
    const cube = new Primitive('cube', phongInfo, cubeMat, cubeTransform);
    graph.addGeom(cube);
  }

  const numSpheres = 10;
  for (let i = 0; i < numSpheres; ++i) {
    const sphereTransform = randomTransform(0.0, 0.0);
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
}