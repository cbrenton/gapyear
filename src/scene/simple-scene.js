'use strict';

import {v3, m4} from 'twgl.js';

import {SceneGraph} from 'scene/scene-graph.js';
import {Camera} from 'scene/camera.js';
import {Light} from 'scene/light.js';
import {Primitive} from 'scene/primitive.js';
import {Material} from 'scene/material.js';
import {randomTransform} from 'util/scene-helpers.js';
import phongShader from 'shaders/phong.js';

export function createSimpleScene(gl, textures) {
  const graph = new SceneGraph(gl);

  createCameras(gl, graph);

  createLights(gl, graph);

  createGeometry(gl, graph, textures);

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

function createLights(gl, graph) {
  const lights = {
    0: v3.create(1, 0, 0),
    1: v3.create(0, 1, 0),
    2: v3.create(0, 0, 1),
  };
  for (const lightNdx in lights) {
    const lightPos = v3.create(-3 + lightNdx * 3, 0, 0);
    const lightColor = lights[lightNdx];
    const light = new Light(gl, lightPos, lightColor);
    graph.addLight(light);
  }
}

function createGeometry(gl, graph, textures) {
  const numCubes = 10;
  for (let i = 0; i < numCubes; ++i) {
    const cubeTransform = randomTransform(0.0, 0.0);
    const cubeMat = new Material();
    cubeMat.randomize();
    cubeMat.shininess = 32.0;
    const cube = new Primitive(gl, phongShader, 'cube', cubeMat, cubeTransform);
    graph.addGeom(cube);
  }

  const numSpheres = 10;
  for (let i = 0; i < numSpheres; ++i) {
    const sphereTransform = randomTransform(0.0, 0.0);
    const sphereMat = new Material();
    sphereMat.randomize();
    const sphere =
        new Primitive(gl, phongShader, 'sphere', sphereMat, sphereTransform);
    graph.addGeom(sphere);
  }

  const planeTransform = m4.translation([0, -1, 0]);
  m4.scale(planeTransform, [20, 20, 20], planeTransform);
  const planeMat = new Material();
  planeMat.randomize('monochrome');
  planeMat.addTexture(textures.checkerboardTexture);
  const plane =
      new Primitive(gl, phongShader, 'plane', planeMat, planeTransform);
  graph.addGeom(plane);
}

export function createTextures(gl) {
  const textures = {};

  const checkerboardTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, checkerboardTexture);
  gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.LUMINANCE, 8, 8, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE,
      new Uint8Array([
        0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xCC, 0xFF, 0xCC,
        0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        0xFF, 0xCC, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xFF,
        0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xCC, 0xFF, 0xCC, 0xFF,
        0xCC, 0xFF, 0xCC, 0xFF, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        0xCC, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
      ]));
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  textures.checkerboardTexture = checkerboardTexture;

  const blackCheckerboardTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, blackCheckerboardTexture);
  gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.LUMINANCE, 8, 8, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE,
      new Uint8Array([
        0x00, 0xA3, 0x00, 0xA3, 0x00, 0xA3, 0x00, 0xA3, 0xA3, 0x00, 0xA3,
        0x00, 0xA3, 0x00, 0xA3, 0x00, 0x00, 0xA3, 0x00, 0xA3, 0x00, 0xA3,
        0x00, 0xA3, 0xA3, 0x00, 0xA3, 0x00, 0xA3, 0x00, 0xA3, 0x00, 0x00,
        0xA3, 0x00, 0xA3, 0x00, 0xA3, 0x00, 0xA3, 0xA3, 0x00, 0xA3, 0x00,
        0xA3, 0x00, 0xA3, 0x00, 0x00, 0xA3, 0x00, 0xA3, 0x00, 0xA3, 0x00,
        0xA3, 0xA3, 0x00, 0xA3, 0x00, 0xA3, 0x00, 0xA3, 0x00,
      ]));
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  textures.blackCheckerboardTexture = blackCheckerboardTexture;

  gl.bindTexture(gl.TEXTURE_2D, null);

  return textures;
}