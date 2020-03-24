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
out vec3 v_surfToLight;
out vec3 v_viewVec;
out vec2 v_texcoord;

void main() {
  mat4 mvp = u_projectionMatrix * u_viewMatrix * u_modelMatrix;
  gl_Position = mvp * position;

  mat4 modelInverseTranspose = transpose(inverse(u_modelMatrix));
  v_normal = mat3(modelInverseTranspose) * normal;

  vec3 surfaceWorldPos = vec3(u_modelMatrix * position);
  v_surfToLight = u_lightPos - surfaceWorldPos;
  v_viewVec = u_cameraPos - surfaceWorldPos;
  v_texcoord = texcoord;
}`,
  fs: `#version 300 es
precision mediump float;

in vec3 v_normal;
in vec3 v_surfToLight;
in vec3 v_viewVec;
in vec2 v_texcoord;

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

void main() {
  g_albedo = vec4(u_diffuseColor, 1) * texture(u_texture, v_texcoord);
  g_normal = vec4(normalize(v_normal), 1);
  g_shininess = vec4(u_shininess / u_shininessMax, u_specularIntensity, 0, 1);
}`,
};

export default shader;