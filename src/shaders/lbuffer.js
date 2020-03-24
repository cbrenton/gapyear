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

uniform sampler2D u_albedoTexture;
uniform sampler2D u_normalTexture;
uniform sampler2D u_specularTexture;

uniform float u_resolutionX;
uniform float u_resolutionY;

out vec4 finalColor;

void main() {
  vec2 texcoord = vec2(gl_FragCoord.x / u_resolutionX, gl_FragCoord.y / u_resolutionY);

  vec4 albedo = texture(u_albedoTexture, texcoord);
  vec4 normal = texture(u_normalTexture, texcoord);
  vec4 specular = texture(u_specularTexture, texcoord);

  finalColor = albedo;
}`,
};

export default shader;