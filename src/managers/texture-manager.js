'use strict';

export const TextureManager = {
  init: function(gl) {
    if (this.textures !== undefined) {
      throw new Error('TextureManager is already initialized');
    }
    this.textures = createTextures(gl);
  }
};

function createTextures(gl) {
  const textures = {};

  const checkerboardTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, checkerboardTexture);
  gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.LUMINANCE, 8, 8, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE,
      new Uint8Array([
        0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xCC, 0xFF, 0xCC,
        0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        0xFF, 0xCC, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xFF,
        0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xCC, 0xFF, 0xCC, 0xFF,
        0xCC, 0xFF, 0xCC, 0xFF, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        0xCC, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
      ]));
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  textures.checkerboardTexture = checkerboardTexture;

  const blackCheckerboardTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, blackCheckerboardTexture);
  gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.LUMINANCE, 8, 8, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE,
      new Uint8Array([
        0x00, 0xA3, 0x00, 0xA3, 0x00, 0xA3, 0x00, 0xA3, 0xA3, 0x00, 0xA3,
        0x00, 0xA3, 0x00, 0xA3, 0x00, 0x00, 0xA3, 0x00, 0xA3, 0x00, 0xA3,
        0x00, 0xA3, 0xA3, 0x00, 0xA3, 0x00, 0xA3, 0x00, 0xA3, 0x00, 0x00,
        0xA3, 0x00, 0xA3, 0x00, 0xA3, 0x00, 0xA3, 0xA3, 0x00, 0xA3, 0x00,
        0xA3, 0x00, 0xA3, 0x00, 0x00, 0xA3, 0x00, 0xA3, 0x00, 0xA3, 0x00,
        0xA3, 0xA3, 0x00, 0xA3, 0x00, 0xA3, 0x00, 0xA3, 0x00,
      ]));
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  textures.blackCheckerboardTexture = blackCheckerboardTexture;

  gl.bindTexture(gl.TEXTURE_2D, null);

  return textures;
};