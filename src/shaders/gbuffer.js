'use strict';

const shader = {
  vs: `#version 300 es
in vec4 position;
in vec3 normal;
in vec2 texcoord;

uniform mat4 u_modelMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;
uniform vec3 u_cameraPos;
uniform vec3 u_lightPos;

out vec3 v_normal;
out vec2 v_texcoord;
out vec4 v_worldSpacePosition;

void main() {
  mat4 mvp = u_projectionMatrix * u_viewMatrix * u_modelMatrix;
  gl_Position = mvp * position;
  v_worldSpacePosition = u_modelMatrix * position;

  mat4 modelInverseTranspose = transpose(inverse(u_modelMatrix));
  v_normal = mat3(modelInverseTranspose) * normal;

  v_texcoord = texcoord;
}`,
  fs: `#version 300 es
precision mediump float;

in vec3 v_normal;
in vec3 v_surfToLight;
in vec3 v_viewVec;
in vec2 v_texcoord;
in vec4 v_worldSpacePosition;

uniform vec3 u_diffuseColor;
uniform vec3 u_specularColor;
uniform vec3 u_ambientColor;
uniform vec3 u_lightColor;
uniform float u_shininess;
uniform float u_shininessMax;
uniform float u_specularIntensity;
uniform sampler2D u_texture;

layout(location = 0) out vec4 g_albedo;
layout(location = 1) out vec4 g_normal;
layout(location = 2) out vec4 g_shininess;
layout(location = 3) out vec4 g_position;

void main() {
  g_albedo = vec4(u_diffuseColor, 1) * texture(u_texture, v_texcoord);
  g_normal = vec4(normalize(v_normal), 1);
  g_shininess = vec4(u_shininess / u_shininessMax, u_specularIntensity, 0, 1);
  g_position = v_worldSpacePosition;
}`,
};

export default shader;