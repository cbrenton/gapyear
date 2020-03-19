'use strict';

export class Light {
  constructor(gl, position, color) {
    this.gl = gl;
    this.position = position;
    this.color = color;

    this.tag = 'light';
  }

  draw(gl, globalUniforms) {
    throw Error('unimplemented method draw()');
  }
}