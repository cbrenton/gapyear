import * as twgl from 'twgl.js';

window.showHUD = false;

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

export function createShaders(gl, shaders) {
  return twgl.createProgramInfo(gl, [shaders.vs, shaders.fs]);
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