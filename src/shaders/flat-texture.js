'use strict';

const shader = {
  vs: `#version 300 es
in vec4 position;
in vec2 texcoord;

uniform mat4 u_modelMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;

out vec2 v_texcoord;

void main() {
  mat4 mvp = u_projectionMatrix * u_viewMatrix * u_modelMatrix;

  gl_Position = mvp * position;

  v_texcoord = texcoord;
}`,
  fs: `#version 300 es
precision mediump float;

in vec2 v_texcoord;

uniform sampler2D u_texture;

out vec4 finalColor;

void main() {
  finalColor = texture(u_texture, v_texcoord);
}`,
};

export default shader;
