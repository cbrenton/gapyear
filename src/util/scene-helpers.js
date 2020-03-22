import {randomColor as randomAttractiveColor} from 'randomcolor/randomColor.js';
import * as twgl from 'twgl.js';

window.showHUD = false;

const m4 = twgl.m4;
const v3 = twgl.v3;

/* ======== GL helper functions ======== */

export function createCanvas(description) {
  const centeredDivHolder = document.createElement('div');
  centeredDivHolder.setAttribute('class', 'centeredDivHolder');

  const relativeHolder = document.createElement('div');
  relativeHolder.setAttribute('class', 'relativeHolder');
  centeredDivHolder.appendChild(relativeHolder);

  const canvasesHolder = document.createElement('div');
  canvasesHolder.setAttribute('class', 'canvasesHolder');
  relativeHolder.appendChild(canvasesHolder);

  const canvas = document.createElement('canvas');
  canvas.setAttribute('class', 'inner');
  canvas.setAttribute('id', `c`);
  canvasesHolder.appendChild(canvas);

  const textCanvas = document.createElement('canvas');
  textCanvas.setAttribute('class', 'overlay');
  textCanvas.setAttribute('id', `overlay`);
  canvasesHolder.appendChild(textCanvas);

  if (description !== undefined) {
    const label = document.createElement('span');
    label.innerHTML = description;
    label.setAttribute('class', 'inner label');
    canvasesHolder.appendChild(label);
  }

  document.body.appendChild(centeredDivHolder);
  resizeCanvasToMatchDisplaySize(canvas);
  return canvas;
}

export function createGLCanvas(description) {
  const canvas = createCanvas(description);
  const gl = initGL(canvas);
  return gl;
}

export function getOverlay() {
  const overlay = document.getElementById(`overlay`);
  return overlay.getContext('2d');
}

export function drawBuffer(
    gl, programInfo, bufferInfo, uniforms, globalUniforms) {
  gl.useProgram(programInfo.program);

  if (globalUniforms !== undefined) {
    twgl.setUniforms(programInfo, globalUniforms);
  }
  twgl.setUniforms(programInfo, uniforms);

  twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);

  twgl.drawBufferInfo(gl, bufferInfo);
}

/* ======== Utility functions ======== */

export function degToRad(degrees) {
  return degrees * Math.PI / 180;
}

export function randomColor(hue) {
  const args = {format: 'rgbArray'};
  if (hue !== undefined) {
    args.hue = hue;
  }
  const color = randomAttractiveColor(args);
  const colorVec = v3.create(color[0] / 255, color[1] / 255, color[2] / 255);
  return colorVec;
}

export function randomTransform(yMin, zMax) {
  let transform = m4.identity();

  // Translate
  const max = 6.0;
  const randomTranslate = v3.create(
      Math.random() * max * 2 - max,
      Math.max(Math.random() * max * 2 - max, yMin),
      Math.min(Math.random() * max * 2 - max, zMax));
  m4.translate(transform, randomTranslate, transform);

  // Rotate
  const randomRotation = v3.create(
      Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI,
      Math.random() * 2 * Math.PI);
  m4.rotateX(transform, randomRotation[0], transform);
  m4.rotateY(transform, randomRotation[1], transform);
  m4.rotateZ(transform, randomRotation[2], transform);

  // Scale
  const scaleFactor = Math.random();
  const randomScale = v3.create(scaleFactor, scaleFactor, scaleFactor);
  m4.scale(transform, randomScale, transform);
  return transform;
}

/* ======== Private functions ======== */

function initGL(canvas) {
  const gl = canvas.getContext('webgl2');
  if (!gl) {
    window.alert('Couldn\'t get WebGL context');
  }
  window.gl = gl;
  return gl;
}

function resizeCanvasToMatchDisplaySize(canvas) {
  // look up the size the canvas is displayed
  var desiredWidth = canvas.clientWidth;
  var desiredHeight = canvas.clientHeight;

  // if the number of pixels in the canvas doesn't match
  // update the canvas's content size.
  if (canvas.width != desiredWidth || canvas.height != desiredHeight) {
    canvas.width = desiredWidth;
    canvas.height = desiredHeight;
  }
}