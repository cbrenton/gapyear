'use strict';

const shader = {
  vs: `#version 300 es
in vec4 position;
in vec3 normal;

uniform mat4 u_modelMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;
uniform vec3 u_cameraPos;

out vec3 v_normal;
out vec3 v_surfToLight;
out vec3 v_viewVec;

void main() {
  mat4 mvp = u_projectionMatrix * u_viewMatrix * u_modelMatrix;
  gl_Position = mvp * position;

  mat4 modelInverseTranspose = transpose(inverse(u_modelMatrix));
  v_normal = mat3(modelInverseTranspose) * normal;

  vec3 u_lightPos = vec3(10, 10, 0);

  vec3 surfaceWorldPos = vec3(u_modelMatrix * position);
  v_surfToLight = u_lightPos - surfaceWorldPos;
  v_viewVec = u_cameraPos - surfaceWorldPos;
}`,
  fs: `#version 300 es
precision mediump float;

in vec3 v_normal;
in vec3 v_surfToLight;
in vec3 v_viewVec;

uniform vec3 u_diffuseColor;
uniform vec3 u_specularColor;
uniform vec3 u_ambientColor;
uniform float u_shininess;

out vec4 finalColor;

void main() {
  vec3 N = normalize(v_normal);
  vec3 L = normalize(v_surfToLight);
  vec3 V = normalize(v_viewVec);
  vec3 R = reflect(-L, v_normal);

  vec3 diffuse = u_diffuseColor * max(dot(N, L), 0.0);

  vec3 specular = u_specularColor * pow(max(dot(V, R), 0.0), u_shininess);

  vec3 ambient = u_ambientColor * 0.1;
  
  vec3 result = diffuse + specular + ambient;
  finalColor = vec4(result, 1);
}`,
};

export default shader;