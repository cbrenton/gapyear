'use strict';

export class Light {
  constructor(position, color) {
    this.position = position;
    this.color = color;

    this.tag = 'light';
  }

  draw(gl, globalUniforms) {
    throw Error('unimplemented method draw()');
  }
}