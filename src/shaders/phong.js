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
uniform sampler2D u_texture;

out vec4 finalColor;

void main() {
  vec3 N = normalize(v_normal);
  vec3 L = normalize(v_surfToLight);
  vec3 V = normalize(v_viewVec);
  vec3 R = reflect(-L, N);

  vec3 diffuse = u_diffuseColor * u_lightColor * max(dot(N, L), 0.0);

  vec3 specular = u_specularColor * u_lightColor * pow(max(dot(V, R), 0.0), u_shininess);

  vec3 ambient = u_ambientColor * u_lightColor * 0.1;
  
  vec3 lightContrib = diffuse + specular + ambient;

  vec3 texResult = texture(u_texture, v_texcoord).xyz;

  finalColor = vec4(lightContrib * texResult, 1);
}`,
};

export default shader;