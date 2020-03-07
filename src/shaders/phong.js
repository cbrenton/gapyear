'use strict';

const shader = {
  vs: `#version 300 es
in vec4 position;

uniform mat4 u_modelMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;

void main() {
  mat4 mvp = u_projectionMatrix * u_viewMatrix * u_modelMatrix;
  gl_Position = mvp * position;
}`,
  fs: `#version 300 es
precision mediump float;

uniform vec3 u_diffuseColor;

out vec4 finalColor;

void main() {
  finalColor = vec4(1, 0, 0, 1);
}`,
};

export default shader;