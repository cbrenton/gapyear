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

uniform float u_resolutionX;
uniform float u_resolutionY;

uniform vec3 u_cameraPos;
uniform vec3 u_lightPos;
uniform vec3 u_lightColor;
uniform float u_lightRadius;
uniform float u_shininessMax;
uniform float u_lightConstant;
uniform float u_lightLinear;
uniform float u_lightQuadratic;

uniform sampler2D u_albedoTexture;
uniform sampler2D u_normalTexture;
uniform sampler2D u_specularTexture;
uniform sampler2D u_positionTexture;

layout(location = 0) out vec4 lightingResult;
layout(location = 1) out vec4 lightGeometry;

vec3 lightContrib(
    vec3 surfaceWorldPos,
    vec3 surfToLight,
    vec3 normal,
    vec3 albedo,
    float shininess,
    float specularIntensity,
    vec3 lightColor) {
  vec3 L = normalize(surfToLight);
  vec3 N = normalize(normal);
  vec3 V = normalize(u_cameraPos - surfaceWorldPos);

  // Diffuse
  vec3 diffuse = lightColor * max(dot(L, N), 0.0) * albedo;

  // Specular (Blinn-Phong)
  vec3 H = normalize(V + L);
  float scaledShininess = shininess * u_shininessMax;
  vec3 specular = lightColor * specularIntensity;
  specular *= pow(max(dot(H, N), 0.0), scaledShininess);

  vec3 result = diffuse + specular;
  return result;
}

float getAttenuation(float distance) {
  return 1.0 / (u_lightConstant + u_lightLinear * distance +
    u_lightQuadratic * (distance * distance));
}

vec3 shade(vec2 texcoord) {
  vec3 fragWorld = texture(u_positionTexture, texcoord).xyz;
  vec3 normal = texture(u_normalTexture, texcoord).xyz;
  vec3 albedo = texture(u_albedoTexture, texcoord).xyz;
  float shininess = texture(u_specularTexture, texcoord).x;
  float specularIntensity = texture(u_specularTexture, texcoord).y;
  vec3 fragToLight = u_lightPos - fragWorld;
  
  vec3 contrib = lightContrib(
    fragWorld,
    fragToLight,
    normal,
    albedo,
    shininess,
    specularIntensity,
    u_lightColor);

  return contrib * getAttenuation(length(fragToLight));
}

void main() {
  lightGeometry = vec4(1, 1, 1, 1);

  vec2 texcoord = vec2(gl_FragCoord.x / u_resolutionX,
    gl_FragCoord.y / u_resolutionY);

  vec3 lightWorldPos = u_lightPos;
  vec3 fragWorldPos = texture(u_positionTexture, texcoord).xyz;
  vec3 fragToLightVec = fragWorldPos - lightWorldPos;

  // @NOTE: this is SUPER SUPER hacky. this needs to go asap but
  // I'm leaving it in to get the first pass working
  if (fragWorldPos.z != 0.0) {
    // If inside light's area of influence, shade the fragment
    if (length(fragToLightVec) <= u_lightRadius) {
      lightingResult = vec4(shade(texcoord), 0.5);
      return;
    } else {
      lightingResult = vec4(0, 0, 0, 1);
    }
  }
}`,
};

export default shader;