(function () {
	'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var randomColor = createCommonjsModule(function (module, exports) {
	(function(root, factory) {

	  // Support CommonJS
	  {
	    var randomColor = factory();

	    // Support NodeJS & Component, which allow module.exports to be a function
	    if ( module && module.exports) {
	      exports = module.exports = randomColor;
	    }

	    // Support CommonJS 1.1.1 spec
	    exports.randomColor = randomColor;

	  // Support AMD
	  }

	}(commonjsGlobal, function() {

	  // Seed to get repeatable colors
	  var seed = null;

	  // Shared color dictionary
	  var colorDictionary = {};

	  // Populate the color dictionary
	  loadColorBounds();

	  // check if a range is taken
	  var colorRanges = [];

	  var randomColor = function (options) {

	    options = options || {};

	    // Check if there is a seed and ensure it's an
	    // integer. Otherwise, reset the seed value.
	    if (options.seed !== undefined && options.seed !== null && options.seed === parseInt(options.seed, 10)) {
	      seed = options.seed;

	    // A string was passed as a seed
	    } else if (typeof options.seed === 'string') {
	      seed = stringToInteger(options.seed);

	    // Something was passed as a seed but it wasn't an integer or string
	    } else if (options.seed !== undefined && options.seed !== null) {
	      throw new TypeError('The seed value must be an integer or string');

	    // No seed, reset the value outside.
	    } else {
	      seed = null;
	    }

	    var H,S,B;

	    // Check if we need to generate multiple colors
	    if (options.count !== null && options.count !== undefined) {

	      var totalColors = options.count,
	          colors = [];
	      // Value false at index i means the range i is not taken yet.
	      for (var i = 0; i < options.count; i++) {
	        colorRanges.push(false);
	        }
	      options.count = null;

	      while (totalColors > colors.length) {

	        // Since we're generating multiple colors,
	        // incremement the seed. Otherwise we'd just
	        // generate the same color each time...
	        if (seed && options.seed) options.seed += 1;

	        colors.push(randomColor(options));
	      }

	      options.count = totalColors;

	      return colors;
	    }

	    // First we pick a hue (H)
	    H = pickHue(options);

	    // Then use H to determine saturation (S)
	    S = pickSaturation(H, options);

	    // Then use S and H to determine brightness (B).
	    B = pickBrightness(H, S, options);

	    // Then we return the HSB color in the desired format
	    return setFormat([H,S,B], options);
	  };

	  function pickHue(options) {
	    if (colorRanges.length > 0) {
	      var hueRange = getRealHueRange(options.hue);

	      var hue = randomWithin(hueRange);

	      //Each of colorRanges.length ranges has a length equal approximatelly one step
	      var step = (hueRange[1] - hueRange[0]) / colorRanges.length;

	      var j = parseInt((hue - hueRange[0]) / step);

	      //Check if the range j is taken
	      if (colorRanges[j] === true) {
	        j = (j + 2) % colorRanges.length;
	      }
	      else {
	        colorRanges[j] = true;
	           }

	      var min = (hueRange[0] + j * step) % 359,
	          max = (hueRange[0] + (j + 1) * step) % 359;

	      hueRange = [min, max];

	      hue = randomWithin(hueRange);

	      if (hue < 0) {hue = 360 + hue;}
	      return hue
	    }
	    else {
	      var hueRange = getHueRange(options.hue);

	      hue = randomWithin(hueRange);
	      // Instead of storing red as two seperate ranges,
	      // we group them, using negative numbers
	      if (hue < 0) {
	        hue = 360 + hue;
	      }

	      return hue;
	    }
	  }

	  function pickSaturation (hue, options) {

	    if (options.hue === 'monochrome') {
	      return 0;
	    }

	    if (options.luminosity === 'random') {
	      return randomWithin([0,100]);
	    }

	    var saturationRange = getSaturationRange(hue);

	    var sMin = saturationRange[0],
	        sMax = saturationRange[1];

	    switch (options.luminosity) {

	      case 'bright':
	        sMin = 55;
	        break;

	      case 'dark':
	        sMin = sMax - 10;
	        break;

	      case 'light':
	        sMax = 55;
	        break;
	   }

	    return randomWithin([sMin, sMax]);

	  }

	  function pickBrightness (H, S, options) {

	    var bMin = getMinimumBrightness(H, S),
	        bMax = 100;

	    switch (options.luminosity) {

	      case 'dark':
	        bMax = bMin + 20;
	        break;

	      case 'light':
	        bMin = (bMax + bMin)/2;
	        break;

	      case 'random':
	        bMin = 0;
	        bMax = 100;
	        break;
	    }

	    return randomWithin([bMin, bMax]);
	  }

	  function setFormat (hsv, options) {

	    switch (options.format) {

	      case 'hsvArray':
	        return hsv;

	      case 'hslArray':
	        return HSVtoHSL(hsv);

	      case 'hsl':
	        var hsl = HSVtoHSL(hsv);
	        return 'hsl('+hsl[0]+', '+hsl[1]+'%, '+hsl[2]+'%)';

	      case 'hsla':
	        var hslColor = HSVtoHSL(hsv);
	        var alpha = options.alpha || Math.random();
	        return 'hsla('+hslColor[0]+', '+hslColor[1]+'%, '+hslColor[2]+'%, ' + alpha + ')';

	      case 'rgbArray':
	        return HSVtoRGB(hsv);

	      case 'rgb':
	        var rgb = HSVtoRGB(hsv);
	        return 'rgb(' + rgb.join(', ') + ')';

	      case 'rgba':
	        var rgbColor = HSVtoRGB(hsv);
	        var alpha = options.alpha || Math.random();
	        return 'rgba(' + rgbColor.join(', ') + ', ' + alpha + ')';

	      default:
	        return HSVtoHex(hsv);
	    }

	  }

	  function getMinimumBrightness(H, S) {

	    var lowerBounds = getColorInfo(H).lowerBounds;

	    for (var i = 0; i < lowerBounds.length - 1; i++) {

	      var s1 = lowerBounds[i][0],
	          v1 = lowerBounds[i][1];

	      var s2 = lowerBounds[i+1][0],
	          v2 = lowerBounds[i+1][1];

	      if (S >= s1 && S <= s2) {

	         var m = (v2 - v1)/(s2 - s1),
	             b = v1 - m*s1;

	         return m*S + b;
	      }

	    }

	    return 0;
	  }

	  function getHueRange (colorInput) {

	    if (typeof parseInt(colorInput) === 'number') {

	      var number = parseInt(colorInput);

	      if (number < 360 && number > 0) {
	        return [number, number];
	      }

	    }

	    if (typeof colorInput === 'string') {

	      if (colorDictionary[colorInput]) {
	        var color = colorDictionary[colorInput];
	        if (color.hueRange) {return color.hueRange;}
	      } else if (colorInput.match(/^#?([0-9A-F]{3}|[0-9A-F]{6})$/i)) {
	        var hue = HexToHSB(colorInput)[0];
	        return [ hue, hue ];
	      }
	    }

	    return [0,360];

	  }

	  function getSaturationRange (hue) {
	    return getColorInfo(hue).saturationRange;
	  }

	  function getColorInfo (hue) {

	    // Maps red colors to make picking hue easier
	    if (hue >= 334 && hue <= 360) {
	      hue-= 360;
	    }

	    for (var colorName in colorDictionary) {
	       var color = colorDictionary[colorName];
	       if (color.hueRange &&
	           hue >= color.hueRange[0] &&
	           hue <= color.hueRange[1]) {
	          return colorDictionary[colorName];
	       }
	    } return 'Color not found';
	  }

	  function randomWithin (range) {
	    if (seed === null) {
	      //generate random evenly destinct number from : https://martin.ankerl.com/2009/12/09/how-to-create-random-colors-programmatically/
	      var golden_ratio = 0.618033988749895;
	      var r=Math.random();
	      r += golden_ratio;
	      r %= 1;
	      return Math.floor(range[0] + r*(range[1] + 1 - range[0]));
	    } else {
	      //Seeded random algorithm from http://indiegamr.com/generate-repeatable-random-numbers-in-js/
	      var max = range[1] || 1;
	      var min = range[0] || 0;
	      seed = (seed * 9301 + 49297) % 233280;
	      var rnd = seed / 233280.0;
	      return Math.floor(min + rnd * (max - min));
	}
	  }

	  function HSVtoHex (hsv){

	    var rgb = HSVtoRGB(hsv);

	    function componentToHex(c) {
	        var hex = c.toString(16);
	        return hex.length == 1 ? '0' + hex : hex;
	    }

	    var hex = '#' + componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2]);

	    return hex;

	  }

	  function defineColor (name, hueRange, lowerBounds) {

	    var sMin = lowerBounds[0][0],
	        sMax = lowerBounds[lowerBounds.length - 1][0],

	        bMin = lowerBounds[lowerBounds.length - 1][1],
	        bMax = lowerBounds[0][1];

	    colorDictionary[name] = {
	      hueRange: hueRange,
	      lowerBounds: lowerBounds,
	      saturationRange: [sMin, sMax],
	      brightnessRange: [bMin, bMax]
	    };

	  }

	  function loadColorBounds () {

	    defineColor(
	      'monochrome',
	      null,
	      [[0,0],[100,0]]
	    );

	    defineColor(
	      'red',
	      [-26,18],
	      [[20,100],[30,92],[40,89],[50,85],[60,78],[70,70],[80,60],[90,55],[100,50]]
	    );

	    defineColor(
	      'orange',
	      [19,46],
	      [[20,100],[30,93],[40,88],[50,86],[60,85],[70,70],[100,70]]
	    );

	    defineColor(
	      'yellow',
	      [47,62],
	      [[25,100],[40,94],[50,89],[60,86],[70,84],[80,82],[90,80],[100,75]]
	    );

	    defineColor(
	      'green',
	      [63,178],
	      [[30,100],[40,90],[50,85],[60,81],[70,74],[80,64],[90,50],[100,40]]
	    );

	    defineColor(
	      'blue',
	      [179, 257],
	      [[20,100],[30,86],[40,80],[50,74],[60,60],[70,52],[80,44],[90,39],[100,35]]
	    );

	    defineColor(
	      'purple',
	      [258, 282],
	      [[20,100],[30,87],[40,79],[50,70],[60,65],[70,59],[80,52],[90,45],[100,42]]
	    );

	    defineColor(
	      'pink',
	      [283, 334],
	      [[20,100],[30,90],[40,86],[60,84],[80,80],[90,75],[100,73]]
	    );

	  }

	  function HSVtoRGB (hsv) {

	    // this doesn't work for the values of 0 and 360
	    // here's the hacky fix
	    var h = hsv[0];
	    if (h === 0) {h = 1;}
	    if (h === 360) {h = 359;}

	    // Rebase the h,s,v values
	    h = h/360;
	    var s = hsv[1]/100,
	        v = hsv[2]/100;

	    var h_i = Math.floor(h*6),
	      f = h * 6 - h_i,
	      p = v * (1 - s),
	      q = v * (1 - f*s),
	      t = v * (1 - (1 - f)*s),
	      r = 256,
	      g = 256,
	      b = 256;

	    switch(h_i) {
	      case 0: r = v; g = t; b = p;  break;
	      case 1: r = q; g = v; b = p;  break;
	      case 2: r = p; g = v; b = t;  break;
	      case 3: r = p; g = q; b = v;  break;
	      case 4: r = t; g = p; b = v;  break;
	      case 5: r = v; g = p; b = q;  break;
	    }

	    var result = [Math.floor(r*255), Math.floor(g*255), Math.floor(b*255)];
	    return result;
	  }

	  function HexToHSB (hex) {
	    hex = hex.replace(/^#/, '');
	    hex = hex.length === 3 ? hex.replace(/(.)/g, '$1$1') : hex;

	    var red = parseInt(hex.substr(0, 2), 16) / 255,
	          green = parseInt(hex.substr(2, 2), 16) / 255,
	          blue = parseInt(hex.substr(4, 2), 16) / 255;

	    var cMax = Math.max(red, green, blue),
	          delta = cMax - Math.min(red, green, blue),
	          saturation = cMax ? (delta / cMax) : 0;

	    switch (cMax) {
	      case red: return [ 60 * (((green - blue) / delta) % 6) || 0, saturation, cMax ];
	      case green: return [ 60 * (((blue - red) / delta) + 2) || 0, saturation, cMax ];
	      case blue: return [ 60 * (((red - green) / delta) + 4) || 0, saturation, cMax ];
	    }
	  }

	  function HSVtoHSL (hsv) {
	    var h = hsv[0],
	      s = hsv[1]/100,
	      v = hsv[2]/100,
	      k = (2-s)*v;

	    return [
	      h,
	      Math.round(s*v / (k<1 ? k : 2-k) * 10000) / 100,
	      k/2 * 100
	    ];
	  }

	  function stringToInteger (string) {
	    var total = 0;
	    for (var i = 0; i !== string.length; i++) {
	      if (total >= Number.MAX_SAFE_INTEGER) break;
	      total += string.charCodeAt(i);
	    }
	    return total
	  }

	  // get The range of given hue when options.count!=0
	  function getRealHueRange(colorHue)
	  { if (!isNaN(colorHue)) {
	    var number = parseInt(colorHue);

	    if (number < 360 && number > 0) {
	      return getColorInfo(colorHue).hueRange
	    }
	  }
	    else if (typeof colorHue === 'string') {

	      if (colorDictionary[colorHue]) {
	        var color = colorDictionary[colorHue];

	        if (color.hueRange) {
	          return color.hueRange
	       }
	    } else if (colorHue.match(/^#?([0-9A-F]{3}|[0-9A-F]{6})$/i)) {
	        var hue = HexToHSB(colorHue)[0];
	        return getColorInfo(hue).hueRange
	    }
	  }

	    return [0,360]
	}
	  return randomColor;
	}));
	});
	var randomColor_1 = randomColor.randomColor;

	/* @license twgl.js 4.14.2 Copyright (c) 2015, Gregg Tavares All Rights Reserved.
	Available via the MIT license.
	see: http://github.com/greggman/twgl.js for details */
	/*
	 * Copyright 2019 Gregg Tavares
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining a
	 * copy of this software and associated documentation files (the "Software"),
	 * to deal in the Software without restriction, including without limitation
	 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
	 * and/or sell copies of the Software, and to permit persons to whom the
	 * Software is furnished to do so, subject to the following conditions:
	 *
	 * The above copyright notice and this permission notice shall be included in
	 * all copies or substantial portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL
	 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
	 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
	 * DEALINGS IN THE SOFTWARE.
	 */

	/**
	 *
	 * Vec3 math math functions.
	 *
	 * Almost all functions take an optional `dst` argument. If it is not passed in the
	 * functions will create a new Vec3. In other words you can do this
	 *
	 *     var v = v3.cross(v1, v2);  // Creates a new Vec3 with the cross product of v1 x v2.
	 *
	 * or
	 *
	 *     var v = v3.create();
	 *     v3.cross(v1, v2, v);  // Puts the cross product of v1 x v2 in v
	 *
	 * The first style is often easier but depending on where it's used it generates garbage where
	 * as there is almost never allocation with the second style.
	 *
	 * It is always save to pass any vector as the destination. So for example
	 *
	 *     v3.cross(v1, v2, v1);  // Puts the cross product of v1 x v2 in v1
	 *
	 * @module twgl/v3
	 */

	let VecType = Float32Array;

	/**
	 * A JavaScript array with 3 values or a Float32Array with 3 values.
	 * When created by the library will create the default type which is `Float32Array`
	 * but can be set by calling {@link module:twgl/v3.setDefaultType}.
	 * @typedef {(number[]|Float32Array)} Vec3
	 * @memberOf module:twgl/v3
	 */

	/**
	 * Sets the type this library creates for a Vec3
	 * @param {constructor} ctor the constructor for the type. Either `Float32Array` or `Array`
	 * @return {constructor} previous constructor for Vec3
	 * @memberOf module:twgl/v3
	 */
	function setDefaultType(ctor) {
	  const oldType = VecType;
	  VecType = ctor;
	  return oldType;
	}

	/**
	 * Creates a vec3; may be called with x, y, z to set initial values.
	 * @param {number} [x] Initial x value.
	 * @param {number} [y] Initial y value.
	 * @param {number} [z] Initial z value.
	 * @return {module:twgl/v3.Vec3} the created vector
	 * @memberOf module:twgl/v3
	 */
	function create(x, y, z) {
	  const dst = new VecType(3);
	  if (x) {
	    dst[0] = x;
	  }
	  if (y) {
	    dst[1] = y;
	  }
	  if (z) {
	    dst[2] = z;
	  }
	  return dst;
	}

	/**
	 * Adds two vectors; assumes a and b have the same dimension.
	 * @param {module:twgl/v3.Vec3} a Operand vector.
	 * @param {module:twgl/v3.Vec3} b Operand vector.
	 * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created.
	 * @return {module:twgl/v3.Vec3} A vector tha tis the sum of a and b.
	 * @memberOf module:twgl/v3
	 */
	function add(a, b, dst) {
	  dst = dst || new VecType(3);

	  dst[0] = a[0] + b[0];
	  dst[1] = a[1] + b[1];
	  dst[2] = a[2] + b[2];

	  return dst;
	}

	/**
	 * Subtracts two vectors.
	 * @param {module:twgl/v3.Vec3} a Operand vector.
	 * @param {module:twgl/v3.Vec3} b Operand vector.
	 * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created.
	 * @return {module:twgl/v3.Vec3} A vector that is the difference of a and b.
	 * @memberOf module:twgl/v3
	 */
	function subtract(a, b, dst) {
	  dst = dst || new VecType(3);

	  dst[0] = a[0] - b[0];
	  dst[1] = a[1] - b[1];
	  dst[2] = a[2] - b[2];

	  return dst;
	}

	/**
	 * Performs linear interpolation on two vectors.
	 * Given vectors a and b and interpolation coefficient t, returns
	 * a + t * (b - a).
	 * @param {module:twgl/v3.Vec3} a Operand vector.
	 * @param {module:twgl/v3.Vec3} b Operand vector.
	 * @param {number} t Interpolation coefficient.
	 * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created.
	 * @return {module:twgl/v3.Vec3} The linear interpolated result.
	 * @memberOf module:twgl/v3
	 */
	function lerp(a, b, t, dst) {
	  dst = dst || new VecType(3);

	  dst[0] = a[0] + t * (b[0] - a[0]);
	  dst[1] = a[1] + t * (b[1] - a[1]);
	  dst[2] = a[2] + t * (b[2] - a[2]);

	  return dst;
	}

	/**
	 * Performs linear interpolation on two vectors.
	 * Given vectors a and b and interpolation coefficient vector t, returns
	 * a + t * (b - a).
	 * @param {module:twgl/v3.Vec3} a Operand vector.
	 * @param {module:twgl/v3.Vec3} b Operand vector.
	 * @param {module:twgl/v3.Vec3} t Interpolation coefficients vector.
	 * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created.
	 * @return {module:twgl/v3.Vec3} the linear interpolated result.
	 * @memberOf module:twgl/v3
	 */
	function lerpV(a, b, t, dst) {
	  dst = dst || new VecType(3);

	  dst[0] = a[0] + t[0] * (b[0] - a[0]);
	  dst[1] = a[1] + t[1] * (b[1] - a[1]);
	  dst[2] = a[2] + t[2] * (b[2] - a[2]);

	  return dst;
	}

	/**
	 * Return max values of two vectors.
	 * Given vectors a and b returns
	 * [max(a[0], b[0]), max(a[1], b[1]), max(a[2], b[2])].
	 * @param {module:twgl/v3.Vec3} a Operand vector.
	 * @param {module:twgl/v3.Vec3} b Operand vector.
	 * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created.
	 * @return {module:twgl/v3.Vec3} The max components vector.
	 * @memberOf module:twgl/v3
	 */
	function max(a, b, dst) {
	  dst = dst || new VecType(3);

	  dst[0] = Math.max(a[0], b[0]);
	  dst[1] = Math.max(a[1], b[1]);
	  dst[2] = Math.max(a[2], b[2]);

	  return dst;
	}

	/**
	 * Return min values of two vectors.
	 * Given vectors a and b returns
	 * [min(a[0], b[0]), min(a[1], b[1]), min(a[2], b[2])].
	 * @param {module:twgl/v3.Vec3} a Operand vector.
	 * @param {module:twgl/v3.Vec3} b Operand vector.
	 * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created.
	 * @return {module:twgl/v3.Vec3} The min components vector.
	 * @memberOf module:twgl/v3
	 */
	function min(a, b, dst) {
	  dst = dst || new VecType(3);

	  dst[0] = Math.min(a[0], b[0]);
	  dst[1] = Math.min(a[1], b[1]);
	  dst[2] = Math.min(a[2], b[2]);

	  return dst;
	}

	/**
	 * Multiplies a vector by a scalar.
	 * @param {module:twgl/v3.Vec3} v The vector.
	 * @param {number} k The scalar.
	 * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created.
	 * @return {module:twgl/v3.Vec3} The scaled vector.
	 * @memberOf module:twgl/v3
	 */
	function mulScalar(v, k, dst) {
	  dst = dst || new VecType(3);

	  dst[0] = v[0] * k;
	  dst[1] = v[1] * k;
	  dst[2] = v[2] * k;

	  return dst;
	}

	/**
	 * Divides a vector by a scalar.
	 * @param {module:twgl/v3.Vec3} v The vector.
	 * @param {number} k The scalar.
	 * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created.
	 * @return {module:twgl/v3.Vec3} The scaled vector.
	 * @memberOf module:twgl/v3
	 */
	function divScalar(v, k, dst) {
	  dst = dst || new VecType(3);

	  dst[0] = v[0] / k;
	  dst[1] = v[1] / k;
	  dst[2] = v[2] / k;

	  return dst;
	}

	/**
	 * Computes the cross product of two vectors; assumes both vectors have
	 * three entries.
	 * @param {module:twgl/v3.Vec3} a Operand vector.
	 * @param {module:twgl/v3.Vec3} b Operand vector.
	 * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created.
	 * @return {module:twgl/v3.Vec3} The vector of a cross b.
	 * @memberOf module:twgl/v3
	 */
	function cross(a, b, dst) {
	  dst = dst || new VecType(3);

	  const t1 = a[2] * b[0] - a[0] * b[2];
	  const t2 = a[0] * b[1] - a[1] * b[0];
	  dst[0] = a[1] * b[2] - a[2] * b[1];
	  dst[1] = t1;
	  dst[2] = t2;

	  return dst;
	}

	/**
	 * Computes the dot product of two vectors; assumes both vectors have
	 * three entries.
	 * @param {module:twgl/v3.Vec3} a Operand vector.
	 * @param {module:twgl/v3.Vec3} b Operand vector.
	 * @return {number} dot product
	 * @memberOf module:twgl/v3
	 */
	function dot(a, b) {
	  return (a[0] * b[0]) + (a[1] * b[1]) + (a[2] * b[2]);
	}

	/**
	 * Computes the length of vector
	 * @param {module:twgl/v3.Vec3} v vector.
	 * @return {number} length of vector.
	 * @memberOf module:twgl/v3
	 */
	function length$1(v) {
	  return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
	}

	/**
	 * Computes the square of the length of vector
	 * @param {module:twgl/v3.Vec3} v vector.
	 * @return {number} square of the length of vector.
	 * @memberOf module:twgl/v3
	 */
	function lengthSq(v) {
	  return v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
	}

	/**
	 * Computes the distance between 2 points
	 * @param {module:twgl/v3.Vec3} a vector.
	 * @param {module:twgl/v3.Vec3} b vector.
	 * @return {number} distance between a and b
	 * @memberOf module:twgl/v3
	 */
	function distance(a, b) {
	  const dx = a[0] - b[0];
	  const dy = a[1] - b[1];
	  const dz = a[2] - b[2];
	  return Math.sqrt(dx * dx + dy * dy + dz * dz);
	}

	/**
	 * Computes the square of the distance between 2 points
	 * @param {module:twgl/v3.Vec3} a vector.
	 * @param {module:twgl/v3.Vec3} b vector.
	 * @return {number} square of the distance between a and b
	 * @memberOf module:twgl/v3
	 */
	function distanceSq(a, b) {
	  const dx = a[0] - b[0];
	  const dy = a[1] - b[1];
	  const dz = a[2] - b[2];
	  return dx * dx + dy * dy + dz * dz;
	}

	/**
	 * Divides a vector by its Euclidean length and returns the quotient.
	 * @param {module:twgl/v3.Vec3} a The vector.
	 * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created.
	 * @return {module:twgl/v3.Vec3} The normalized vector.
	 * @memberOf module:twgl/v3
	 */
	function normalize(a, dst) {
	  dst = dst || new VecType(3);

	  const lenSq = a[0] * a[0] + a[1] * a[1] + a[2] * a[2];
	  const len = Math.sqrt(lenSq);
	  if (len > 0.00001) {
	    dst[0] = a[0] / len;
	    dst[1] = a[1] / len;
	    dst[2] = a[2] / len;
	  } else {
	    dst[0] = 0;
	    dst[1] = 0;
	    dst[2] = 0;
	  }

	  return dst;
	}

	/**
	 * Negates a vector.
	 * @param {module:twgl/v3.Vec3} v The vector.
	 * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created.
	 * @return {module:twgl/v3.Vec3} -v.
	 * @memberOf module:twgl/v3
	 */
	function negate(v, dst) {
	  dst = dst || new VecType(3);

	  dst[0] = -v[0];
	  dst[1] = -v[1];
	  dst[2] = -v[2];

	  return dst;
	}

	/**
	 * Copies a vector.
	 * @param {module:twgl/v3.Vec3} v The vector.
	 * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created.
	 * @return {module:twgl/v3.Vec3} A copy of v.
	 * @memberOf module:twgl/v3
	 */
	function copy(v, dst) {
	  dst = dst || new VecType(3);

	  dst[0] = v[0];
	  dst[1] = v[1];
	  dst[2] = v[2];

	  return dst;
	}

	/**
	 * Multiplies a vector by another vector (component-wise); assumes a and
	 * b have the same length.
	 * @param {module:twgl/v3.Vec3} a Operand vector.
	 * @param {module:twgl/v3.Vec3} b Operand vector.
	 * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created.
	 * @return {module:twgl/v3.Vec3} The vector of products of entries of a and
	 *     b.
	 * @memberOf module:twgl/v3
	 */
	function multiply(a, b, dst) {
	  dst = dst || new VecType(3);

	  dst[0] = a[0] * b[0];
	  dst[1] = a[1] * b[1];
	  dst[2] = a[2] * b[2];

	  return dst;
	}

	/**
	 * Divides a vector by another vector (component-wise); assumes a and
	 * b have the same length.
	 * @param {module:twgl/v3.Vec3} a Operand vector.
	 * @param {module:twgl/v3.Vec3} b Operand vector.
	 * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created.
	 * @return {module:twgl/v3.Vec3} The vector of quotients of entries of a and
	 *     b.
	 * @memberOf module:twgl/v3
	 */
	function divide(a, b, dst) {
	  dst = dst || new VecType(3);

	  dst[0] = a[0] / b[0];
	  dst[1] = a[1] / b[1];
	  dst[2] = a[2] / b[2];

	  return dst;
	}

	var v3 = /*#__PURE__*/Object.freeze({
	  __proto__: null,
	  add: add,
	  copy: copy,
	  create: create,
	  cross: cross,
	  distance: distance,
	  distanceSq: distanceSq,
	  divide: divide,
	  divScalar: divScalar,
	  dot: dot,
	  lerp: lerp,
	  lerpV: lerpV,
	  length: length$1,
	  lengthSq: lengthSq,
	  max: max,
	  min: min,
	  mulScalar: mulScalar,
	  multiply: multiply,
	  negate: negate,
	  normalize: normalize,
	  setDefaultType: setDefaultType,
	  subtract: subtract
	});

	/*
	 * Copyright 2019 Gregg Tavares
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining a
	 * copy of this software and associated documentation files (the "Software"),
	 * to deal in the Software without restriction, including without limitation
	 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
	 * and/or sell copies of the Software, and to permit persons to whom the
	 * Software is furnished to do so, subject to the following conditions:
	 *
	 * The above copyright notice and this permission notice shall be included in
	 * all copies or substantial portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL
	 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
	 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
	 * DEALINGS IN THE SOFTWARE.
	 */

	/**
	 * 4x4 Matrix math math functions.
	 *
	 * Almost all functions take an optional `dst` argument. If it is not passed in the
	 * functions will create a new matrix. In other words you can do this
	 *
	 *     const mat = m4.translation([1, 2, 3]);  // Creates a new translation matrix
	 *
	 * or
	 *
	 *     const mat = m4.create();
	 *     m4.translation([1, 2, 3], mat);  // Puts translation matrix in mat.
	 *
	 * The first style is often easier but depending on where it's used it generates garbage where
	 * as there is almost never allocation with the second style.
	 *
	 * It is always save to pass any matrix as the destination. So for example
	 *
	 *     const mat = m4.identity();
	 *     const trans = m4.translation([1, 2, 3]);
	 *     m4.multiply(mat, trans, mat);  // Multiplies mat * trans and puts result in mat.
	 *
	 * @module twgl/m4
	 */
	let MatType = Float32Array;

	/**
	 * A JavaScript array with 16 values or a Float32Array with 16 values.
	 * When created by the library will create the default type which is `Float32Array`
	 * but can be set by calling {@link module:twgl/m4.setDefaultType}.
	 * @typedef {(number[]|Float32Array)} Mat4
	 * @memberOf module:twgl/m4
	 */

	/**
	 * Sets the type this library creates for a Mat4
	 * @param {constructor} ctor the constructor for the type. Either `Float32Array` or `Array`
	 * @return {constructor} previous constructor for Mat4
	 * @memberOf module:twgl/m4
	 */
	function setDefaultType$1(ctor) {
	  const oldType = MatType;
	  MatType = ctor;
	  return oldType;
	}

	/**
	 * Negates a matrix.
	 * @param {module:twgl/m4.Mat4} m The matrix.
	 * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
	 * @return {module:twgl/m4.Mat4} -m.
	 * @memberOf module:twgl/m4
	 */
	function negate$1(m, dst) {
	  dst = dst || new MatType(16);

	  dst[ 0] = -m[ 0];
	  dst[ 1] = -m[ 1];
	  dst[ 2] = -m[ 2];
	  dst[ 3] = -m[ 3];
	  dst[ 4] = -m[ 4];
	  dst[ 5] = -m[ 5];
	  dst[ 6] = -m[ 6];
	  dst[ 7] = -m[ 7];
	  dst[ 8] = -m[ 8];
	  dst[ 9] = -m[ 9];
	  dst[10] = -m[10];
	  dst[11] = -m[11];
	  dst[12] = -m[12];
	  dst[13] = -m[13];
	  dst[14] = -m[14];
	  dst[15] = -m[15];

	  return dst;
	}

	/**
	 * Copies a matrix.
	 * @param {module:twgl/m4.Mat4} m The matrix.
	 * @param {module:twgl/m4.Mat4} [dst] The matrix. If not passed a new one is created.
	 * @return {module:twgl/m4.Mat4} A copy of m.
	 * @memberOf module:twgl/m4
	 */
	function copy$1(m, dst) {
	  dst = dst || new MatType(16);

	  dst[ 0] = m[ 0];
	  dst[ 1] = m[ 1];
	  dst[ 2] = m[ 2];
	  dst[ 3] = m[ 3];
	  dst[ 4] = m[ 4];
	  dst[ 5] = m[ 5];
	  dst[ 6] = m[ 6];
	  dst[ 7] = m[ 7];
	  dst[ 8] = m[ 8];
	  dst[ 9] = m[ 9];
	  dst[10] = m[10];
	  dst[11] = m[11];
	  dst[12] = m[12];
	  dst[13] = m[13];
	  dst[14] = m[14];
	  dst[15] = m[15];

	  return dst;
	}

	/**
	 * Creates an n-by-n identity matrix.
	 *
	 * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
	 * @return {module:twgl/m4.Mat4} An n-by-n identity matrix.
	 * @memberOf module:twgl/m4
	 */
	function identity(dst) {
	  dst = dst || new MatType(16);

	  dst[ 0] = 1;
	  dst[ 1] = 0;
	  dst[ 2] = 0;
	  dst[ 3] = 0;
	  dst[ 4] = 0;
	  dst[ 5] = 1;
	  dst[ 6] = 0;
	  dst[ 7] = 0;
	  dst[ 8] = 0;
	  dst[ 9] = 0;
	  dst[10] = 1;
	  dst[11] = 0;
	  dst[12] = 0;
	  dst[13] = 0;
	  dst[14] = 0;
	  dst[15] = 1;

	  return dst;
	}

	/**
	 * Takes the transpose of a matrix.
	 * @param {module:twgl/m4.Mat4} m The matrix.
	 * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
	 * @return {module:twgl/m4.Mat4} The transpose of m.
	 * @memberOf module:twgl/m4
	 */
	 function transpose(m, dst) {
	  dst = dst || new MatType(16);
	  if (dst === m) {
	    let t;

	    t = m[1];
	    m[1] = m[4];
	    m[4] = t;

	    t = m[2];
	    m[2] = m[8];
	    m[8] = t;

	    t = m[3];
	    m[3] = m[12];
	    m[12] = t;

	    t = m[6];
	    m[6] = m[9];
	    m[9] = t;

	    t = m[7];
	    m[7] = m[13];
	    m[13] = t;

	    t = m[11];
	    m[11] = m[14];
	    m[14] = t;
	    return dst;
	  }

	  const m00 = m[0 * 4 + 0];
	  const m01 = m[0 * 4 + 1];
	  const m02 = m[0 * 4 + 2];
	  const m03 = m[0 * 4 + 3];
	  const m10 = m[1 * 4 + 0];
	  const m11 = m[1 * 4 + 1];
	  const m12 = m[1 * 4 + 2];
	  const m13 = m[1 * 4 + 3];
	  const m20 = m[2 * 4 + 0];
	  const m21 = m[2 * 4 + 1];
	  const m22 = m[2 * 4 + 2];
	  const m23 = m[2 * 4 + 3];
	  const m30 = m[3 * 4 + 0];
	  const m31 = m[3 * 4 + 1];
	  const m32 = m[3 * 4 + 2];
	  const m33 = m[3 * 4 + 3];

	  dst[ 0] = m00;
	  dst[ 1] = m10;
	  dst[ 2] = m20;
	  dst[ 3] = m30;
	  dst[ 4] = m01;
	  dst[ 5] = m11;
	  dst[ 6] = m21;
	  dst[ 7] = m31;
	  dst[ 8] = m02;
	  dst[ 9] = m12;
	  dst[10] = m22;
	  dst[11] = m32;
	  dst[12] = m03;
	  dst[13] = m13;
	  dst[14] = m23;
	  dst[15] = m33;

	  return dst;
	}

	/**
	 * Computes the inverse of a 4-by-4 matrix.
	 * @param {module:twgl/m4.Mat4} m The matrix.
	 * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
	 * @return {module:twgl/m4.Mat4} The inverse of m.
	 * @memberOf module:twgl/m4
	 */
	function inverse(m, dst) {
	  dst = dst || new MatType(16);

	  const m00 = m[0 * 4 + 0];
	  const m01 = m[0 * 4 + 1];
	  const m02 = m[0 * 4 + 2];
	  const m03 = m[0 * 4 + 3];
	  const m10 = m[1 * 4 + 0];
	  const m11 = m[1 * 4 + 1];
	  const m12 = m[1 * 4 + 2];
	  const m13 = m[1 * 4 + 3];
	  const m20 = m[2 * 4 + 0];
	  const m21 = m[2 * 4 + 1];
	  const m22 = m[2 * 4 + 2];
	  const m23 = m[2 * 4 + 3];
	  const m30 = m[3 * 4 + 0];
	  const m31 = m[3 * 4 + 1];
	  const m32 = m[3 * 4 + 2];
	  const m33 = m[3 * 4 + 3];
	  const tmp_0  = m22 * m33;
	  const tmp_1  = m32 * m23;
	  const tmp_2  = m12 * m33;
	  const tmp_3  = m32 * m13;
	  const tmp_4  = m12 * m23;
	  const tmp_5  = m22 * m13;
	  const tmp_6  = m02 * m33;
	  const tmp_7  = m32 * m03;
	  const tmp_8  = m02 * m23;
	  const tmp_9  = m22 * m03;
	  const tmp_10 = m02 * m13;
	  const tmp_11 = m12 * m03;
	  const tmp_12 = m20 * m31;
	  const tmp_13 = m30 * m21;
	  const tmp_14 = m10 * m31;
	  const tmp_15 = m30 * m11;
	  const tmp_16 = m10 * m21;
	  const tmp_17 = m20 * m11;
	  const tmp_18 = m00 * m31;
	  const tmp_19 = m30 * m01;
	  const tmp_20 = m00 * m21;
	  const tmp_21 = m20 * m01;
	  const tmp_22 = m00 * m11;
	  const tmp_23 = m10 * m01;

	  const t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
	      (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
	  const t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
	      (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
	  const t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
	      (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
	  const t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
	      (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

	  const d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

	  dst[ 0] = d * t0;
	  dst[ 1] = d * t1;
	  dst[ 2] = d * t2;
	  dst[ 3] = d * t3;
	  dst[ 4] = d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) -
	          (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30));
	  dst[ 5] = d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) -
	          (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30));
	  dst[ 6] = d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) -
	          (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30));
	  dst[ 7] = d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) -
	          (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20));
	  dst[ 8] = d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) -
	          (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33));
	  dst[ 9] = d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) -
	          (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33));
	  dst[10] = d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) -
	          (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33));
	  dst[11] = d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) -
	          (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23));
	  dst[12] = d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) -
	          (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22));
	  dst[13] = d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) -
	          (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02));
	  dst[14] = d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) -
	          (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12));
	  dst[15] = d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) -
	          (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02));

	  return dst;
	}

	/**
	 * Multiplies two 4-by-4 matrices with a on the left and b on the right
	 * @param {module:twgl/m4.Mat4} a The matrix on the left.
	 * @param {module:twgl/m4.Mat4} b The matrix on the right.
	 * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
	 * @return {module:twgl/m4.Mat4} The matrix product of a and b.
	 * @memberOf module:twgl/m4
	 */
	function multiply$1(a, b, dst) {
	  dst = dst || new MatType(16);

	  const a00 = a[0];
	  const a01 = a[1];
	  const a02 = a[2];
	  const a03 = a[3];
	  const a10 = a[ 4 + 0];
	  const a11 = a[ 4 + 1];
	  const a12 = a[ 4 + 2];
	  const a13 = a[ 4 + 3];
	  const a20 = a[ 8 + 0];
	  const a21 = a[ 8 + 1];
	  const a22 = a[ 8 + 2];
	  const a23 = a[ 8 + 3];
	  const a30 = a[12 + 0];
	  const a31 = a[12 + 1];
	  const a32 = a[12 + 2];
	  const a33 = a[12 + 3];
	  const b00 = b[0];
	  const b01 = b[1];
	  const b02 = b[2];
	  const b03 = b[3];
	  const b10 = b[ 4 + 0];
	  const b11 = b[ 4 + 1];
	  const b12 = b[ 4 + 2];
	  const b13 = b[ 4 + 3];
	  const b20 = b[ 8 + 0];
	  const b21 = b[ 8 + 1];
	  const b22 = b[ 8 + 2];
	  const b23 = b[ 8 + 3];
	  const b30 = b[12 + 0];
	  const b31 = b[12 + 1];
	  const b32 = b[12 + 2];
	  const b33 = b[12 + 3];

	  dst[ 0] = a00 * b00 + a10 * b01 + a20 * b02 + a30 * b03;
	  dst[ 1] = a01 * b00 + a11 * b01 + a21 * b02 + a31 * b03;
	  dst[ 2] = a02 * b00 + a12 * b01 + a22 * b02 + a32 * b03;
	  dst[ 3] = a03 * b00 + a13 * b01 + a23 * b02 + a33 * b03;
	  dst[ 4] = a00 * b10 + a10 * b11 + a20 * b12 + a30 * b13;
	  dst[ 5] = a01 * b10 + a11 * b11 + a21 * b12 + a31 * b13;
	  dst[ 6] = a02 * b10 + a12 * b11 + a22 * b12 + a32 * b13;
	  dst[ 7] = a03 * b10 + a13 * b11 + a23 * b12 + a33 * b13;
	  dst[ 8] = a00 * b20 + a10 * b21 + a20 * b22 + a30 * b23;
	  dst[ 9] = a01 * b20 + a11 * b21 + a21 * b22 + a31 * b23;
	  dst[10] = a02 * b20 + a12 * b21 + a22 * b22 + a32 * b23;
	  dst[11] = a03 * b20 + a13 * b21 + a23 * b22 + a33 * b23;
	  dst[12] = a00 * b30 + a10 * b31 + a20 * b32 + a30 * b33;
	  dst[13] = a01 * b30 + a11 * b31 + a21 * b32 + a31 * b33;
	  dst[14] = a02 * b30 + a12 * b31 + a22 * b32 + a32 * b33;
	  dst[15] = a03 * b30 + a13 * b31 + a23 * b32 + a33 * b33;

	  return dst;
	}

	/**
	 * Sets the translation component of a 4-by-4 matrix to the given
	 * vector.
	 * @param {module:twgl/m4.Mat4} a The matrix.
	 * @param {module:twgl/v3.Vec3} v The vector.
	 * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
	 * @return {module:twgl/m4.Mat4} The matrix with translation set.
	 * @memberOf module:twgl/m4
	 */
	function setTranslation(a, v, dst) {
	  dst = dst || identity();
	  if (a !== dst) {
	    dst[ 0] = a[ 0];
	    dst[ 1] = a[ 1];
	    dst[ 2] = a[ 2];
	    dst[ 3] = a[ 3];
	    dst[ 4] = a[ 4];
	    dst[ 5] = a[ 5];
	    dst[ 6] = a[ 6];
	    dst[ 7] = a[ 7];
	    dst[ 8] = a[ 8];
	    dst[ 9] = a[ 9];
	    dst[10] = a[10];
	    dst[11] = a[11];
	  }
	  dst[12] = v[0];
	  dst[13] = v[1];
	  dst[14] = v[2];
	  dst[15] = 1;
	  return dst;
	}

	/**
	 * Returns the translation component of a 4-by-4 matrix as a vector with 3
	 * entries.
	 * @param {module:twgl/m4.Mat4} m The matrix.
	 * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not passed a new one is created.
	 * @return {module:twgl/v3.Vec3} The translation component of m.
	 * @memberOf module:twgl/m4
	 */
	function getTranslation(m, dst) {
	  dst = dst || create();
	  dst[0] = m[12];
	  dst[1] = m[13];
	  dst[2] = m[14];
	  return dst;
	}

	/**
	 * Returns an axis of a 4x4 matrix as a vector with 3 entries
	 * @param {module:twgl/m4.Mat4} m The matrix.
	 * @param {number} axis The axis 0 = x, 1 = y, 2 = z;
	 * @return {module:twgl/v3.Vec3} [dst] vector.
	 * @return {module:twgl/v3.Vec3} The axis component of m.
	 * @memberOf module:twgl/m4
	 */
	function getAxis(m, axis, dst) {
	  dst = dst || create();
	  const off = axis * 4;
	  dst[0] = m[off + 0];
	  dst[1] = m[off + 1];
	  dst[2] = m[off + 2];
	  return dst;
	}

	/**
	 * Sets an axis of a 4x4 matrix as a vector with 3 entries
	 * @param {module:twgl/m4.Mat4} m The matrix.
	 * @param {module:twgl/v3.Vec3} v the axis vector
	 * @param {number} axis The axis  0 = x, 1 = y, 2 = z;
	 * @param {module:twgl/m4.Mat4} [dst] The matrix to set. If not passed a new one is created.
	 * @return {module:twgl/m4.Mat4} The matrix with axis set.
	 * @memberOf module:twgl/m4
	 */
	function setAxis(a, v, axis, dst) {
	  if (dst !== a) {
	    dst = copy$1(a, dst);
	  }
	  const off = axis * 4;
	  dst[off + 0] = v[0];
	  dst[off + 1] = v[1];
	  dst[off + 2] = v[2];
	  return dst;
	}

	/**
	 * Computes a 4-by-4 perspective transformation matrix given the angular height
	 * of the frustum, the aspect ratio, and the near and far clipping planes.  The
	 * arguments define a frustum extending in the negative z direction.  The given
	 * angle is the vertical angle of the frustum, and the horizontal angle is
	 * determined to produce the given aspect ratio.  The arguments near and far are
	 * the distances to the near and far clipping planes.  Note that near and far
	 * are not z coordinates, but rather they are distances along the negative
	 * z-axis.  The matrix generated sends the viewing frustum to the unit box.
	 * We assume a unit box extending from -1 to 1 in the x and y dimensions and
	 * from 0 to 1 in the z dimension.
	 * @param {number} fieldOfViewYInRadians The camera angle from top to bottom (in radians).
	 * @param {number} aspect The aspect ratio width / height.
	 * @param {number} zNear The depth (negative z coordinate)
	 *     of the near clipping plane.
	 * @param {number} zFar The depth (negative z coordinate)
	 *     of the far clipping plane.
	 * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
	 * @return {module:twgl/m4.Mat4} The perspective matrix.
	 * @memberOf module:twgl/m4
	 */
	function perspective(fieldOfViewYInRadians, aspect, zNear, zFar, dst) {
	  dst = dst || new MatType(16);

	  const f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewYInRadians);
	  const rangeInv = 1.0 / (zNear - zFar);

	  dst[0]  = f / aspect;
	  dst[1]  = 0;
	  dst[2]  = 0;
	  dst[3]  = 0;

	  dst[4]  = 0;
	  dst[5]  = f;
	  dst[6]  = 0;
	  dst[7]  = 0;

	  dst[8]  = 0;
	  dst[9]  = 0;
	  dst[10] = (zNear + zFar) * rangeInv;
	  dst[11] = -1;

	  dst[12] = 0;
	  dst[13] = 0;
	  dst[14] = zNear * zFar * rangeInv * 2;
	  dst[15] = 0;

	  return dst;
	}

	/**
	 * Computes a 4-by-4 orthogonal transformation matrix given the left, right,
	 * bottom, and top dimensions of the near clipping plane as well as the
	 * near and far clipping plane distances.
	 * @param {number} left Left side of the near clipping plane viewport.
	 * @param {number} right Right side of the near clipping plane viewport.
	 * @param {number} bottom Bottom of the near clipping plane viewport.
	 * @param {number} top Top of the near clipping plane viewport.
	 * @param {number} near The depth (negative z coordinate)
	 *     of the near clipping plane.
	 * @param {number} far The depth (negative z coordinate)
	 *     of the far clipping plane.
	 * @param {module:twgl/m4.Mat4} [dst] Output matrix. If not passed a new one is created.
	 * @return {module:twgl/m4.Mat4} The perspective matrix.
	 * @memberOf module:twgl/m4
	 */
	function ortho(left, right, bottom, top, near, far, dst) {
	  dst = dst || new MatType(16);

	  dst[0]  = 2 / (right - left);
	  dst[1]  = 0;
	  dst[2]  = 0;
	  dst[3]  = 0;

	  dst[4]  = 0;
	  dst[5]  = 2 / (top - bottom);
	  dst[6]  = 0;
	  dst[7]  = 0;

	  dst[8]  = 0;
	  dst[9]  = 0;
	  dst[10] = 2 / (near - far);
	  dst[11] = 0;

	  dst[12] = (right + left) / (left - right);
	  dst[13] = (top + bottom) / (bottom - top);
	  dst[14] = (far + near) / (near - far);
	  dst[15] = 1;

	  return dst;
	}

	/**
	 * Computes a 4-by-4 perspective transformation matrix given the left, right,
	 * top, bottom, near and far clipping planes. The arguments define a frustum
	 * extending in the negative z direction. The arguments near and far are the
	 * distances to the near and far clipping planes. Note that near and far are not
	 * z coordinates, but rather they are distances along the negative z-axis. The
	 * matrix generated sends the viewing frustum to the unit box. We assume a unit
	 * box extending from -1 to 1 in the x and y dimensions and from 0 to 1 in the z
	 * dimension.
	 * @param {number} left The x coordinate of the left plane of the box.
	 * @param {number} right The x coordinate of the right plane of the box.
	 * @param {number} bottom The y coordinate of the bottom plane of the box.
	 * @param {number} top The y coordinate of the right plane of the box.
	 * @param {number} near The negative z coordinate of the near plane of the box.
	 * @param {number} far The negative z coordinate of the far plane of the box.
	 * @param {module:twgl/m4.Mat4} [dst] Output matrix. If not passed a new one is created.
	 * @return {module:twgl/m4.Mat4} The perspective projection matrix.
	 * @memberOf module:twgl/m4
	 */
	function frustum(left, right, bottom, top, near, far, dst) {
	  dst = dst || new MatType(16);

	  const dx = (right - left);
	  const dy = (top - bottom);
	  const dz = (near - far);

	  dst[ 0] = 2 * near / dx;
	  dst[ 1] = 0;
	  dst[ 2] = 0;
	  dst[ 3] = 0;
	  dst[ 4] = 0;
	  dst[ 5] = 2 * near / dy;
	  dst[ 6] = 0;
	  dst[ 7] = 0;
	  dst[ 8] = (left + right) / dx;
	  dst[ 9] = (top + bottom) / dy;
	  dst[10] = far / dz;
	  dst[11] = -1;
	  dst[12] = 0;
	  dst[13] = 0;
	  dst[14] = near * far / dz;
	  dst[15] = 0;

	  return dst;
	}

	let xAxis;
	let yAxis;
	let zAxis;

	/**
	 * Computes a 4-by-4 look-at transformation.
	 *
	 * This is a matrix which positions the camera itself. If you want
	 * a view matrix (a matrix which moves things in front of the camera)
	 * take the inverse of this.
	 *
	 * @param {module:twgl/v3.Vec3} eye The position of the eye.
	 * @param {module:twgl/v3.Vec3} target The position meant to be viewed.
	 * @param {module:twgl/v3.Vec3} up A vector pointing up.
	 * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
	 * @return {module:twgl/m4.Mat4} The look-at matrix.
	 * @memberOf module:twgl/m4
	 */
	function lookAt(eye, target, up, dst) {
	  dst = dst || new MatType(16);

	  xAxis = xAxis || create();
	  yAxis = yAxis || create();
	  zAxis = zAxis || create();

	  normalize(
	      subtract(eye, target, zAxis), zAxis);
	  normalize(cross(up, zAxis, xAxis), xAxis);
	  normalize(cross(zAxis, xAxis, yAxis), yAxis);

	  dst[ 0] = xAxis[0];
	  dst[ 1] = xAxis[1];
	  dst[ 2] = xAxis[2];
	  dst[ 3] = 0;
	  dst[ 4] = yAxis[0];
	  dst[ 5] = yAxis[1];
	  dst[ 6] = yAxis[2];
	  dst[ 7] = 0;
	  dst[ 8] = zAxis[0];
	  dst[ 9] = zAxis[1];
	  dst[10] = zAxis[2];
	  dst[11] = 0;
	  dst[12] = eye[0];
	  dst[13] = eye[1];
	  dst[14] = eye[2];
	  dst[15] = 1;

	  return dst;
	}

	/**
	 * Creates a 4-by-4 matrix which translates by the given vector v.
	 * @param {module:twgl/v3.Vec3} v The vector by
	 *     which to translate.
	 * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
	 * @return {module:twgl/m4.Mat4} The translation matrix.
	 * @memberOf module:twgl/m4
	 */
	function translation(v, dst) {
	  dst = dst || new MatType(16);

	  dst[ 0] = 1;
	  dst[ 1] = 0;
	  dst[ 2] = 0;
	  dst[ 3] = 0;
	  dst[ 4] = 0;
	  dst[ 5] = 1;
	  dst[ 6] = 0;
	  dst[ 7] = 0;
	  dst[ 8] = 0;
	  dst[ 9] = 0;
	  dst[10] = 1;
	  dst[11] = 0;
	  dst[12] = v[0];
	  dst[13] = v[1];
	  dst[14] = v[2];
	  dst[15] = 1;
	  return dst;
	}

	/**
	 * Translates the given 4-by-4 matrix by the given vector v.
	 * @param {module:twgl/m4.Mat4} m The matrix.
	 * @param {module:twgl/v3.Vec3} v The vector by
	 *     which to translate.
	 * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
	 * @return {module:twgl/m4.Mat4} The translated matrix.
	 * @memberOf module:twgl/m4
	 */
	function translate(m, v, dst) {
	  dst = dst || new MatType(16);

	  const v0 = v[0];
	  const v1 = v[1];
	  const v2 = v[2];
	  const m00 = m[0];
	  const m01 = m[1];
	  const m02 = m[2];
	  const m03 = m[3];
	  const m10 = m[1 * 4 + 0];
	  const m11 = m[1 * 4 + 1];
	  const m12 = m[1 * 4 + 2];
	  const m13 = m[1 * 4 + 3];
	  const m20 = m[2 * 4 + 0];
	  const m21 = m[2 * 4 + 1];
	  const m22 = m[2 * 4 + 2];
	  const m23 = m[2 * 4 + 3];
	  const m30 = m[3 * 4 + 0];
	  const m31 = m[3 * 4 + 1];
	  const m32 = m[3 * 4 + 2];
	  const m33 = m[3 * 4 + 3];

	  if (m !== dst) {
	    dst[ 0] = m00;
	    dst[ 1] = m01;
	    dst[ 2] = m02;
	    dst[ 3] = m03;
	    dst[ 4] = m10;
	    dst[ 5] = m11;
	    dst[ 6] = m12;
	    dst[ 7] = m13;
	    dst[ 8] = m20;
	    dst[ 9] = m21;
	    dst[10] = m22;
	    dst[11] = m23;
	  }

	  dst[12] = m00 * v0 + m10 * v1 + m20 * v2 + m30;
	  dst[13] = m01 * v0 + m11 * v1 + m21 * v2 + m31;
	  dst[14] = m02 * v0 + m12 * v1 + m22 * v2 + m32;
	  dst[15] = m03 * v0 + m13 * v1 + m23 * v2 + m33;

	  return dst;
	}

	/**
	 * Creates a 4-by-4 matrix which rotates around the x-axis by the given angle.
	 * @param {number} angleInRadians The angle by which to rotate (in radians).
	 * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
	 * @return {module:twgl/m4.Mat4} The rotation matrix.
	 * @memberOf module:twgl/m4
	 */
	function rotationX(angleInRadians, dst) {
	  dst = dst || new MatType(16);

	  const c = Math.cos(angleInRadians);
	  const s = Math.sin(angleInRadians);

	  dst[ 0] = 1;
	  dst[ 1] = 0;
	  dst[ 2] = 0;
	  dst[ 3] = 0;
	  dst[ 4] = 0;
	  dst[ 5] = c;
	  dst[ 6] = s;
	  dst[ 7] = 0;
	  dst[ 8] = 0;
	  dst[ 9] = -s;
	  dst[10] = c;
	  dst[11] = 0;
	  dst[12] = 0;
	  dst[13] = 0;
	  dst[14] = 0;
	  dst[15] = 1;

	  return dst;
	}

	/**
	 * Rotates the given 4-by-4 matrix around the x-axis by the given
	 * angle.
	 * @param {module:twgl/m4.Mat4} m The matrix.
	 * @param {number} angleInRadians The angle by which to rotate (in radians).
	 * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
	 * @return {module:twgl/m4.Mat4} The rotated matrix.
	 * @memberOf module:twgl/m4
	 */
	function rotateX(m, angleInRadians, dst) {
	  dst = dst || new MatType(16);

	  const m10 = m[4];
	  const m11 = m[5];
	  const m12 = m[6];
	  const m13 = m[7];
	  const m20 = m[8];
	  const m21 = m[9];
	  const m22 = m[10];
	  const m23 = m[11];
	  const c = Math.cos(angleInRadians);
	  const s = Math.sin(angleInRadians);

	  dst[4]  = c * m10 + s * m20;
	  dst[5]  = c * m11 + s * m21;
	  dst[6]  = c * m12 + s * m22;
	  dst[7]  = c * m13 + s * m23;
	  dst[8]  = c * m20 - s * m10;
	  dst[9]  = c * m21 - s * m11;
	  dst[10] = c * m22 - s * m12;
	  dst[11] = c * m23 - s * m13;

	  if (m !== dst) {
	    dst[ 0] = m[ 0];
	    dst[ 1] = m[ 1];
	    dst[ 2] = m[ 2];
	    dst[ 3] = m[ 3];
	    dst[12] = m[12];
	    dst[13] = m[13];
	    dst[14] = m[14];
	    dst[15] = m[15];
	  }

	  return dst;
	}

	/**
	 * Creates a 4-by-4 matrix which rotates around the y-axis by the given angle.
	 * @param {number} angleInRadians The angle by which to rotate (in radians).
	 * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
	 * @return {module:twgl/m4.Mat4} The rotation matrix.
	 * @memberOf module:twgl/m4
	 */
	function rotationY(angleInRadians, dst) {
	  dst = dst || new MatType(16);

	  const c = Math.cos(angleInRadians);
	  const s = Math.sin(angleInRadians);

	  dst[ 0] = c;
	  dst[ 1] = 0;
	  dst[ 2] = -s;
	  dst[ 3] = 0;
	  dst[ 4] = 0;
	  dst[ 5] = 1;
	  dst[ 6] = 0;
	  dst[ 7] = 0;
	  dst[ 8] = s;
	  dst[ 9] = 0;
	  dst[10] = c;
	  dst[11] = 0;
	  dst[12] = 0;
	  dst[13] = 0;
	  dst[14] = 0;
	  dst[15] = 1;

	  return dst;
	}

	/**
	 * Rotates the given 4-by-4 matrix around the y-axis by the given
	 * angle.
	 * @param {module:twgl/m4.Mat4} m The matrix.
	 * @param {number} angleInRadians The angle by which to rotate (in radians).
	 * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
	 * @return {module:twgl/m4.Mat4} The rotated matrix.
	 * @memberOf module:twgl/m4
	 */
	function rotateY(m, angleInRadians, dst) {
	  dst = dst || new MatType(16);

	  const m00 = m[0 * 4 + 0];
	  const m01 = m[0 * 4 + 1];
	  const m02 = m[0 * 4 + 2];
	  const m03 = m[0 * 4 + 3];
	  const m20 = m[2 * 4 + 0];
	  const m21 = m[2 * 4 + 1];
	  const m22 = m[2 * 4 + 2];
	  const m23 = m[2 * 4 + 3];
	  const c = Math.cos(angleInRadians);
	  const s = Math.sin(angleInRadians);

	  dst[ 0] = c * m00 - s * m20;
	  dst[ 1] = c * m01 - s * m21;
	  dst[ 2] = c * m02 - s * m22;
	  dst[ 3] = c * m03 - s * m23;
	  dst[ 8] = c * m20 + s * m00;
	  dst[ 9] = c * m21 + s * m01;
	  dst[10] = c * m22 + s * m02;
	  dst[11] = c * m23 + s * m03;

	  if (m !== dst) {
	    dst[ 4] = m[ 4];
	    dst[ 5] = m[ 5];
	    dst[ 6] = m[ 6];
	    dst[ 7] = m[ 7];
	    dst[12] = m[12];
	    dst[13] = m[13];
	    dst[14] = m[14];
	    dst[15] = m[15];
	  }

	  return dst;
	}

	/**
	 * Creates a 4-by-4 matrix which rotates around the z-axis by the given angle.
	 * @param {number} angleInRadians The angle by which to rotate (in radians).
	 * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
	 * @return {module:twgl/m4.Mat4} The rotation matrix.
	 * @memberOf module:twgl/m4
	 */
	function rotationZ(angleInRadians, dst) {
	  dst = dst || new MatType(16);

	  const c = Math.cos(angleInRadians);
	  const s = Math.sin(angleInRadians);

	  dst[ 0] = c;
	  dst[ 1] = s;
	  dst[ 2] = 0;
	  dst[ 3] = 0;
	  dst[ 4] = -s;
	  dst[ 5] = c;
	  dst[ 6] = 0;
	  dst[ 7] = 0;
	  dst[ 8] = 0;
	  dst[ 9] = 0;
	  dst[10] = 1;
	  dst[11] = 0;
	  dst[12] = 0;
	  dst[13] = 0;
	  dst[14] = 0;
	  dst[15] = 1;

	  return dst;
	}

	/**
	 * Rotates the given 4-by-4 matrix around the z-axis by the given
	 * angle.
	 * @param {module:twgl/m4.Mat4} m The matrix.
	 * @param {number} angleInRadians The angle by which to rotate (in radians).
	 * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
	 * @return {module:twgl/m4.Mat4} The rotated matrix.
	 * @memberOf module:twgl/m4
	 */
	function rotateZ(m, angleInRadians, dst) {
	  dst = dst || new MatType(16);

	  const m00 = m[0 * 4 + 0];
	  const m01 = m[0 * 4 + 1];
	  const m02 = m[0 * 4 + 2];
	  const m03 = m[0 * 4 + 3];
	  const m10 = m[1 * 4 + 0];
	  const m11 = m[1 * 4 + 1];
	  const m12 = m[1 * 4 + 2];
	  const m13 = m[1 * 4 + 3];
	  const c = Math.cos(angleInRadians);
	  const s = Math.sin(angleInRadians);

	  dst[ 0] = c * m00 + s * m10;
	  dst[ 1] = c * m01 + s * m11;
	  dst[ 2] = c * m02 + s * m12;
	  dst[ 3] = c * m03 + s * m13;
	  dst[ 4] = c * m10 - s * m00;
	  dst[ 5] = c * m11 - s * m01;
	  dst[ 6] = c * m12 - s * m02;
	  dst[ 7] = c * m13 - s * m03;

	  if (m !== dst) {
	    dst[ 8] = m[ 8];
	    dst[ 9] = m[ 9];
	    dst[10] = m[10];
	    dst[11] = m[11];
	    dst[12] = m[12];
	    dst[13] = m[13];
	    dst[14] = m[14];
	    dst[15] = m[15];
	  }

	  return dst;
	}

	/**
	 * Creates a 4-by-4 matrix which rotates around the given axis by the given
	 * angle.
	 * @param {module:twgl/v3.Vec3} axis The axis
	 *     about which to rotate.
	 * @param {number} angleInRadians The angle by which to rotate (in radians).
	 * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
	 * @return {module:twgl/m4.Mat4} A matrix which rotates angle radians
	 *     around the axis.
	 * @memberOf module:twgl/m4
	 */
	function axisRotation(axis, angleInRadians, dst) {
	  dst = dst || new MatType(16);

	  let x = axis[0];
	  let y = axis[1];
	  let z = axis[2];
	  const n = Math.sqrt(x * x + y * y + z * z);
	  x /= n;
	  y /= n;
	  z /= n;
	  const xx = x * x;
	  const yy = y * y;
	  const zz = z * z;
	  const c = Math.cos(angleInRadians);
	  const s = Math.sin(angleInRadians);
	  const oneMinusCosine = 1 - c;

	  dst[ 0] = xx + (1 - xx) * c;
	  dst[ 1] = x * y * oneMinusCosine + z * s;
	  dst[ 2] = x * z * oneMinusCosine - y * s;
	  dst[ 3] = 0;
	  dst[ 4] = x * y * oneMinusCosine - z * s;
	  dst[ 5] = yy + (1 - yy) * c;
	  dst[ 6] = y * z * oneMinusCosine + x * s;
	  dst[ 7] = 0;
	  dst[ 8] = x * z * oneMinusCosine + y * s;
	  dst[ 9] = y * z * oneMinusCosine - x * s;
	  dst[10] = zz + (1 - zz) * c;
	  dst[11] = 0;
	  dst[12] = 0;
	  dst[13] = 0;
	  dst[14] = 0;
	  dst[15] = 1;

	  return dst;
	}

	/**
	 * Rotates the given 4-by-4 matrix around the given axis by the
	 * given angle.
	 * @param {module:twgl/m4.Mat4} m The matrix.
	 * @param {module:twgl/v3.Vec3} axis The axis
	 *     about which to rotate.
	 * @param {number} angleInRadians The angle by which to rotate (in radians).
	 * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
	 * @return {module:twgl/m4.Mat4} The rotated matrix.
	 * @memberOf module:twgl/m4
	 */
	function axisRotate(m, axis, angleInRadians, dst) {
	  dst = dst || new MatType(16);

	  let x = axis[0];
	  let y = axis[1];
	  let z = axis[2];
	  const n = Math.sqrt(x * x + y * y + z * z);
	  x /= n;
	  y /= n;
	  z /= n;
	  const xx = x * x;
	  const yy = y * y;
	  const zz = z * z;
	  const c = Math.cos(angleInRadians);
	  const s = Math.sin(angleInRadians);
	  const oneMinusCosine = 1 - c;

	  const r00 = xx + (1 - xx) * c;
	  const r01 = x * y * oneMinusCosine + z * s;
	  const r02 = x * z * oneMinusCosine - y * s;
	  const r10 = x * y * oneMinusCosine - z * s;
	  const r11 = yy + (1 - yy) * c;
	  const r12 = y * z * oneMinusCosine + x * s;
	  const r20 = x * z * oneMinusCosine + y * s;
	  const r21 = y * z * oneMinusCosine - x * s;
	  const r22 = zz + (1 - zz) * c;

	  const m00 = m[0];
	  const m01 = m[1];
	  const m02 = m[2];
	  const m03 = m[3];
	  const m10 = m[4];
	  const m11 = m[5];
	  const m12 = m[6];
	  const m13 = m[7];
	  const m20 = m[8];
	  const m21 = m[9];
	  const m22 = m[10];
	  const m23 = m[11];

	  dst[ 0] = r00 * m00 + r01 * m10 + r02 * m20;
	  dst[ 1] = r00 * m01 + r01 * m11 + r02 * m21;
	  dst[ 2] = r00 * m02 + r01 * m12 + r02 * m22;
	  dst[ 3] = r00 * m03 + r01 * m13 + r02 * m23;
	  dst[ 4] = r10 * m00 + r11 * m10 + r12 * m20;
	  dst[ 5] = r10 * m01 + r11 * m11 + r12 * m21;
	  dst[ 6] = r10 * m02 + r11 * m12 + r12 * m22;
	  dst[ 7] = r10 * m03 + r11 * m13 + r12 * m23;
	  dst[ 8] = r20 * m00 + r21 * m10 + r22 * m20;
	  dst[ 9] = r20 * m01 + r21 * m11 + r22 * m21;
	  dst[10] = r20 * m02 + r21 * m12 + r22 * m22;
	  dst[11] = r20 * m03 + r21 * m13 + r22 * m23;

	  if (m !== dst) {
	    dst[12] = m[12];
	    dst[13] = m[13];
	    dst[14] = m[14];
	    dst[15] = m[15];
	  }

	  return dst;
	}

	/**
	 * Creates a 4-by-4 matrix which scales in each dimension by an amount given by
	 * the corresponding entry in the given vector; assumes the vector has three
	 * entries.
	 * @param {module:twgl/v3.Vec3} v A vector of
	 *     three entries specifying the factor by which to scale in each dimension.
	 * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
	 * @return {module:twgl/m4.Mat4} The scaling matrix.
	 * @memberOf module:twgl/m4
	 */
	function scaling(v, dst) {
	  dst = dst || new MatType(16);

	  dst[ 0] = v[0];
	  dst[ 1] = 0;
	  dst[ 2] = 0;
	  dst[ 3] = 0;
	  dst[ 4] = 0;
	  dst[ 5] = v[1];
	  dst[ 6] = 0;
	  dst[ 7] = 0;
	  dst[ 8] = 0;
	  dst[ 9] = 0;
	  dst[10] = v[2];
	  dst[11] = 0;
	  dst[12] = 0;
	  dst[13] = 0;
	  dst[14] = 0;
	  dst[15] = 1;

	  return dst;
	}

	/**
	 * Scales the given 4-by-4 matrix in each dimension by an amount
	 * given by the corresponding entry in the given vector; assumes the vector has
	 * three entries.
	 * @param {module:twgl/m4.Mat4} m The matrix to be modified.
	 * @param {module:twgl/v3.Vec3} v A vector of three entries specifying the
	 *     factor by which to scale in each dimension.
	 * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If not passed a new one is created.
	 * @return {module:twgl/m4.Mat4} The scaled matrix.
	 * @memberOf module:twgl/m4
	 */
	function scale(m, v, dst) {
	  dst = dst || new MatType(16);

	  const v0 = v[0];
	  const v1 = v[1];
	  const v2 = v[2];

	  dst[ 0] = v0 * m[0 * 4 + 0];
	  dst[ 1] = v0 * m[0 * 4 + 1];
	  dst[ 2] = v0 * m[0 * 4 + 2];
	  dst[ 3] = v0 * m[0 * 4 + 3];
	  dst[ 4] = v1 * m[1 * 4 + 0];
	  dst[ 5] = v1 * m[1 * 4 + 1];
	  dst[ 6] = v1 * m[1 * 4 + 2];
	  dst[ 7] = v1 * m[1 * 4 + 3];
	  dst[ 8] = v2 * m[2 * 4 + 0];
	  dst[ 9] = v2 * m[2 * 4 + 1];
	  dst[10] = v2 * m[2 * 4 + 2];
	  dst[11] = v2 * m[2 * 4 + 3];

	  if (m !== dst) {
	    dst[12] = m[12];
	    dst[13] = m[13];
	    dst[14] = m[14];
	    dst[15] = m[15];
	  }

	  return dst;
	}

	/**
	 * Takes a 4-by-4 matrix and a vector with 3 entries,
	 * interprets the vector as a point, transforms that point by the matrix, and
	 * returns the result as a vector with 3 entries.
	 * @param {module:twgl/m4.Mat4} m The matrix.
	 * @param {module:twgl/v3.Vec3} v The point.
	 * @param {module:twgl/v3.Vec3} [dst] optional vec3 to store result. If not passed a new one is created.
	 * @return {module:twgl/v3.Vec3} The transformed point.
	 * @memberOf module:twgl/m4
	 */
	function transformPoint(m, v, dst) {
	  dst = dst || create();
	  const v0 = v[0];
	  const v1 = v[1];
	  const v2 = v[2];
	  const d = v0 * m[0 * 4 + 3] + v1 * m[1 * 4 + 3] + v2 * m[2 * 4 + 3] + m[3 * 4 + 3];

	  dst[0] = (v0 * m[0 * 4 + 0] + v1 * m[1 * 4 + 0] + v2 * m[2 * 4 + 0] + m[3 * 4 + 0]) / d;
	  dst[1] = (v0 * m[0 * 4 + 1] + v1 * m[1 * 4 + 1] + v2 * m[2 * 4 + 1] + m[3 * 4 + 1]) / d;
	  dst[2] = (v0 * m[0 * 4 + 2] + v1 * m[1 * 4 + 2] + v2 * m[2 * 4 + 2] + m[3 * 4 + 2]) / d;

	  return dst;
	}

	/**
	 * Takes a 4-by-4 matrix and a vector with 3 entries, interprets the vector as a
	 * direction, transforms that direction by the matrix, and returns the result;
	 * assumes the transformation of 3-dimensional space represented by the matrix
	 * is parallel-preserving, i.e. any combination of rotation, scaling and
	 * translation, but not a perspective distortion. Returns a vector with 3
	 * entries.
	 * @param {module:twgl/m4.Mat4} m The matrix.
	 * @param {module:twgl/v3.Vec3} v The direction.
	 * @param {module:twgl/v3.Vec3} [dst] optional Vec3 to store result. If not passed a new one is created.
	 * @return {module:twgl/v3.Vec3} The transformed direction.
	 * @memberOf module:twgl/m4
	 */
	function transformDirection(m, v, dst) {
	  dst = dst || create();

	  const v0 = v[0];
	  const v1 = v[1];
	  const v2 = v[2];

	  dst[0] = v0 * m[0 * 4 + 0] + v1 * m[1 * 4 + 0] + v2 * m[2 * 4 + 0];
	  dst[1] = v0 * m[0 * 4 + 1] + v1 * m[1 * 4 + 1] + v2 * m[2 * 4 + 1];
	  dst[2] = v0 * m[0 * 4 + 2] + v1 * m[1 * 4 + 2] + v2 * m[2 * 4 + 2];

	  return dst;
	}

	/**
	 * Takes a 4-by-4 matrix m and a vector v with 3 entries, interprets the vector
	 * as a normal to a surface, and computes a vector which is normal upon
	 * transforming that surface by the matrix. The effect of this function is the
	 * same as transforming v (as a direction) by the inverse-transpose of m.  This
	 * function assumes the transformation of 3-dimensional space represented by the
	 * matrix is parallel-preserving, i.e. any combination of rotation, scaling and
	 * translation, but not a perspective distortion.  Returns a vector with 3
	 * entries.
	 * @param {module:twgl/m4.Mat4} m The matrix.
	 * @param {module:twgl/v3.Vec3} v The normal.
	 * @param {module:twgl/v3.Vec3} [dst] The direction. If not passed a new one is created.
	 * @return {module:twgl/v3.Vec3} The transformed normal.
	 * @memberOf module:twgl/m4
	 */
	function transformNormal(m, v, dst) {
	  dst = dst || create();
	  const mi = inverse(m);
	  const v0 = v[0];
	  const v1 = v[1];
	  const v2 = v[2];

	  dst[0] = v0 * mi[0 * 4 + 0] + v1 * mi[0 * 4 + 1] + v2 * mi[0 * 4 + 2];
	  dst[1] = v0 * mi[1 * 4 + 0] + v1 * mi[1 * 4 + 1] + v2 * mi[1 * 4 + 2];
	  dst[2] = v0 * mi[2 * 4 + 0] + v1 * mi[2 * 4 + 1] + v2 * mi[2 * 4 + 2];

	  return dst;
	}

	var m4 = /*#__PURE__*/Object.freeze({
	  __proto__: null,
	  axisRotate: axisRotate,
	  axisRotation: axisRotation,
	  copy: copy$1,
	  frustum: frustum,
	  getAxis: getAxis,
	  getTranslation: getTranslation,
	  identity: identity,
	  inverse: inverse,
	  lookAt: lookAt,
	  multiply: multiply$1,
	  negate: negate$1,
	  ortho: ortho,
	  perspective: perspective,
	  rotateX: rotateX,
	  rotateY: rotateY,
	  rotateZ: rotateZ,
	  rotationX: rotationX,
	  rotationY: rotationY,
	  rotationZ: rotationZ,
	  scale: scale,
	  scaling: scaling,
	  setAxis: setAxis,
	  setDefaultType: setDefaultType$1,
	  setTranslation: setTranslation,
	  transformDirection: transformDirection,
	  transformNormal: transformNormal,
	  transformPoint: transformPoint,
	  translate: translate,
	  translation: translation,
	  transpose: transpose
	});

	/*
	 * Copyright 2019 Gregg Tavares
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining a
	 * copy of this software and associated documentation files (the "Software"),
	 * to deal in the Software without restriction, including without limitation
	 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
	 * and/or sell copies of the Software, and to permit persons to whom the
	 * Software is furnished to do so, subject to the following conditions:
	 *
	 * The above copyright notice and this permission notice shall be included in
	 * all copies or substantial portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL
	 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
	 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
	 * DEALINGS IN THE SOFTWARE.
	 */

	/* DataType */
	const BYTE                           = 0x1400;
	const UNSIGNED_BYTE                  = 0x1401;
	const SHORT                          = 0x1402;
	const UNSIGNED_SHORT                 = 0x1403;
	const INT                            = 0x1404;
	const UNSIGNED_INT                   = 0x1405;
	const FLOAT                          = 0x1406;

	/**
	 * Get the GL type for a typedArray
	 * @param {ArrayBufferView} typedArray a typedArray
	 * @return {number} the GL type for array. For example pass in an `Int8Array` and `gl.BYTE` will
	 *   be returned. Pass in a `Uint32Array` and `gl.UNSIGNED_INT` will be returned
	 * @memberOf module:twgl/typedArray
	 */
	function getGLTypeForTypedArray(typedArray) {
	  if (typedArray instanceof Int8Array)         { return BYTE; }           // eslint-disable-line
	  if (typedArray instanceof Uint8Array)        { return UNSIGNED_BYTE; }  // eslint-disable-line
	  if (typedArray instanceof Uint8ClampedArray) { return UNSIGNED_BYTE; }  // eslint-disable-line
	  if (typedArray instanceof Int16Array)        { return SHORT; }          // eslint-disable-line
	  if (typedArray instanceof Uint16Array)       { return UNSIGNED_SHORT; } // eslint-disable-line
	  if (typedArray instanceof Int32Array)        { return INT; }            // eslint-disable-line
	  if (typedArray instanceof Uint32Array)       { return UNSIGNED_INT; }   // eslint-disable-line
	  if (typedArray instanceof Float32Array)      { return FLOAT; }          // eslint-disable-line
	  throw new Error('unsupported typed array type');
	}

	/**
	 * Get the GL type for a typedArray type
	 * @param {ArrayBufferView} typedArrayType a typedArray constructor
	 * @return {number} the GL type for type. For example pass in `Int8Array` and `gl.BYTE` will
	 *   be returned. Pass in `Uint32Array` and `gl.UNSIGNED_INT` will be returned
	 * @memberOf module:twgl/typedArray
	 */
	function getGLTypeForTypedArrayType(typedArrayType) {
	  if (typedArrayType === Int8Array)         { return BYTE; }           // eslint-disable-line
	  if (typedArrayType === Uint8Array)        { return UNSIGNED_BYTE; }  // eslint-disable-line
	  if (typedArrayType === Uint8ClampedArray) { return UNSIGNED_BYTE; }  // eslint-disable-line
	  if (typedArrayType === Int16Array)        { return SHORT; }          // eslint-disable-line
	  if (typedArrayType === Uint16Array)       { return UNSIGNED_SHORT; } // eslint-disable-line
	  if (typedArrayType === Int32Array)        { return INT; }            // eslint-disable-line
	  if (typedArrayType === Uint32Array)       { return UNSIGNED_INT; }   // eslint-disable-line
	  if (typedArrayType === Float32Array)      { return FLOAT; }          // eslint-disable-line
	  throw new Error('unsupported typed array type');
	}

	const isArrayBuffer = typeof SharedArrayBuffer !== 'undefined'
	  ? function isArrayBufferOrSharedArrayBuffer(a) {
	    return a && a.buffer && (a.buffer instanceof ArrayBuffer || a.buffer instanceof SharedArrayBuffer);
	  }
	  : function isArrayBuffer(a) {
	    return a && a.buffer && a.buffer instanceof ArrayBuffer;
	  };

	/*
	 * Copyright 2019 Gregg Tavares
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining a
	 * copy of this software and associated documentation files (the "Software"),
	 * to deal in the Software without restriction, including without limitation
	 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
	 * and/or sell copies of the Software, and to permit persons to whom the
	 * Software is furnished to do so, subject to the following conditions:
	 *
	 * The above copyright notice and this permission notice shall be included in
	 * all copies or substantial portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL
	 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
	 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
	 * DEALINGS IN THE SOFTWARE.
	 */

	/* eslint no-console: "off" */

	/**
	 * Copy named properties
	 *
	 * @param {string[]} names names of properties to copy
	 * @param {object} src object to copy properties from
	 * @param {object} dst object to copy properties to
	 * @private
	 */
	function copyNamedProperties(names, src, dst) {
	  names.forEach(function(name) {
	    const value = src[name];
	    if (value !== undefined) {
	      dst[name] = value;
	    }
	  });
	}

	function error(...args) {
	  console.error(...args);
	}

	function isBuffer(gl, t) {
	  return typeof WebGLBuffer !== 'undefined' && t instanceof WebGLBuffer;
	}

	function isShader(gl, t) {
	  return typeof WebGLShader !== 'undefined' && t instanceof WebGLShader;
	}

	function isTexture(gl, t) {
	  return typeof WebGLTexture !== 'undefined' && t instanceof WebGLTexture;
	}

	/*
	 * Copyright 2019 Gregg Tavares
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining a
	 * copy of this software and associated documentation files (the "Software"),
	 * to deal in the Software without restriction, including without limitation
	 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
	 * and/or sell copies of the Software, and to permit persons to whom the
	 * Software is furnished to do so, subject to the following conditions:
	 *
	 * The above copyright notice and this permission notice shall be included in
	 * all copies or substantial portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL
	 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
	 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
	 * DEALINGS IN THE SOFTWARE.
	 */

	const STATIC_DRAW                  = 0x88e4;
	const ARRAY_BUFFER                 = 0x8892;
	const ELEMENT_ARRAY_BUFFER         = 0x8893;
	const BUFFER_SIZE                  = 0x8764;

	const BYTE$1                         = 0x1400;
	const UNSIGNED_BYTE$1                = 0x1401;
	const SHORT$1                        = 0x1402;
	const UNSIGNED_SHORT$1               = 0x1403;
	const INT$1                          = 0x1404;
	const UNSIGNED_INT$1                 = 0x1405;
	const FLOAT$1                        = 0x1406;
	const defaults = {
	  attribPrefix: "",
	};

	function setBufferFromTypedArray(gl, type, buffer, array, drawType) {
	  gl.bindBuffer(type, buffer);
	  gl.bufferData(type, array, drawType || STATIC_DRAW);
	}

	/**
	 * Given typed array creates a WebGLBuffer and copies the typed array
	 * into it.
	 *
	 * @param {WebGLRenderingContext} gl A WebGLRenderingContext
	 * @param {ArrayBuffer|SharedArrayBuffer|ArrayBufferView|WebGLBuffer} typedArray the typed array. Note: If a WebGLBuffer is passed in it will just be returned. No action will be taken
	 * @param {number} [type] the GL bind type for the buffer. Default = `gl.ARRAY_BUFFER`.
	 * @param {number} [drawType] the GL draw type for the buffer. Default = 'gl.STATIC_DRAW`.
	 * @return {WebGLBuffer} the created WebGLBuffer
	 * @memberOf module:twgl/attributes
	 */
	function createBufferFromTypedArray(gl, typedArray, type, drawType) {
	  if (isBuffer(gl, typedArray)) {
	    return typedArray;
	  }
	  type = type || ARRAY_BUFFER;
	  const buffer = gl.createBuffer();
	  setBufferFromTypedArray(gl, type, buffer, typedArray, drawType);
	  return buffer;
	}

	function isIndices(name) {
	  return name === "indices";
	}

	// This is really just a guess. Though I can't really imagine using
	// anything else? Maybe for some compression?
	function getNormalizationForTypedArray(typedArray) {
	  if (typedArray instanceof Int8Array)    { return true; }  // eslint-disable-line
	  if (typedArray instanceof Uint8Array)   { return true; }  // eslint-disable-line
	  return false;
	}

	// This is really just a guess. Though I can't really imagine using
	// anything else? Maybe for some compression?
	function getNormalizationForTypedArrayType(typedArrayType) {
	  if (typedArrayType === Int8Array)    { return true; }  // eslint-disable-line
	  if (typedArrayType === Uint8Array)   { return true; }  // eslint-disable-line
	  return false;
	}

	function getArray(array) {
	  return array.length ? array : array.data;
	}

	const texcoordRE = /coord|texture/i;
	const colorRE = /color|colour/i;

	function guessNumComponentsFromName(name, length) {
	  let numComponents;
	  if (texcoordRE.test(name)) {
	    numComponents = 2;
	  } else if (colorRE.test(name)) {
	    numComponents = 4;
	  } else {
	    numComponents = 3;  // position, normals, indices ...
	  }

	  if (length % numComponents > 0) {
	    throw new Error(`Can not guess numComponents for attribute '${name}'. Tried ${numComponents} but ${length} values is not evenly divisible by ${numComponents}. You should specify it.`);
	  }

	  return numComponents;
	}

	function getNumComponents(array, arrayName) {
	  return array.numComponents || array.size || guessNumComponentsFromName(arrayName, getArray(array).length);
	}

	function makeTypedArray(array, name) {
	  if (isArrayBuffer(array)) {
	    return array;
	  }

	  if (isArrayBuffer(array.data)) {
	    return array.data;
	  }

	  if (Array.isArray(array)) {
	    array = {
	      data: array,
	    };
	  }

	  let Type = array.type;
	  if (!Type) {
	    if (isIndices(name)) {
	      Type = Uint16Array;
	    } else {
	      Type = Float32Array;
	    }
	  }
	  return new Type(array.data);
	}

	/**
	 * The info for an attribute. This is effectively just the arguments to `gl.vertexAttribPointer` plus the WebGLBuffer
	 * for the attribute.
	 *
	 * @typedef {Object} AttribInfo
	 * @property {number[]|ArrayBufferView} [value] a constant value for the attribute. Note: if this is set the attribute will be
	 *    disabled and set to this constant value and all other values will be ignored.
	 * @property {number} [numComponents] the number of components for this attribute.
	 * @property {number} [size] synonym for `numComponents`.
	 * @property {number} [type] the type of the attribute (eg. `gl.FLOAT`, `gl.UNSIGNED_BYTE`, etc...) Default = `gl.FLOAT`
	 * @property {boolean} [normalize] whether or not to normalize the data. Default = false
	 * @property {number} [offset] offset into buffer in bytes. Default = 0
	 * @property {number} [stride] the stride in bytes per element. Default = 0
	 * @property {number} [divisor] the divisor in instances. Default = undefined. Note: undefined = don't call gl.vertexAttribDivisor
	 *    where as anything else = do call it with this value
	 * @property {WebGLBuffer} buffer the buffer that contains the data for this attribute
	 * @property {number} [drawType] the draw type passed to gl.bufferData. Default = gl.STATIC_DRAW
	 * @memberOf module:twgl
	 */

	/**
	 * Use this type of array spec when TWGL can't guess the type or number of components of an array
	 * @typedef {Object} FullArraySpec
	 * @property {number[]|ArrayBufferView} [value] a constant value for the attribute. Note: if this is set the attribute will be
	 *    disabled and set to this constant value and all other values will be ignored.
	 * @property {(number|number[]|ArrayBufferView)} data The data of the array. A number alone becomes the number of elements of type.
	 * @property {number} [numComponents] number of components for `vertexAttribPointer`. Default is based on the name of the array.
	 *    If `coord` is in the name assumes `numComponents = 2`.
	 *    If `color` is in the name assumes `numComponents = 4`.
	 *    otherwise assumes `numComponents = 3`
	 * @property {constructor} [type] type. This is only used if `data` is a JavaScript array. It is the constructor for the typedarray. (eg. `Uint8Array`).
	 * For example if you want colors in a `Uint8Array` you might have a `FullArraySpec` like `{ type: Uint8Array, data: [255,0,255,255, ...], }`.
	 * @property {number} [size] synonym for `numComponents`.
	 * @property {boolean} [normalize] normalize for `vertexAttribPointer`. Default is true if type is `Int8Array` or `Uint8Array` otherwise false.
	 * @property {number} [stride] stride for `vertexAttribPointer`. Default = 0
	 * @property {number} [offset] offset for `vertexAttribPointer`. Default = 0
	 * @property {number} [divisor] divisor for `vertexAttribDivisor`. Default = undefined. Note: undefined = don't call gl.vertexAttribDivisor
	 *    where as anything else = do call it with this value
	 * @property {string} [attrib] name of attribute this array maps to. Defaults to same name as array prefixed by the default attribPrefix.
	 * @property {string} [name] synonym for `attrib`.
	 * @property {string} [attribName] synonym for `attrib`.
	 * @property {WebGLBuffer} [buffer] Buffer to use for this attribute. This lets you use your own buffer
	 *    but you will need to supply `numComponents` and `type`. You can effectively pass an `AttribInfo`
	 *    to provide this. Example:
	 *
	 *         const bufferInfo1 = twgl.createBufferInfoFromArrays(gl, {
	 *           position: [1, 2, 3, ... ],
	 *         });
	 *         const bufferInfo2 = twgl.createBufferInfoFromArrays(gl, {
	 *           position: bufferInfo1.attribs.position,  // use the same buffer from bufferInfo1
	 *         });
	 *
	 * @memberOf module:twgl
	 */

	/**
	 * An individual array in {@link module:twgl.Arrays}
	 *
	 * When passed to {@link module:twgl.createBufferInfoFromArrays} if an ArraySpec is `number[]` or `ArrayBufferView`
	 * the types will be guessed based on the name. `indices` will be `Uint16Array`, everything else will
	 * be `Float32Array`. If an ArraySpec is a number it's the number of floats for an empty (zeroed) buffer.
	 *
	 * @typedef {(number|number[]|ArrayBufferView|module:twgl.FullArraySpec)} ArraySpec
	 * @memberOf module:twgl
	 */

	/**
	 * This is a JavaScript object of arrays by name. The names should match your shader's attributes. If your
	 * attributes have a common prefix you can specify it by calling {@link module:twgl.setAttributePrefix}.
	 *
	 *     Bare JavaScript Arrays
	 *
	 *         var arrays = {
	 *            position: [-1, 1, 0],
	 *            normal: [0, 1, 0],
	 *            ...
	 *         }
	 *
	 *     Bare TypedArrays
	 *
	 *         var arrays = {
	 *            position: new Float32Array([-1, 1, 0]),
	 *            color: new Uint8Array([255, 128, 64, 255]),
	 *            ...
	 *         }
	 *
	 * *   Will guess at `numComponents` if not specified based on name.
	 *
	 *     If `coord` is in the name assumes `numComponents = 2`
	 *
	 *     If `color` is in the name assumes `numComponents = 4`
	 *
	 *     otherwise assumes `numComponents = 3`
	 *
	 * Objects with various fields. See {@link module:twgl.FullArraySpec}.
	 *
	 *     var arrays = {
	 *       position: { numComponents: 3, data: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0], },
	 *       texcoord: { numComponents: 2, data: [0, 0, 0, 1, 1, 0, 1, 1],                 },
	 *       normal:   { numComponents: 3, data: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],     },
	 *       indices:  { numComponents: 3, data: [0, 1, 2, 1, 2, 3],                       },
	 *     };
	 *
	 * @typedef {Object.<string, module:twgl.ArraySpec>} Arrays
	 * @memberOf module:twgl
	 */


	/**
	 * Creates a set of attribute data and WebGLBuffers from set of arrays
	 *
	 * Given
	 *
	 *      var arrays = {
	 *        position: { numComponents: 3, data: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0], },
	 *        texcoord: { numComponents: 2, data: [0, 0, 0, 1, 1, 0, 1, 1],                 },
	 *        normal:   { numComponents: 3, data: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],     },
	 *        color:    { numComponents: 4, data: [255, 255, 255, 255, 255, 0, 0, 255, 0, 0, 255, 255], type: Uint8Array, },
	 *        indices:  { numComponents: 3, data: [0, 1, 2, 1, 2, 3],                       },
	 *      };
	 *
	 * returns something like
	 *
	 *      var attribs = {
	 *        position: { numComponents: 3, type: gl.FLOAT,         normalize: false, buffer: WebGLBuffer, },
	 *        texcoord: { numComponents: 2, type: gl.FLOAT,         normalize: false, buffer: WebGLBuffer, },
	 *        normal:   { numComponents: 3, type: gl.FLOAT,         normalize: false, buffer: WebGLBuffer, },
	 *        color:    { numComponents: 4, type: gl.UNSIGNED_BYTE, normalize: true,  buffer: WebGLBuffer, },
	 *      };
	 *
	 * notes:
	 *
	 * *   Arrays can take various forms
	 *
	 *     Bare JavaScript Arrays
	 *
	 *         var arrays = {
	 *            position: [-1, 1, 0],
	 *            normal: [0, 1, 0],
	 *            ...
	 *         }
	 *
	 *     Bare TypedArrays
	 *
	 *         var arrays = {
	 *            position: new Float32Array([-1, 1, 0]),
	 *            color: new Uint8Array([255, 128, 64, 255]),
	 *            ...
	 *         }
	 *
	 * *   Will guess at `numComponents` if not specified based on name.
	 *
	 *     If `coord` is in the name assumes `numComponents = 2`
	 *
	 *     If `color` is in the name assumes `numComponents = 4`
	 *
	 *     otherwise assumes `numComponents = 3`
	 *
	 * @param {WebGLRenderingContext} gl The webgl rendering context.
	 * @param {module:twgl.Arrays} arrays The arrays
	 * @param {module:twgl.BufferInfo} [srcBufferInfo] a BufferInfo to copy from
	 *   This lets you share buffers. Any arrays you supply will override
	 *   the buffers from srcBufferInfo.
	 * @return {Object.<string, module:twgl.AttribInfo>} the attribs
	 * @memberOf module:twgl/attributes
	 */
	function createAttribsFromArrays(gl, arrays) {
	  const attribs = {};
	  Object.keys(arrays).forEach(function(arrayName) {
	    if (!isIndices(arrayName)) {
	      const array = arrays[arrayName];
	      const attribName = array.attrib || array.name || array.attribName || (defaults.attribPrefix + arrayName);
	      if (array.value) {
	        if (!Array.isArray(array.value) && !isArrayBuffer(array.value)) {
	          throw new Error('array.value is not array or typedarray');
	        }
	        attribs[attribName] = {
	          value: array.value,
	        };
	      } else {
	        let buffer;
	        let type;
	        let normalization;
	        let numComponents;
	        if (array.buffer && array.buffer instanceof WebGLBuffer) {
	          buffer = array.buffer;
	          numComponents = array.numComponents || array.size;
	          type = array.type;
	          normalization = array.normalize;
	        } else if (typeof array === "number" || typeof array.data === "number") {
	          const numValues = array.data || array;
	          const arrayType = array.type || Float32Array;
	          const numBytes = numValues * arrayType.BYTES_PER_ELEMENT;
	          type = getGLTypeForTypedArrayType(arrayType);
	          normalization = array.normalize !== undefined ? array.normalize : getNormalizationForTypedArrayType(arrayType);
	          numComponents = array.numComponents || array.size || guessNumComponentsFromName(arrayName, numValues);
	          buffer = gl.createBuffer();
	          gl.bindBuffer(ARRAY_BUFFER, buffer);
	          gl.bufferData(ARRAY_BUFFER, numBytes, array.drawType || STATIC_DRAW);
	        } else {
	          const typedArray = makeTypedArray(array, arrayName);
	          buffer = createBufferFromTypedArray(gl, typedArray, undefined, array.drawType);
	          type = getGLTypeForTypedArray(typedArray);
	          normalization = array.normalize !== undefined ? array.normalize : getNormalizationForTypedArray(typedArray);
	          numComponents = getNumComponents(array, arrayName);
	        }
	        attribs[attribName] = {
	          buffer:        buffer,
	          numComponents: numComponents,
	          type:          type,
	          normalize:     normalization,
	          stride:        array.stride || 0,
	          offset:        array.offset || 0,
	          divisor:       array.divisor === undefined ? undefined : array.divisor,
	          drawType:      array.drawType,
	        };
	      }
	    }
	  });
	  gl.bindBuffer(ARRAY_BUFFER, null);
	  return attribs;
	}

	function getBytesPerValueForGLType(gl, type) {
	  if (type === BYTE$1)           return 1;  // eslint-disable-line
	  if (type === UNSIGNED_BYTE$1)  return 1;  // eslint-disable-line
	  if (type === SHORT$1)          return 2;  // eslint-disable-line
	  if (type === UNSIGNED_SHORT$1) return 2;  // eslint-disable-line
	  if (type === INT$1)            return 4;  // eslint-disable-line
	  if (type === UNSIGNED_INT$1)   return 4;  // eslint-disable-line
	  if (type === FLOAT$1)          return 4;  // eslint-disable-line
	  return 0;
	}

	// Tries to get the number of elements from a set of arrays.
	const positionKeys = ['position', 'positions', 'a_position'];
	function getNumElementsFromNonIndexedArrays(arrays) {
	  let key;
	  let ii;
	  for (ii = 0; ii < positionKeys.length; ++ii) {
	    key = positionKeys[ii];
	    if (key in arrays) {
	      break;
	    }
	  }
	  if (ii === positionKeys.length) {
	    key = Object.keys(arrays)[0];
	  }
	  const array = arrays[key];
	  const length = getArray(array).length;
	  const numComponents = getNumComponents(array, key);
	  const numElements = length / numComponents;
	  if (length % numComponents > 0) {
	    throw new Error(`numComponents ${numComponents} not correct for length ${length}`);
	  }
	  return numElements;
	}

	function getNumElementsFromAttributes(gl, attribs) {
	  let key;
	  let ii;
	  for (ii = 0; ii < positionKeys.length; ++ii) {
	    key = positionKeys[ii];
	    if (key in attribs) {
	      break;
	    }
	    key = defaults.attribPrefix + key;
	    if (key in attribs) {
	      break;
	    }
	  }
	  if (ii === positionKeys.length) {
	    key = Object.keys(attribs)[0];
	  }
	  const attrib = attribs[key];
	  gl.bindBuffer(ARRAY_BUFFER, attrib.buffer);
	  const numBytes = gl.getBufferParameter(ARRAY_BUFFER, BUFFER_SIZE);
	  gl.bindBuffer(ARRAY_BUFFER, null);

	  const bytesPerValue = getBytesPerValueForGLType(gl, attrib.type);
	  const totalElements = numBytes / bytesPerValue;
	  const numComponents = attrib.numComponents || attrib.size;
	  // TODO: check stride
	  const numElements = totalElements / numComponents;
	  if (numElements % 1 !== 0) {
	    throw new Error(`numComponents ${numComponents} not correct for length ${length}`);
	  }
	  return numElements;
	}

	/**
	 * @typedef {Object} BufferInfo
	 * @property {number} numElements The number of elements to pass to `gl.drawArrays` or `gl.drawElements`.
	 * @property {number} [elementType] The type of indices `UNSIGNED_BYTE`, `UNSIGNED_SHORT` etc..
	 * @property {WebGLBuffer} [indices] The indices `ELEMENT_ARRAY_BUFFER` if any indices exist.
	 * @property {Object.<string, module:twgl.AttribInfo>} [attribs] The attribs appropriate to call `setAttributes`
	 * @memberOf module:twgl
	 */

	/**
	 * Creates a BufferInfo from an object of arrays.
	 *
	 * This can be passed to {@link module:twgl.setBuffersAndAttributes} and to
	 * {@link module:twgl:drawBufferInfo}.
	 *
	 * Given an object like
	 *
	 *     var arrays = {
	 *       position: { numComponents: 3, data: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0], },
	 *       texcoord: { numComponents: 2, data: [0, 0, 0, 1, 1, 0, 1, 1],                 },
	 *       normal:   { numComponents: 3, data: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],     },
	 *       indices:  { numComponents: 3, data: [0, 1, 2, 1, 2, 3],                       },
	 *     };
	 *
	 *  Creates an BufferInfo like this
	 *
	 *     bufferInfo = {
	 *       numElements: 4,        // or whatever the number of elements is
	 *       indices: WebGLBuffer,  // this property will not exist if there are no indices
	 *       attribs: {
	 *         position: { buffer: WebGLBuffer, numComponents: 3, },
	 *         normal:   { buffer: WebGLBuffer, numComponents: 3, },
	 *         texcoord: { buffer: WebGLBuffer, numComponents: 2, },
	 *       },
	 *     };
	 *
	 *  The properties of arrays can be JavaScript arrays in which case the number of components
	 *  will be guessed.
	 *
	 *     var arrays = {
	 *        position: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0],
	 *        texcoord: [0, 0, 0, 1, 1, 0, 1, 1],
	 *        normal:   [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
	 *        indices:  [0, 1, 2, 1, 2, 3],
	 *     };
	 *
	 *  They can also be TypedArrays
	 *
	 *     var arrays = {
	 *        position: new Float32Array([0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0]),
	 *        texcoord: new Float32Array([0, 0, 0, 1, 1, 0, 1, 1]),
	 *        normal:   new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]),
	 *        indices:  new Uint16Array([0, 1, 2, 1, 2, 3]),
	 *     };
	 *
	 *  Or AugmentedTypedArrays
	 *
	 *     var positions = createAugmentedTypedArray(3, 4);
	 *     var texcoords = createAugmentedTypedArray(2, 4);
	 *     var normals   = createAugmentedTypedArray(3, 4);
	 *     var indices   = createAugmentedTypedArray(3, 2, Uint16Array);
	 *
	 *     positions.push([0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0]);
	 *     texcoords.push([0, 0, 0, 1, 1, 0, 1, 1]);
	 *     normals.push([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]);
	 *     indices.push([0, 1, 2, 1, 2, 3]);
	 *
	 *     var arrays = {
	 *        position: positions,
	 *        texcoord: texcoords,
	 *        normal:   normals,
	 *        indices:  indices,
	 *     };
	 *
	 * For the last example it is equivalent to
	 *
	 *     var bufferInfo = {
	 *       attribs: {
	 *         position: { numComponents: 3, buffer: gl.createBuffer(), },
	 *         texcoord: { numComponents: 2, buffer: gl.createBuffer(), },
	 *         normal: { numComponents: 3, buffer: gl.createBuffer(), },
	 *       },
	 *       indices: gl.createBuffer(),
	 *       numElements: 6,
	 *     };
	 *
	 *     gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.position.buffer);
	 *     gl.bufferData(gl.ARRAY_BUFFER, arrays.position, gl.STATIC_DRAW);
	 *     gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.texcoord.buffer);
	 *     gl.bufferData(gl.ARRAY_BUFFER, arrays.texcoord, gl.STATIC_DRAW);
	 *     gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.normal.buffer);
	 *     gl.bufferData(gl.ARRAY_BUFFER, arrays.normal, gl.STATIC_DRAW);
	 *     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferInfo.indices);
	 *     gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, arrays.indices, gl.STATIC_DRAW);
	 *
	 * @param {WebGLRenderingContext} gl A WebGLRenderingContext
	 * @param {module:twgl.Arrays} arrays Your data
	 * @param {module:twgl.BufferInfo} [srcBufferInfo] An existing
	 *        buffer info to start from. WebGLBuffers etc specified
	 *        in the srcBufferInfo will be used in a new BufferInfo
	 *        with any arrays specified overriding the ones in
	 *        srcBufferInfo.
	 * @return {module:twgl.BufferInfo} A BufferInfo
	 * @memberOf module:twgl/attributes
	 */
	function createBufferInfoFromArrays(gl, arrays, srcBufferInfo) {
	  const newAttribs = createAttribsFromArrays(gl, arrays);
	  const bufferInfo = Object.assign({}, srcBufferInfo ? srcBufferInfo : {});
	  bufferInfo.attribs = Object.assign({}, srcBufferInfo ? srcBufferInfo.attribs : {}, newAttribs);
	  const indices = arrays.indices;
	  if (indices) {
	    const newIndices = makeTypedArray(indices, "indices");
	    bufferInfo.indices = createBufferFromTypedArray(gl, newIndices, ELEMENT_ARRAY_BUFFER);
	    bufferInfo.numElements = newIndices.length;
	    bufferInfo.elementType = getGLTypeForTypedArray(newIndices);
	  } else if (!bufferInfo.numElements) {
	    bufferInfo.numElements = getNumElementsFromAttributes(gl, bufferInfo.attribs);
	  }

	  return bufferInfo;
	}

	/**
	 * Creates a buffer from an array, typed array, or array spec
	 *
	 * Given something like this
	 *
	 *     [1, 2, 3],
	 *
	 * or
	 *
	 *     new Uint16Array([1,2,3]);
	 *
	 * or
	 *
	 *     {
	 *        data: [1, 2, 3],
	 *        type: Uint8Array,
	 *     }
	 *
	 * returns a WebGLBuffer that contains the given data.
	 *
	 * @param {WebGLRenderingContext} gl A WebGLRenderingContext.
	 * @param {module:twgl.ArraySpec} array an array, typed array, or array spec.
	 * @param {string} arrayName name of array. Used to guess the type if type can not be derived otherwise.
	 * @return {WebGLBuffer} a WebGLBuffer containing the data in array.
	 * @memberOf module:twgl/attributes
	 */
	function createBufferFromArray(gl, array, arrayName) {
	  const type = arrayName === "indices" ? ELEMENT_ARRAY_BUFFER : ARRAY_BUFFER;
	  const typedArray = makeTypedArray(array, arrayName);
	  return createBufferFromTypedArray(gl, typedArray, type);
	}

	/**
	 * Creates buffers from arrays or typed arrays
	 *
	 * Given something like this
	 *
	 *     var arrays = {
	 *        positions: [1, 2, 3],
	 *        normals: [0, 0, 1],
	 *     }
	 *
	 * returns something like
	 *
	 *     buffers = {
	 *       positions: WebGLBuffer,
	 *       normals: WebGLBuffer,
	 *     }
	 *
	 * If the buffer is named 'indices' it will be made an ELEMENT_ARRAY_BUFFER.
	 *
	 * @param {WebGLRenderingContext} gl A WebGLRenderingContext.
	 * @param {module:twgl.Arrays} arrays
	 * @return {Object<string, WebGLBuffer>} returns an object with one WebGLBuffer per array
	 * @memberOf module:twgl/attributes
	 */
	function createBuffersFromArrays(gl, arrays) {
	  const buffers = { };
	  Object.keys(arrays).forEach(function(key) {
	    buffers[key] = createBufferFromArray(gl, arrays[key], key);
	  });

	  // Ugh!
	  if (arrays.indices) {
	    buffers.numElements = arrays.indices.length;
	    buffers.elementType = getGLTypeForTypedArray(makeTypedArray(arrays.indices));
	  } else {
	    buffers.numElements = getNumElementsFromNonIndexedArrays(arrays);
	  }

	  return buffers;
	}

	/*
	 * Copyright 2019 Gregg Tavares
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining a
	 * copy of this software and associated documentation files (the "Software"),
	 * to deal in the Software without restriction, including without limitation
	 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
	 * and/or sell copies of the Software, and to permit persons to whom the
	 * Software is furnished to do so, subject to the following conditions:
	 *
	 * The above copyright notice and this permission notice shall be included in
	 * all copies or substantial portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL
	 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
	 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
	 * DEALINGS IN THE SOFTWARE.
	 */

	const getArray$1 = getArray;  // eslint-disable-line
	const getNumComponents$1 = getNumComponents;  // eslint-disable-line

	/**
	 * @typedef {(Int8Array|Uint8Array|Int16Array|Uint16Array|Int32Array|Uint32Array|Float32Array)} TypedArray
	 */

	/**
	 * Add `push` to a typed array. It just keeps a 'cursor'
	 * and allows use to `push` values into the array so we
	 * don't have to manually compute offsets
	 * @param {TypedArray} typedArray TypedArray to augment
	 * @param {number} numComponents number of components.
	 * @private
	 */
	function augmentTypedArray(typedArray, numComponents) {
	  let cursor = 0;
	  typedArray.push = function() {
	    for (let ii = 0; ii < arguments.length; ++ii) {
	      const value = arguments[ii];
	      if (value instanceof Array || isArrayBuffer(value)) {
	        for (let jj = 0; jj < value.length; ++jj) {
	          typedArray[cursor++] = value[jj];
	        }
	      } else {
	        typedArray[cursor++] = value;
	      }
	    }
	  };
	  typedArray.reset = function(opt_index) {
	    cursor = opt_index || 0;
	  };
	  typedArray.numComponents = numComponents;
	  Object.defineProperty(typedArray, 'numElements', {
	    get: function() {
	      return this.length / this.numComponents | 0;
	    },
	  });
	  return typedArray;
	}

	/**
	 * creates a typed array with a `push` function attached
	 * so that you can easily *push* values.
	 *
	 * `push` can take multiple arguments. If an argument is an array each element
	 * of the array will be added to the typed array.
	 *
	 * Example:
	 *
	 *     const array = createAugmentedTypedArray(3, 2);  // creates a Float32Array with 6 values
	 *     array.push(1, 2, 3);
	 *     array.push([4, 5, 6]);
	 *     // array now contains [1, 2, 3, 4, 5, 6]
	 *
	 * Also has `numComponents` and `numElements` properties.
	 *
	 * @param {number} numComponents number of components
	 * @param {number} numElements number of elements. The total size of the array will be `numComponents * numElements`.
	 * @param {constructor} opt_type A constructor for the type. Default = `Float32Array`.
	 * @return {ArrayBufferView} A typed array.
	 * @memberOf module:twgl/primitives
	 */
	function createAugmentedTypedArray(numComponents, numElements, opt_type) {
	  const Type = opt_type || Float32Array;
	  return augmentTypedArray(new Type(numComponents * numElements), numComponents);
	}

	function allButIndices(name) {
	  return name !== "indices";
	}

	/**
	 * Given indexed vertices creates a new set of vertices un-indexed by expanding the indexed vertices.
	 * @param {Object.<string, TypedArray>} vertices The indexed vertices to deindex
	 * @return {Object.<string, TypedArray>} The deindexed vertices
	 * @memberOf module:twgl/primitives
	 */
	function deindexVertices(vertices) {
	  const indices = vertices.indices;
	  const newVertices = {};
	  const numElements = indices.length;

	  function expandToUnindexed(channel) {
	    const srcBuffer = vertices[channel];
	    const numComponents = srcBuffer.numComponents;
	    const dstBuffer = createAugmentedTypedArray(numComponents, numElements, srcBuffer.constructor);
	    for (let ii = 0; ii < numElements; ++ii) {
	      const ndx = indices[ii];
	      const offset = ndx * numComponents;
	      for (let jj = 0; jj < numComponents; ++jj) {
	        dstBuffer.push(srcBuffer[offset + jj]);
	      }
	    }
	    newVertices[channel] = dstBuffer;
	  }

	  Object.keys(vertices).filter(allButIndices).forEach(expandToUnindexed);

	  return newVertices;
	}

	/**
	 * flattens the normals of deindexed vertices in place.
	 * @param {Object.<string, TypedArray>} vertices The deindexed vertices who's normals to flatten
	 * @return {Object.<string, TypedArray>} The flattened vertices (same as was passed in)
	 * @memberOf module:twgl/primitives
	 */
	function flattenNormals(vertices) {
	  if (vertices.indices) {
	    throw new Error('can not flatten normals of indexed vertices. deindex them first');
	  }

	  const normals = vertices.normal;
	  const numNormals = normals.length;
	  for (let ii = 0; ii < numNormals; ii += 9) {
	    // pull out the 3 normals for this triangle
	    const nax = normals[ii + 0];
	    const nay = normals[ii + 1];
	    const naz = normals[ii + 2];

	    const nbx = normals[ii + 3];
	    const nby = normals[ii + 4];
	    const nbz = normals[ii + 5];

	    const ncx = normals[ii + 6];
	    const ncy = normals[ii + 7];
	    const ncz = normals[ii + 8];

	    // add them
	    let nx = nax + nbx + ncx;
	    let ny = nay + nby + ncy;
	    let nz = naz + nbz + ncz;

	    // normalize them
	    const length = Math.sqrt(nx * nx + ny * ny + nz * nz);

	    nx /= length;
	    ny /= length;
	    nz /= length;

	    // copy them back in
	    normals[ii + 0] = nx;
	    normals[ii + 1] = ny;
	    normals[ii + 2] = nz;

	    normals[ii + 3] = nx;
	    normals[ii + 4] = ny;
	    normals[ii + 5] = nz;

	    normals[ii + 6] = nx;
	    normals[ii + 7] = ny;
	    normals[ii + 8] = nz;
	  }

	  return vertices;
	}

	function applyFuncToV3Array(array, matrix, fn) {
	  const len = array.length;
	  const tmp = new Float32Array(3);
	  for (let ii = 0; ii < len; ii += 3) {
	    fn(matrix, [array[ii], array[ii + 1], array[ii + 2]], tmp);
	    array[ii    ] = tmp[0];
	    array[ii + 1] = tmp[1];
	    array[ii + 2] = tmp[2];
	  }
	}

	function transformNormal$1(mi, v, dst) {
	  dst = dst || create();
	  const v0 = v[0];
	  const v1 = v[1];
	  const v2 = v[2];

	  dst[0] = v0 * mi[0 * 4 + 0] + v1 * mi[0 * 4 + 1] + v2 * mi[0 * 4 + 2];
	  dst[1] = v0 * mi[1 * 4 + 0] + v1 * mi[1 * 4 + 1] + v2 * mi[1 * 4 + 2];
	  dst[2] = v0 * mi[2 * 4 + 0] + v1 * mi[2 * 4 + 1] + v2 * mi[2 * 4 + 2];

	  return dst;
	}

	/**
	 * Reorients directions by the given matrix..
	 * @param {(number[]|TypedArray)} array The array. Assumes value floats per element.
	 * @param {module:twgl/m4.Mat4} matrix A matrix to multiply by.
	 * @return {(number[]|TypedArray)} the same array that was passed in
	 * @memberOf module:twgl/primitives
	 */
	function reorientDirections(array, matrix) {
	  applyFuncToV3Array(array, matrix, transformDirection);
	  return array;
	}

	/**
	 * Reorients normals by the inverse-transpose of the given
	 * matrix..
	 * @param {(number[]|TypedArray)} array The array. Assumes value floats per element.
	 * @param {module:twgl/m4.Mat4} matrix A matrix to multiply by.
	 * @return {(number[]|TypedArray)} the same array that was passed in
	 * @memberOf module:twgl/primitives
	 */
	function reorientNormals(array, matrix) {
	  applyFuncToV3Array(array, inverse(matrix), transformNormal$1);
	  return array;
	}

	/**
	 * Reorients positions by the given matrix. In other words, it
	 * multiplies each vertex by the given matrix.
	 * @param {(number[]|TypedArray)} array The array. Assumes value floats per element.
	 * @param {module:twgl/m4.Mat4} matrix A matrix to multiply by.
	 * @return {(number[]|TypedArray)} the same array that was passed in
	 * @memberOf module:twgl/primitives
	 */
	function reorientPositions(array, matrix) {
	  applyFuncToV3Array(array, matrix, transformPoint);
	  return array;
	}

	/**
	 * @typedef {(number[]|TypedArray)} NativeArrayOrTypedArray
	 */

	/**
	 * Reorients arrays by the given matrix. Assumes arrays have
	 * names that contains 'pos' could be reoriented as positions,
	 * 'binorm' or 'tan' as directions, and 'norm' as normals.
	 *
	 * @param {Object.<string, NativeArrayOrTypedArray>} arrays The vertices to reorient
	 * @param {module:twgl/m4.Mat4} matrix matrix to reorient by.
	 * @return {Object.<string, NativeArrayOrTypedArray>} same arrays that were passed in.
	 * @memberOf module:twgl/primitives
	 */
	function reorientVertices(arrays, matrix) {
	  Object.keys(arrays).forEach(function(name) {
	    const array = arrays[name];
	    if (name.indexOf("pos") >= 0) {
	      reorientPositions(array, matrix);
	    } else if (name.indexOf("tan") >= 0 || name.indexOf("binorm") >= 0) {
	      reorientDirections(array, matrix);
	    } else if (name.indexOf("norm") >= 0) {
	      reorientNormals(array, matrix);
	    }
	  });
	  return arrays;
	}

	/**
	 * Creates XY quad BufferInfo
	 *
	 * The default with no parameters will return a 2x2 quad with values from -1 to +1.
	 * If you want a unit quad with that goes from 0 to 1 you'd call it with
	 *
	 *     twgl.primitives.createXYQuadBufferInfo(gl, 1, 0.5, 0.5);
	 *
	 * If you want a unit quad centered above 0,0 you'd call it with
	 *
	 *     twgl.primitives.createXYQuadBufferInfo(gl, 1, 0, 0.5);
	 *
	 * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
	 * @param {number} [size] the size across the quad. Defaults to 2 which means vertices will go from -1 to +1
	 * @param {number} [xOffset] the amount to offset the quad in X
	 * @param {number} [yOffset] the amount to offset the quad in Y
	 * @return {Object.<string, WebGLBuffer>} the created XY Quad BufferInfo
	 * @memberOf module:twgl/primitives
	 * @function createXYQuadBuffers
	 */

	/**
	 * Creates XY quad Buffers
	 *
	 * The default with no parameters will return a 2x2 quad with values from -1 to +1.
	 * If you want a unit quad with that goes from 0 to 1 you'd call it with
	 *
	 *     twgl.primitives.createXYQuadBufferInfo(gl, 1, 0.5, 0.5);
	 *
	 * If you want a unit quad centered above 0,0 you'd call it with
	 *
	 *     twgl.primitives.createXYQuadBufferInfo(gl, 1, 0, 0.5);
	 *
	 * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
	 * @param {number} [size] the size across the quad. Defaults to 2 which means vertices will go from -1 to +1
	 * @param {number} [xOffset] the amount to offset the quad in X
	 * @param {number} [yOffset] the amount to offset the quad in Y
	 * @return {module:twgl.BufferInfo} the created XY Quad buffers
	 * @memberOf module:twgl/primitives
	 * @function createXYQuadBufferInfo
	 */

	/**
	 * Creates XY quad vertices
	 *
	 * The default with no parameters will return a 2x2 quad with values from -1 to +1.
	 * If you want a unit quad with that goes from 0 to 1 you'd call it with
	 *
	 *     twgl.primitives.createXYQuadVertices(1, 0.5, 0.5);
	 *
	 * If you want a unit quad centered above 0,0 you'd call it with
	 *
	 *     twgl.primitives.createXYQuadVertices(1, 0, 0.5);
	 *
	 * @param {number} [size] the size across the quad. Defaults to 2 which means vertices will go from -1 to +1
	 * @param {number} [xOffset] the amount to offset the quad in X
	 * @param {number} [yOffset] the amount to offset the quad in Y
	 * @return {Object.<string, TypedArray>} the created XY Quad vertices
	 * @memberOf module:twgl/primitives
	 */
	function createXYQuadVertices(size, xOffset, yOffset) {
	  size = size || 2;
	  xOffset = xOffset || 0;
	  yOffset = yOffset || 0;
	  size *= 0.5;
	  return {
	    position: {
	      numComponents: 2,
	      data: [
	        xOffset + -1 * size, yOffset + -1 * size,
	        xOffset +  1 * size, yOffset + -1 * size,
	        xOffset + -1 * size, yOffset +  1 * size,
	        xOffset +  1 * size, yOffset +  1 * size,
	      ],
	    },
	    normal: [
	      0, 0, 1,
	      0, 0, 1,
	      0, 0, 1,
	      0, 0, 1,
	    ],
	    texcoord: [
	      0, 0,
	      1, 0,
	      0, 1,
	      1, 1,
	    ],
	    indices: [ 0, 1, 2, 2, 1, 3 ],
	  };
	}

	/**
	 * Creates XZ plane BufferInfo.
	 *
	 * The created plane has position, normal, and texcoord data
	 *
	 * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
	 * @param {number} [width] Width of the plane. Default = 1
	 * @param {number} [depth] Depth of the plane. Default = 1
	 * @param {number} [subdivisionsWidth] Number of steps across the plane. Default = 1
	 * @param {number} [subdivisionsDepth] Number of steps down the plane. Default = 1
	 * @param {module:twgl/m4.Mat4} [matrix] A matrix by which to multiply all the vertices.
	 * @return {module:twgl.BufferInfo} The created plane BufferInfo.
	 * @memberOf module:twgl/primitives
	 * @function createPlaneBufferInfo
	 */

	/**
	 * Creates XZ plane buffers.
	 *
	 * The created plane has position, normal, and texcoord data
	 *
	 * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
	 * @param {number} [width] Width of the plane. Default = 1
	 * @param {number} [depth] Depth of the plane. Default = 1
	 * @param {number} [subdivisionsWidth] Number of steps across the plane. Default = 1
	 * @param {number} [subdivisionsDepth] Number of steps down the plane. Default = 1
	 * @param {module:twgl/m4.Mat4} [matrix] A matrix by which to multiply all the vertices.
	 * @return {Object.<string, WebGLBuffer>} The created plane buffers.
	 * @memberOf module:twgl/primitives
	 * @function createPlaneBuffers
	 */

	/**
	 * Creates XZ plane vertices.
	 *
	 * The created plane has position, normal, and texcoord data
	 *
	 * @param {number} [width] Width of the plane. Default = 1
	 * @param {number} [depth] Depth of the plane. Default = 1
	 * @param {number} [subdivisionsWidth] Number of steps across the plane. Default = 1
	 * @param {number} [subdivisionsDepth] Number of steps down the plane. Default = 1
	 * @param {module:twgl/m4.Mat4} [matrix] A matrix by which to multiply all the vertices.
	 * @return {Object.<string, TypedArray>} The created plane vertices.
	 * @memberOf module:twgl/primitives
	 */
	function createPlaneVertices(
	    width,
	    depth,
	    subdivisionsWidth,
	    subdivisionsDepth,
	    matrix) {
	  width = width || 1;
	  depth = depth || 1;
	  subdivisionsWidth = subdivisionsWidth || 1;
	  subdivisionsDepth = subdivisionsDepth || 1;
	  matrix = matrix || identity();

	  const numVertices = (subdivisionsWidth + 1) * (subdivisionsDepth + 1);
	  const positions = createAugmentedTypedArray(3, numVertices);
	  const normals = createAugmentedTypedArray(3, numVertices);
	  const texcoords = createAugmentedTypedArray(2, numVertices);

	  for (let z = 0; z <= subdivisionsDepth; z++) {
	    for (let x = 0; x <= subdivisionsWidth; x++) {
	      const u = x / subdivisionsWidth;
	      const v = z / subdivisionsDepth;
	      positions.push(
	          width * u - width * 0.5,
	          0,
	          depth * v - depth * 0.5);
	      normals.push(0, 1, 0);
	      texcoords.push(u, v);
	    }
	  }

	  const numVertsAcross = subdivisionsWidth + 1;
	  const indices = createAugmentedTypedArray(
	      3, subdivisionsWidth * subdivisionsDepth * 2, Uint16Array);

	  for (let z = 0; z < subdivisionsDepth; z++) {  // eslint-disable-line
	    for (let x = 0; x < subdivisionsWidth; x++) {  // eslint-disable-line
	      // Make triangle 1 of quad.
	      indices.push(
	          (z + 0) * numVertsAcross + x,
	          (z + 1) * numVertsAcross + x,
	          (z + 0) * numVertsAcross + x + 1);

	      // Make triangle 2 of quad.
	      indices.push(
	          (z + 1) * numVertsAcross + x,
	          (z + 1) * numVertsAcross + x + 1,
	          (z + 0) * numVertsAcross + x + 1);
	    }
	  }

	  const arrays = reorientVertices({
	    position: positions,
	    normal: normals,
	    texcoord: texcoords,
	    indices: indices,
	  }, matrix);
	  return arrays;
	}

	/**
	 * Creates sphere BufferInfo.
	 *
	 * The created sphere has position, normal, and texcoord data
	 *
	 * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
	 * @param {number} radius radius of the sphere.
	 * @param {number} subdivisionsAxis number of steps around the sphere.
	 * @param {number} subdivisionsHeight number of vertically on the sphere.
	 * @param {number} [opt_startLatitudeInRadians] where to start the
	 *     top of the sphere. Default = 0.
	 * @param {number} [opt_endLatitudeInRadians] Where to end the
	 *     bottom of the sphere. Default = Math.PI.
	 * @param {number} [opt_startLongitudeInRadians] where to start
	 *     wrapping the sphere. Default = 0.
	 * @param {number} [opt_endLongitudeInRadians] where to end
	 *     wrapping the sphere. Default = 2 * Math.PI.
	 * @return {module:twgl.BufferInfo} The created sphere BufferInfo.
	 * @memberOf module:twgl/primitives
	 * @function createSphereBufferInfo
	 */

	/**
	 * Creates sphere buffers.
	 *
	 * The created sphere has position, normal, and texcoord data
	 *
	 * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
	 * @param {number} radius radius of the sphere.
	 * @param {number} subdivisionsAxis number of steps around the sphere.
	 * @param {number} subdivisionsHeight number of vertically on the sphere.
	 * @param {number} [opt_startLatitudeInRadians] where to start the
	 *     top of the sphere. Default = 0.
	 * @param {number} [opt_endLatitudeInRadians] Where to end the
	 *     bottom of the sphere. Default = Math.PI.
	 * @param {number} [opt_startLongitudeInRadians] where to start
	 *     wrapping the sphere. Default = 0.
	 * @param {number} [opt_endLongitudeInRadians] where to end
	 *     wrapping the sphere. Default = 2 * Math.PI.
	 * @return {Object.<string, WebGLBuffer>} The created sphere buffers.
	 * @memberOf module:twgl/primitives
	 * @function createSphereBuffers
	 */

	/**
	 * Creates sphere vertices.
	 *
	 * The created sphere has position, normal, and texcoord data
	 *
	 * @param {number} radius radius of the sphere.
	 * @param {number} subdivisionsAxis number of steps around the sphere.
	 * @param {number} subdivisionsHeight number of vertically on the sphere.
	 * @param {number} [opt_startLatitudeInRadians] where to start the
	 *     top of the sphere. Default = 0.
	 * @param {number} [opt_endLatitudeInRadians] Where to end the
	 *     bottom of the sphere. Default = Math.PI.
	 * @param {number} [opt_startLongitudeInRadians] where to start
	 *     wrapping the sphere. Default = 0.
	 * @param {number} [opt_endLongitudeInRadians] where to end
	 *     wrapping the sphere. Default = 2 * Math.PI.
	 * @return {Object.<string, TypedArray>} The created sphere vertices.
	 * @memberOf module:twgl/primitives
	 */
	function createSphereVertices(
	    radius,
	    subdivisionsAxis,
	    subdivisionsHeight,
	    opt_startLatitudeInRadians,
	    opt_endLatitudeInRadians,
	    opt_startLongitudeInRadians,
	    opt_endLongitudeInRadians) {
	  if (subdivisionsAxis <= 0 || subdivisionsHeight <= 0) {
	    throw new Error('subdivisionAxis and subdivisionHeight must be > 0');
	  }

	  opt_startLatitudeInRadians = opt_startLatitudeInRadians || 0;
	  opt_endLatitudeInRadians = opt_endLatitudeInRadians || Math.PI;
	  opt_startLongitudeInRadians = opt_startLongitudeInRadians || 0;
	  opt_endLongitudeInRadians = opt_endLongitudeInRadians || (Math.PI * 2);

	  const latRange = opt_endLatitudeInRadians - opt_startLatitudeInRadians;
	  const longRange = opt_endLongitudeInRadians - opt_startLongitudeInRadians;

	  // We are going to generate our sphere by iterating through its
	  // spherical coordinates and generating 2 triangles for each quad on a
	  // ring of the sphere.
	  const numVertices = (subdivisionsAxis + 1) * (subdivisionsHeight + 1);
	  const positions = createAugmentedTypedArray(3, numVertices);
	  const normals   = createAugmentedTypedArray(3, numVertices);
	  const texcoords = createAugmentedTypedArray(2 , numVertices);

	  // Generate the individual vertices in our vertex buffer.
	  for (let y = 0; y <= subdivisionsHeight; y++) {
	    for (let x = 0; x <= subdivisionsAxis; x++) {
	      // Generate a vertex based on its spherical coordinates
	      const u = x / subdivisionsAxis;
	      const v = y / subdivisionsHeight;
	      const theta = longRange * u + opt_startLongitudeInRadians;
	      const phi = latRange * v + opt_startLatitudeInRadians;
	      const sinTheta = Math.sin(theta);
	      const cosTheta = Math.cos(theta);
	      const sinPhi = Math.sin(phi);
	      const cosPhi = Math.cos(phi);
	      const ux = cosTheta * sinPhi;
	      const uy = cosPhi;
	      const uz = sinTheta * sinPhi;
	      positions.push(radius * ux, radius * uy, radius * uz);
	      normals.push(ux, uy, uz);
	      texcoords.push(1 - u, v);
	    }
	  }

	  const numVertsAround = subdivisionsAxis + 1;
	  const indices = createAugmentedTypedArray(3, subdivisionsAxis * subdivisionsHeight * 2, Uint16Array);
	  for (let x = 0; x < subdivisionsAxis; x++) {  // eslint-disable-line
	    for (let y = 0; y < subdivisionsHeight; y++) {  // eslint-disable-line
	      // Make triangle 1 of quad.
	      indices.push(
	          (y + 0) * numVertsAround + x,
	          (y + 0) * numVertsAround + x + 1,
	          (y + 1) * numVertsAround + x);

	      // Make triangle 2 of quad.
	      indices.push(
	          (y + 1) * numVertsAround + x,
	          (y + 0) * numVertsAround + x + 1,
	          (y + 1) * numVertsAround + x + 1);
	    }
	  }

	  return {
	    position: positions,
	    normal: normals,
	    texcoord: texcoords,
	    indices: indices,
	  };
	}

	/**
	 * Array of the indices of corners of each face of a cube.
	 * @type {Array.<number[]>}
	 * @private
	 */
	const CUBE_FACE_INDICES = [
	  [3, 7, 5, 1],  // right
	  [6, 2, 0, 4],  // left
	  [6, 7, 3, 2],  // ??
	  [0, 1, 5, 4],  // ??
	  [7, 6, 4, 5],  // front
	  [2, 3, 1, 0],  // back
	];

	/**
	 * Creates a BufferInfo for a cube.
	 *
	 * The cube is created around the origin. (-size / 2, size / 2).
	 *
	 * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
	 * @param {number} [size] width, height and depth of the cube.
	 * @return {module:twgl.BufferInfo} The created BufferInfo.
	 * @memberOf module:twgl/primitives
	 * @function createCubeBufferInfo
	 */

	/**
	 * Creates the buffers and indices for a cube.
	 *
	 * The cube is created around the origin. (-size / 2, size / 2).
	 *
	 * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
	 * @param {number} [size] width, height and depth of the cube.
	 * @return {Object.<string, WebGLBuffer>} The created buffers.
	 * @memberOf module:twgl/primitives
	 * @function createCubeBuffers
	 */

	/**
	 * Creates the vertices and indices for a cube.
	 *
	 * The cube is created around the origin. (-size / 2, size / 2).
	 *
	 * @param {number} [size] width, height and depth of the cube.
	 * @return {Object.<string, TypedArray>} The created vertices.
	 * @memberOf module:twgl/primitives
	 */
	function createCubeVertices(size) {
	  size = size || 1;
	  const k = size / 2;

	  const cornerVertices = [
	    [-k, -k, -k],
	    [+k, -k, -k],
	    [-k, +k, -k],
	    [+k, +k, -k],
	    [-k, -k, +k],
	    [+k, -k, +k],
	    [-k, +k, +k],
	    [+k, +k, +k],
	  ];

	  const faceNormals = [
	    [+1, +0, +0],
	    [-1, +0, +0],
	    [+0, +1, +0],
	    [+0, -1, +0],
	    [+0, +0, +1],
	    [+0, +0, -1],
	  ];

	  const uvCoords = [
	    [1, 0],
	    [0, 0],
	    [0, 1],
	    [1, 1],
	  ];

	  const numVertices = 6 * 4;
	  const positions = createAugmentedTypedArray(3, numVertices);
	  const normals   = createAugmentedTypedArray(3, numVertices);
	  const texcoords = createAugmentedTypedArray(2 , numVertices);
	  const indices   = createAugmentedTypedArray(3, 6 * 2, Uint16Array);

	  for (let f = 0; f < 6; ++f) {
	    const faceIndices = CUBE_FACE_INDICES[f];
	    for (let v = 0; v < 4; ++v) {
	      const position = cornerVertices[faceIndices[v]];
	      const normal = faceNormals[f];
	      const uv = uvCoords[v];

	      // Each face needs all four vertices because the normals and texture
	      // coordinates are not all the same.
	      positions.push(position);
	      normals.push(normal);
	      texcoords.push(uv);

	    }
	    // Two triangles make a square face.
	    const offset = 4 * f;
	    indices.push(offset + 0, offset + 1, offset + 2);
	    indices.push(offset + 0, offset + 2, offset + 3);
	  }

	  return {
	    position: positions,
	    normal: normals,
	    texcoord: texcoords,
	    indices: indices,
	  };
	}

	/**
	 * Creates a BufferInfo for a truncated cone, which is like a cylinder
	 * except that it has different top and bottom radii. A truncated cone
	 * can also be used to create cylinders and regular cones. The
	 * truncated cone will be created centered about the origin, with the
	 * y axis as its vertical axis.
	 *
	 * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
	 * @param {number} bottomRadius Bottom radius of truncated cone.
	 * @param {number} topRadius Top radius of truncated cone.
	 * @param {number} height Height of truncated cone.
	 * @param {number} radialSubdivisions The number of subdivisions around the
	 *     truncated cone.
	 * @param {number} verticalSubdivisions The number of subdivisions down the
	 *     truncated cone.
	 * @param {boolean} [opt_topCap] Create top cap. Default = true.
	 * @param {boolean} [opt_bottomCap] Create bottom cap. Default = true.
	 * @return {module:twgl.BufferInfo} The created cone BufferInfo.
	 * @memberOf module:twgl/primitives
	 * @function createTruncatedConeBufferInfo
	 */

	/**
	 * Creates buffers for a truncated cone, which is like a cylinder
	 * except that it has different top and bottom radii. A truncated cone
	 * can also be used to create cylinders and regular cones. The
	 * truncated cone will be created centered about the origin, with the
	 * y axis as its vertical axis.
	 *
	 * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
	 * @param {number} bottomRadius Bottom radius of truncated cone.
	 * @param {number} topRadius Top radius of truncated cone.
	 * @param {number} height Height of truncated cone.
	 * @param {number} radialSubdivisions The number of subdivisions around the
	 *     truncated cone.
	 * @param {number} verticalSubdivisions The number of subdivisions down the
	 *     truncated cone.
	 * @param {boolean} [opt_topCap] Create top cap. Default = true.
	 * @param {boolean} [opt_bottomCap] Create bottom cap. Default = true.
	 * @return {Object.<string, WebGLBuffer>} The created cone buffers.
	 * @memberOf module:twgl/primitives
	 * @function createTruncatedConeBuffers
	 */

	/**
	 * Creates vertices for a truncated cone, which is like a cylinder
	 * except that it has different top and bottom radii. A truncated cone
	 * can also be used to create cylinders and regular cones. The
	 * truncated cone will be created centered about the origin, with the
	 * y axis as its vertical axis. .
	 *
	 * @param {number} bottomRadius Bottom radius of truncated cone.
	 * @param {number} topRadius Top radius of truncated cone.
	 * @param {number} height Height of truncated cone.
	 * @param {number} radialSubdivisions The number of subdivisions around the
	 *     truncated cone.
	 * @param {number} verticalSubdivisions The number of subdivisions down the
	 *     truncated cone.
	 * @param {boolean} [opt_topCap] Create top cap. Default = true.
	 * @param {boolean} [opt_bottomCap] Create bottom cap. Default = true.
	 * @return {Object.<string, TypedArray>} The created cone vertices.
	 * @memberOf module:twgl/primitives
	 */
	function createTruncatedConeVertices(
	    bottomRadius,
	    topRadius,
	    height,
	    radialSubdivisions,
	    verticalSubdivisions,
	    opt_topCap,
	    opt_bottomCap) {
	  if (radialSubdivisions < 3) {
	    throw new Error('radialSubdivisions must be 3 or greater');
	  }

	  if (verticalSubdivisions < 1) {
	    throw new Error('verticalSubdivisions must be 1 or greater');
	  }

	  const topCap = (opt_topCap === undefined) ? true : opt_topCap;
	  const bottomCap = (opt_bottomCap === undefined) ? true : opt_bottomCap;

	  const extra = (topCap ? 2 : 0) + (bottomCap ? 2 : 0);

	  const numVertices = (radialSubdivisions + 1) * (verticalSubdivisions + 1 + extra);
	  const positions = createAugmentedTypedArray(3, numVertices);
	  const normals   = createAugmentedTypedArray(3, numVertices);
	  const texcoords = createAugmentedTypedArray(2, numVertices);
	  const indices   = createAugmentedTypedArray(3, radialSubdivisions * (verticalSubdivisions + extra) * 2, Uint16Array);

	  const vertsAroundEdge = radialSubdivisions + 1;

	  // The slant of the cone is constant across its surface
	  const slant = Math.atan2(bottomRadius - topRadius, height);
	  const cosSlant = Math.cos(slant);
	  const sinSlant = Math.sin(slant);

	  const start = topCap ? -2 : 0;
	  const end = verticalSubdivisions + (bottomCap ? 2 : 0);

	  for (let yy = start; yy <= end; ++yy) {
	    let v = yy / verticalSubdivisions;
	    let y = height * v;
	    let ringRadius;
	    if (yy < 0) {
	      y = 0;
	      v = 1;
	      ringRadius = bottomRadius;
	    } else if (yy > verticalSubdivisions) {
	      y = height;
	      v = 1;
	      ringRadius = topRadius;
	    } else {
	      ringRadius = bottomRadius +
	        (topRadius - bottomRadius) * (yy / verticalSubdivisions);
	    }
	    if (yy === -2 || yy === verticalSubdivisions + 2) {
	      ringRadius = 0;
	      v = 0;
	    }
	    y -= height / 2;
	    for (let ii = 0; ii < vertsAroundEdge; ++ii) {
	      const sin = Math.sin(ii * Math.PI * 2 / radialSubdivisions);
	      const cos = Math.cos(ii * Math.PI * 2 / radialSubdivisions);
	      positions.push(sin * ringRadius, y, cos * ringRadius);
	      if (yy < 0) {
	        normals.push(0, -1, 0);
	      } else if (yy > verticalSubdivisions) {
	        normals.push(0, 1, 0);
	      } else if (ringRadius === 0.0) {
	        normals.push(0, 0, 0);
	      } else {
	        normals.push(sin * cosSlant, sinSlant, cos * cosSlant);
	      }
	      texcoords.push((ii / radialSubdivisions), 1 - v);
	    }
	  }

	  for (let yy = 0; yy < verticalSubdivisions + extra; ++yy) {  // eslint-disable-line
	    for (let ii = 0; ii < radialSubdivisions; ++ii) {  // eslint-disable-line
	      indices.push(vertsAroundEdge * (yy + 0) + 0 + ii,
	                   vertsAroundEdge * (yy + 0) + 1 + ii,
	                   vertsAroundEdge * (yy + 1) + 1 + ii);
	      indices.push(vertsAroundEdge * (yy + 0) + 0 + ii,
	                   vertsAroundEdge * (yy + 1) + 1 + ii,
	                   vertsAroundEdge * (yy + 1) + 0 + ii);
	    }
	  }

	  return {
	    position: positions,
	    normal: normals,
	    texcoord: texcoords,
	    indices: indices,
	  };
	}

	/**
	 * Expands RLE data
	 * @param {number[]} rleData data in format of run-length, x, y, z, run-length, x, y, z
	 * @param {number[]} [padding] value to add each entry with.
	 * @return {number[]} the expanded rleData
	 * @private
	 */
	function expandRLEData(rleData, padding) {
	  padding = padding || [];
	  const data = [];
	  for (let ii = 0; ii < rleData.length; ii += 4) {
	    const runLength = rleData[ii];
	    const element = rleData.slice(ii + 1, ii + 4);
	    element.push.apply(element, padding);
	    for (let jj = 0; jj < runLength; ++jj) {
	      data.push.apply(data, element);
	    }
	  }
	  return data;
	}

	/**
	 * Creates 3D 'F' BufferInfo.
	 * An 'F' is useful because you can easily tell which way it is oriented.
	 * The created 'F' has position, normal, texcoord, and color buffers.
	 *
	 * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
	 * @return {module:twgl.BufferInfo} The created BufferInfo.
	 * @memberOf module:twgl/primitives
	 * @function create3DFBufferInfo
	 */

	/**
	 * Creates 3D 'F' buffers.
	 * An 'F' is useful because you can easily tell which way it is oriented.
	 * The created 'F' has position, normal, texcoord, and color buffers.
	 *
	 * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
	 * @return {Object.<string, WebGLBuffer>} The created buffers.
	 * @memberOf module:twgl/primitives
	 * @function create3DFBuffers
	 */

	/**
	 * Creates 3D 'F' vertices.
	 * An 'F' is useful because you can easily tell which way it is oriented.
	 * The created 'F' has position, normal, texcoord, and color arrays.
	 *
	 * @return {Object.<string, TypedArray>} The created vertices.
	 * @memberOf module:twgl/primitives
	 */
	function create3DFVertices() {

	  const positions = [
	    // left column front
	    0,   0,  0,
	    0, 150,  0,
	    30,   0,  0,
	    0, 150,  0,
	    30, 150,  0,
	    30,   0,  0,

	    // top rung front
	    30,   0,  0,
	    30,  30,  0,
	    100,   0,  0,
	    30,  30,  0,
	    100,  30,  0,
	    100,   0,  0,

	    // middle rung front
	    30,  60,  0,
	    30,  90,  0,
	    67,  60,  0,
	    30,  90,  0,
	    67,  90,  0,
	    67,  60,  0,

	    // left column back
	      0,   0,  30,
	     30,   0,  30,
	      0, 150,  30,
	      0, 150,  30,
	     30,   0,  30,
	     30, 150,  30,

	    // top rung back
	     30,   0,  30,
	    100,   0,  30,
	     30,  30,  30,
	     30,  30,  30,
	    100,   0,  30,
	    100,  30,  30,

	    // middle rung back
	     30,  60,  30,
	     67,  60,  30,
	     30,  90,  30,
	     30,  90,  30,
	     67,  60,  30,
	     67,  90,  30,

	    // top
	      0,   0,   0,
	    100,   0,   0,
	    100,   0,  30,
	      0,   0,   0,
	    100,   0,  30,
	      0,   0,  30,

	    // top rung front
	    100,   0,   0,
	    100,  30,   0,
	    100,  30,  30,
	    100,   0,   0,
	    100,  30,  30,
	    100,   0,  30,

	    // under top rung
	    30,   30,   0,
	    30,   30,  30,
	    100,  30,  30,
	    30,   30,   0,
	    100,  30,  30,
	    100,  30,   0,

	    // between top rung and middle
	    30,   30,   0,
	    30,   60,  30,
	    30,   30,  30,
	    30,   30,   0,
	    30,   60,   0,
	    30,   60,  30,

	    // top of middle rung
	    30,   60,   0,
	    67,   60,  30,
	    30,   60,  30,
	    30,   60,   0,
	    67,   60,   0,
	    67,   60,  30,

	    // front of middle rung
	    67,   60,   0,
	    67,   90,  30,
	    67,   60,  30,
	    67,   60,   0,
	    67,   90,   0,
	    67,   90,  30,

	    // bottom of middle rung.
	    30,   90,   0,
	    30,   90,  30,
	    67,   90,  30,
	    30,   90,   0,
	    67,   90,  30,
	    67,   90,   0,

	    // front of bottom
	    30,   90,   0,
	    30,  150,  30,
	    30,   90,  30,
	    30,   90,   0,
	    30,  150,   0,
	    30,  150,  30,

	    // bottom
	    0,   150,   0,
	    0,   150,  30,
	    30,  150,  30,
	    0,   150,   0,
	    30,  150,  30,
	    30,  150,   0,

	    // left side
	    0,   0,   0,
	    0,   0,  30,
	    0, 150,  30,
	    0,   0,   0,
	    0, 150,  30,
	    0, 150,   0,
	  ];

	  const texcoords = [
	    // left column front
	    0.22, 0.19,
	    0.22, 0.79,
	    0.34, 0.19,
	    0.22, 0.79,
	    0.34, 0.79,
	    0.34, 0.19,

	    // top rung front
	    0.34, 0.19,
	    0.34, 0.31,
	    0.62, 0.19,
	    0.34, 0.31,
	    0.62, 0.31,
	    0.62, 0.19,

	    // middle rung front
	    0.34, 0.43,
	    0.34, 0.55,
	    0.49, 0.43,
	    0.34, 0.55,
	    0.49, 0.55,
	    0.49, 0.43,

	    // left column back
	    0, 0,
	    1, 0,
	    0, 1,
	    0, 1,
	    1, 0,
	    1, 1,

	    // top rung back
	    0, 0,
	    1, 0,
	    0, 1,
	    0, 1,
	    1, 0,
	    1, 1,

	    // middle rung back
	    0, 0,
	    1, 0,
	    0, 1,
	    0, 1,
	    1, 0,
	    1, 1,

	    // top
	    0, 0,
	    1, 0,
	    1, 1,
	    0, 0,
	    1, 1,
	    0, 1,

	    // top rung front
	    0, 0,
	    1, 0,
	    1, 1,
	    0, 0,
	    1, 1,
	    0, 1,

	    // under top rung
	    0, 0,
	    0, 1,
	    1, 1,
	    0, 0,
	    1, 1,
	    1, 0,

	    // between top rung and middle
	    0, 0,
	    1, 1,
	    0, 1,
	    0, 0,
	    1, 0,
	    1, 1,

	    // top of middle rung
	    0, 0,
	    1, 1,
	    0, 1,
	    0, 0,
	    1, 0,
	    1, 1,

	    // front of middle rung
	    0, 0,
	    1, 1,
	    0, 1,
	    0, 0,
	    1, 0,
	    1, 1,

	    // bottom of middle rung.
	    0, 0,
	    0, 1,
	    1, 1,
	    0, 0,
	    1, 1,
	    1, 0,

	    // front of bottom
	    0, 0,
	    1, 1,
	    0, 1,
	    0, 0,
	    1, 0,
	    1, 1,

	    // bottom
	    0, 0,
	    0, 1,
	    1, 1,
	    0, 0,
	    1, 1,
	    1, 0,

	    // left side
	    0, 0,
	    0, 1,
	    1, 1,
	    0, 0,
	    1, 1,
	    1, 0,
	  ];

	  const normals = expandRLEData([
	    // left column front
	    // top rung front
	    // middle rung front
	    18, 0, 0, 1,

	    // left column back
	    // top rung back
	    // middle rung back
	    18, 0, 0, -1,

	    // top
	    6, 0, 1, 0,

	    // top rung front
	    6, 1, 0, 0,

	    // under top rung
	    6, 0, -1, 0,

	    // between top rung and middle
	    6, 1, 0, 0,

	    // top of middle rung
	    6, 0, 1, 0,

	    // front of middle rung
	    6, 1, 0, 0,

	    // bottom of middle rung.
	    6, 0, -1, 0,

	    // front of bottom
	    6, 1, 0, 0,

	    // bottom
	    6, 0, -1, 0,

	    // left side
	    6, -1, 0, 0,
	  ]);

	  const colors = expandRLEData([
	        // left column front
	        // top rung front
	        // middle rung front
	      18, 200,  70, 120,

	        // left column back
	        // top rung back
	        // middle rung back
	      18, 80, 70, 200,

	        // top
	      6, 70, 200, 210,

	        // top rung front
	      6, 200, 200, 70,

	        // under top rung
	      6, 210, 100, 70,

	        // between top rung and middle
	      6, 210, 160, 70,

	        // top of middle rung
	      6, 70, 180, 210,

	        // front of middle rung
	      6, 100, 70, 210,

	        // bottom of middle rung.
	      6, 76, 210, 100,

	        // front of bottom
	      6, 140, 210, 80,

	        // bottom
	      6, 90, 130, 110,

	        // left side
	      6, 160, 160, 220,
	  ], [255]);

	  const numVerts = positions.length / 3;

	  const arrays = {
	    position: createAugmentedTypedArray(3, numVerts),
	    texcoord: createAugmentedTypedArray(2,  numVerts),
	    normal: createAugmentedTypedArray(3, numVerts),
	    color: createAugmentedTypedArray(4, numVerts, Uint8Array),
	    indices: createAugmentedTypedArray(3, numVerts / 3, Uint16Array),
	  };

	  arrays.position.push(positions);
	  arrays.texcoord.push(texcoords);
	  arrays.normal.push(normals);
	  arrays.color.push(colors);

	  for (let ii = 0; ii < numVerts; ++ii) {
	    arrays.indices.push(ii);
	  }

	  return arrays;
	}

	/**
	 * Creates crescent BufferInfo.
	 *
	 * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
	 * @param {number} verticalRadius The vertical radius of the crescent.
	 * @param {number} outerRadius The outer radius of the crescent.
	 * @param {number} innerRadius The inner radius of the crescent.
	 * @param {number} thickness The thickness of the crescent.
	 * @param {number} subdivisionsDown number of steps around the crescent.
	 * @param {number} [startOffset] Where to start arc. Default 0.
	 * @param {number} [endOffset] Where to end arg. Default 1.
	 * @return {module:twgl.BufferInfo} The created BufferInfo.
	 * @memberOf module:twgl/primitives
	 * @function createCresentBufferInfo
	 */

	/**
	 * Creates crescent buffers.
	 *
	 * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
	 * @param {number} verticalRadius The vertical radius of the crescent.
	 * @param {number} outerRadius The outer radius of the crescent.
	 * @param {number} innerRadius The inner radius of the crescent.
	 * @param {number} thickness The thickness of the crescent.
	 * @param {number} subdivisionsDown number of steps around the crescent.
	 * @param {number} [startOffset] Where to start arc. Default 0.
	 * @param {number} [endOffset] Where to end arg. Default 1.
	 * @return {Object.<string, WebGLBuffer>} The created buffers.
	 * @memberOf module:twgl/primitives
	 * @function createCresentBuffers
	 */

	/**
	 * Creates crescent vertices.
	 *
	 * @param {number} verticalRadius The vertical radius of the crescent.
	 * @param {number} outerRadius The outer radius of the crescent.
	 * @param {number} innerRadius The inner radius of the crescent.
	 * @param {number} thickness The thickness of the crescent.
	 * @param {number} subdivisionsDown number of steps around the crescent.
	 * @param {number} [startOffset] Where to start arc. Default 0.
	 * @param {number} [endOffset] Where to end arg. Default 1.
	 * @return {Object.<string, TypedArray>} The created vertices.
	 * @memberOf module:twgl/primitives
	 * @function createCresentBuffers
	 */

	/**
	 * Creates crescent BufferInfo.
	 *
	 * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
	 * @param {number} verticalRadius The vertical radius of the crescent.
	 * @param {number} outerRadius The outer radius of the crescent.
	 * @param {number} innerRadius The inner radius of the crescent.
	 * @param {number} thickness The thickness of the crescent.
	 * @param {number} subdivisionsDown number of steps around the crescent.
	 * @param {number} [startOffset] Where to start arc. Default 0.
	 * @param {number} [endOffset] Where to end arg. Default 1.
	 * @return {module:twgl.BufferInfo} The created BufferInfo.
	 * @memberOf module:twgl/primitives
	 * @function createCrescentBufferInfo
	 */

	/**
	 * Creates crescent buffers.
	 *
	 * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
	 * @param {number} verticalRadius The vertical radius of the crescent.
	 * @param {number} outerRadius The outer radius of the crescent.
	 * @param {number} innerRadius The inner radius of the crescent.
	 * @param {number} thickness The thickness of the crescent.
	 * @param {number} subdivisionsDown number of steps around the crescent.
	 * @param {number} [startOffset] Where to start arc. Default 0.
	 * @param {number} [endOffset] Where to end arg. Default 1.
	 * @return {Object.<string, WebGLBuffer>} The created buffers.
	 * @memberOf module:twgl/primitives
	 * @function createCrescentBuffers
	 */

	/**
	 * Creates crescent vertices.
	 *
	 * @param {number} verticalRadius The vertical radius of the crescent.
	 * @param {number} outerRadius The outer radius of the crescent.
	 * @param {number} innerRadius The inner radius of the crescent.
	 * @param {number} thickness The thickness of the crescent.
	 * @param {number} subdivisionsDown number of steps around the crescent.
	 * @param {number} [startOffset] Where to start arc. Default 0.
	 * @param {number} [endOffset] Where to end arg. Default 1.
	 * @return {Object.<string, TypedArray>} The created vertices.
	 * @memberOf module:twgl/primitives
	 */
	 function createCrescentVertices(
	    verticalRadius,
	    outerRadius,
	    innerRadius,
	    thickness,
	    subdivisionsDown,
	    startOffset,
	    endOffset) {
	  if (subdivisionsDown <= 0) {
	    throw new Error('subdivisionDown must be > 0');
	  }

	  startOffset = startOffset || 0;
	  endOffset   = endOffset || 1;

	  const subdivisionsThick = 2;

	  const offsetRange = endOffset - startOffset;
	  const numVertices = (subdivisionsDown + 1) * 2 * (2 + subdivisionsThick);
	  const positions   = createAugmentedTypedArray(3, numVertices);
	  const normals     = createAugmentedTypedArray(3, numVertices);
	  const texcoords   = createAugmentedTypedArray(2, numVertices);

	  function lerp(a, b, s) {
	    return a + (b - a) * s;
	  }

	  function createArc(arcRadius, x, normalMult, normalAdd, uMult, uAdd) {
	    for (let z = 0; z <= subdivisionsDown; z++) {
	      const uBack = x / (subdivisionsThick - 1);
	      const v = z / subdivisionsDown;
	      const xBack = (uBack - 0.5) * 2;
	      const angle = (startOffset + (v * offsetRange)) * Math.PI;
	      const s = Math.sin(angle);
	      const c = Math.cos(angle);
	      const radius = lerp(verticalRadius, arcRadius, s);
	      const px = xBack * thickness;
	      const py = c * verticalRadius;
	      const pz = s * radius;
	      positions.push(px, py, pz);
	      const n = add(multiply([0, s, c], normalMult), normalAdd);
	      normals.push(n);
	      texcoords.push(uBack * uMult + uAdd, v);
	    }
	  }

	  // Generate the individual vertices in our vertex buffer.
	  for (let x = 0; x < subdivisionsThick; x++) {
	    const uBack = (x / (subdivisionsThick - 1) - 0.5) * 2;
	    createArc(outerRadius, x, [1, 1, 1], [0,     0, 0], 1, 0);
	    createArc(outerRadius, x, [0, 0, 0], [uBack, 0, 0], 0, 0);
	    createArc(innerRadius, x, [1, 1, 1], [0,     0, 0], 1, 0);
	    createArc(innerRadius, x, [0, 0, 0], [uBack, 0, 0], 0, 1);
	  }

	  // Do outer surface.
	  const indices = createAugmentedTypedArray(3, (subdivisionsDown * 2) * (2 + subdivisionsThick), Uint16Array);

	  function createSurface(leftArcOffset, rightArcOffset) {
	    for (let z = 0; z < subdivisionsDown; ++z) {
	      // Make triangle 1 of quad.
	      indices.push(
	          leftArcOffset + z + 0,
	          leftArcOffset + z + 1,
	          rightArcOffset + z + 0);

	      // Make triangle 2 of quad.
	      indices.push(
	          leftArcOffset + z + 1,
	          rightArcOffset + z + 1,
	          rightArcOffset + z + 0);
	    }
	  }

	  const numVerticesDown = subdivisionsDown + 1;
	  // front
	  createSurface(numVerticesDown * 0, numVerticesDown * 4);
	  // right
	  createSurface(numVerticesDown * 5, numVerticesDown * 7);
	  // back
	  createSurface(numVerticesDown * 6, numVerticesDown * 2);
	  // left
	  createSurface(numVerticesDown * 3, numVerticesDown * 1);

	  return {
	    position: positions,
	    normal:   normals,
	    texcoord: texcoords,
	    indices:  indices,
	  };
	}

	/**
	 * Creates cylinder BufferInfo. The cylinder will be created around the origin
	 * along the y-axis.
	 *
	 * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
	 * @param {number} radius Radius of cylinder.
	 * @param {number} height Height of cylinder.
	 * @param {number} radialSubdivisions The number of subdivisions around the cylinder.
	 * @param {number} verticalSubdivisions The number of subdivisions down the cylinder.
	 * @param {boolean} [topCap] Create top cap. Default = true.
	 * @param {boolean} [bottomCap] Create bottom cap. Default = true.
	 * @return {module:twgl.BufferInfo} The created BufferInfo.
	 * @memberOf module:twgl/primitives
	 * @function createCylinderBufferInfo
	 */

	 /**
	  * Creates cylinder buffers. The cylinder will be created around the origin
	  * along the y-axis.
	  *
	  * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
	  * @param {number} radius Radius of cylinder.
	  * @param {number} height Height of cylinder.
	  * @param {number} radialSubdivisions The number of subdivisions around the cylinder.
	  * @param {number} verticalSubdivisions The number of subdivisions down the cylinder.
	  * @param {boolean} [topCap] Create top cap. Default = true.
	  * @param {boolean} [bottomCap] Create bottom cap. Default = true.
	  * @return {Object.<string, WebGLBuffer>} The created buffers.
	  * @memberOf module:twgl/primitives
	  * @function createCylinderBuffers
	  */

	 /**
	  * Creates cylinder vertices. The cylinder will be created around the origin
	  * along the y-axis.
	  *
	  * @param {number} radius Radius of cylinder.
	  * @param {number} height Height of cylinder.
	  * @param {number} radialSubdivisions The number of subdivisions around the cylinder.
	  * @param {number} verticalSubdivisions The number of subdivisions down the cylinder.
	  * @param {boolean} [topCap] Create top cap. Default = true.
	  * @param {boolean} [bottomCap] Create bottom cap. Default = true.
	  * @return {Object.<string, TypedArray>} The created vertices.
	  * @memberOf module:twgl/primitives
	  */
	function createCylinderVertices(
	    radius,
	    height,
	    radialSubdivisions,
	    verticalSubdivisions,
	    topCap,
	    bottomCap) {
	  return createTruncatedConeVertices(
	      radius,
	      radius,
	      height,
	      radialSubdivisions,
	      verticalSubdivisions,
	      topCap,
	      bottomCap);
	}

	/**
	 * Creates BufferInfo for a torus
	 *
	 * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
	 * @param {number} radius radius of center of torus circle.
	 * @param {number} thickness radius of torus ring.
	 * @param {number} radialSubdivisions The number of subdivisions around the torus.
	 * @param {number} bodySubdivisions The number of subdivisions around the body torus.
	 * @param {boolean} [startAngle] start angle in radians. Default = 0.
	 * @param {boolean} [endAngle] end angle in radians. Default = Math.PI * 2.
	 * @return {module:twgl.BufferInfo} The created BufferInfo.
	 * @memberOf module:twgl/primitives
	 * @function createTorusBufferInfo
	 */

	/**
	 * Creates buffers for a torus
	 *
	 * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
	 * @param {number} radius radius of center of torus circle.
	 * @param {number} thickness radius of torus ring.
	 * @param {number} radialSubdivisions The number of subdivisions around the torus.
	 * @param {number} bodySubdivisions The number of subdivisions around the body torus.
	 * @param {boolean} [startAngle] start angle in radians. Default = 0.
	 * @param {boolean} [endAngle] end angle in radians. Default = Math.PI * 2.
	 * @return {Object.<string, WebGLBuffer>} The created buffers.
	 * @memberOf module:twgl/primitives
	 * @function createTorusBuffers
	 */

	/**
	 * Creates vertices for a torus
	 *
	 * @param {number} radius radius of center of torus circle.
	 * @param {number} thickness radius of torus ring.
	 * @param {number} radialSubdivisions The number of subdivisions around the torus.
	 * @param {number} bodySubdivisions The number of subdivisions around the body torus.
	 * @param {boolean} [startAngle] start angle in radians. Default = 0.
	 * @param {boolean} [endAngle] end angle in radians. Default = Math.PI * 2.
	 * @return {Object.<string, TypedArray>} The created vertices.
	 * @memberOf module:twgl/primitives
	 */
	function createTorusVertices(
	    radius,
	    thickness,
	    radialSubdivisions,
	    bodySubdivisions,
	    startAngle,
	    endAngle) {
	  if (radialSubdivisions < 3) {
	    throw new Error('radialSubdivisions must be 3 or greater');
	  }

	  if (bodySubdivisions < 3) {
	    throw new Error('verticalSubdivisions must be 3 or greater');
	  }

	  startAngle = startAngle || 0;
	  endAngle = endAngle || Math.PI * 2;
	  const range = endAngle - startAngle;

	  const radialParts = radialSubdivisions + 1;
	  const bodyParts   = bodySubdivisions + 1;
	  const numVertices = radialParts * bodyParts;
	  const positions   = createAugmentedTypedArray(3, numVertices);
	  const normals     = createAugmentedTypedArray(3, numVertices);
	  const texcoords   = createAugmentedTypedArray(2, numVertices);
	  const indices     = createAugmentedTypedArray(3, (radialSubdivisions) * (bodySubdivisions) * 2, Uint16Array);

	  for (let slice = 0; slice < bodyParts; ++slice) {
	    const v = slice / bodySubdivisions;
	    const sliceAngle = v * Math.PI * 2;
	    const sliceSin = Math.sin(sliceAngle);
	    const ringRadius = radius + sliceSin * thickness;
	    const ny = Math.cos(sliceAngle);
	    const y = ny * thickness;
	    for (let ring = 0; ring < radialParts; ++ring) {
	      const u = ring / radialSubdivisions;
	      const ringAngle = startAngle + u * range;
	      const xSin = Math.sin(ringAngle);
	      const zCos = Math.cos(ringAngle);
	      const x = xSin * ringRadius;
	      const z = zCos * ringRadius;
	      const nx = xSin * sliceSin;
	      const nz = zCos * sliceSin;
	      positions.push(x, y, z);
	      normals.push(nx, ny, nz);
	      texcoords.push(u, 1 - v);
	    }
	  }

	  for (let slice = 0; slice < bodySubdivisions; ++slice) {  // eslint-disable-line
	    for (let ring = 0; ring < radialSubdivisions; ++ring) {  // eslint-disable-line
	      const nextRingIndex  = 1 + ring;
	      const nextSliceIndex = 1 + slice;
	      indices.push(radialParts * slice          + ring,
	                   radialParts * nextSliceIndex + ring,
	                   radialParts * slice          + nextRingIndex);
	      indices.push(radialParts * nextSliceIndex + ring,
	                   radialParts * nextSliceIndex + nextRingIndex,
	                   radialParts * slice          + nextRingIndex);
	    }
	  }

	  return {
	    position: positions,
	    normal:   normals,
	    texcoord: texcoords,
	    indices:  indices,
	  };
	}


	/**
	 * Creates a disc BufferInfo. The disc will be in the xz plane, centered at
	 * the origin. When creating, at least 3 divisions, or pie
	 * pieces, need to be specified, otherwise the triangles making
	 * up the disc will be degenerate. You can also specify the
	 * number of radial pieces `stacks`. A value of 1 for
	 * stacks will give you a simple disc of pie pieces.  If you
	 * want to create an annulus you can set `innerRadius` to a
	 * value > 0. Finally, `stackPower` allows you to have the widths
	 * increase or decrease as you move away from the center. This
	 * is particularly useful when using the disc as a ground plane
	 * with a fixed camera such that you don't need the resolution
	 * of small triangles near the perimeter. For example, a value
	 * of 2 will produce stacks whose outside radius increases with
	 * the square of the stack index. A value of 1 will give uniform
	 * stacks.
	 *
	 * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
	 * @param {number} radius Radius of the ground plane.
	 * @param {number} divisions Number of triangles in the ground plane (at least 3).
	 * @param {number} [stacks] Number of radial divisions (default=1).
	 * @param {number} [innerRadius] Default 0.
	 * @param {number} [stackPower] Power to raise stack size to for decreasing width.
	 * @return {module:twgl.BufferInfo} The created BufferInfo.
	 * @memberOf module:twgl/primitives
	 * @function createDiscBufferInfo
	 */

	/**
	 * Creates disc buffers. The disc will be in the xz plane, centered at
	 * the origin. When creating, at least 3 divisions, or pie
	 * pieces, need to be specified, otherwise the triangles making
	 * up the disc will be degenerate. You can also specify the
	 * number of radial pieces `stacks`. A value of 1 for
	 * stacks will give you a simple disc of pie pieces.  If you
	 * want to create an annulus you can set `innerRadius` to a
	 * value > 0. Finally, `stackPower` allows you to have the widths
	 * increase or decrease as you move away from the center. This
	 * is particularly useful when using the disc as a ground plane
	 * with a fixed camera such that you don't need the resolution
	 * of small triangles near the perimeter. For example, a value
	 * of 2 will produce stacks whose outside radius increases with
	 * the square of the stack index. A value of 1 will give uniform
	 * stacks.
	 *
	 * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
	 * @param {number} radius Radius of the ground plane.
	 * @param {number} divisions Number of triangles in the ground plane (at least 3).
	 * @param {number} [stacks] Number of radial divisions (default=1).
	 * @param {number} [innerRadius] Default 0.
	 * @param {number} [stackPower] Power to raise stack size to for decreasing width.
	 * @return {Object.<string, WebGLBuffer>} The created buffers.
	 * @memberOf module:twgl/primitives
	 * @function createDiscBuffers
	 */

	/**
	 * Creates disc vertices. The disc will be in the xz plane, centered at
	 * the origin. When creating, at least 3 divisions, or pie
	 * pieces, need to be specified, otherwise the triangles making
	 * up the disc will be degenerate. You can also specify the
	 * number of radial pieces `stacks`. A value of 1 for
	 * stacks will give you a simple disc of pie pieces.  If you
	 * want to create an annulus you can set `innerRadius` to a
	 * value > 0. Finally, `stackPower` allows you to have the widths
	 * increase or decrease as you move away from the center. This
	 * is particularly useful when using the disc as a ground plane
	 * with a fixed camera such that you don't need the resolution
	 * of small triangles near the perimeter. For example, a value
	 * of 2 will produce stacks whose outside radius increases with
	 * the square of the stack index. A value of 1 will give uniform
	 * stacks.
	 *
	 * @param {number} radius Radius of the ground plane.
	 * @param {number} divisions Number of triangles in the ground plane (at least 3).
	 * @param {number} [stacks] Number of radial divisions (default=1).
	 * @param {number} [innerRadius] Default 0.
	 * @param {number} [stackPower] Power to raise stack size to for decreasing width.
	 * @return {Object.<string, TypedArray>} The created vertices.
	 * @memberOf module:twgl/primitives
	 */
	function createDiscVertices(
	    radius,
	    divisions,
	    stacks,
	    innerRadius,
	    stackPower) {
	  if (divisions < 3) {
	    throw new Error('divisions must be at least 3');
	  }

	  stacks = stacks ? stacks : 1;
	  stackPower = stackPower ? stackPower : 1;
	  innerRadius = innerRadius ? innerRadius : 0;

	  // Note: We don't share the center vertex because that would
	  // mess up texture coordinates.
	  const numVertices = (divisions + 1) * (stacks + 1);

	  const positions = createAugmentedTypedArray(3, numVertices);
	  const normals   = createAugmentedTypedArray(3, numVertices);
	  const texcoords = createAugmentedTypedArray(2, numVertices);
	  const indices   = createAugmentedTypedArray(3, stacks * divisions * 2, Uint16Array);

	  let firstIndex = 0;
	  const radiusSpan = radius - innerRadius;
	  const pointsPerStack = divisions + 1;

	  // Build the disk one stack at a time.
	  for (let stack = 0; stack <= stacks; ++stack) {
	    const stackRadius = innerRadius + radiusSpan * Math.pow(stack / stacks, stackPower);

	    for (let i = 0; i <= divisions; ++i) {
	      const theta = 2.0 * Math.PI * i / divisions;
	      const x = stackRadius * Math.cos(theta);
	      const z = stackRadius * Math.sin(theta);

	      positions.push(x, 0, z);
	      normals.push(0, 1, 0);
	      texcoords.push(1 - (i / divisions), stack / stacks);
	      if (stack > 0 && i !== divisions) {
	        // a, b, c and d are the indices of the vertices of a quad.  unless
	        // the current stack is the one closest to the center, in which case
	        // the vertices a and b connect to the center vertex.
	        const a = firstIndex + (i + 1);
	        const b = firstIndex + i;
	        const c = firstIndex + i - pointsPerStack;
	        const d = firstIndex + (i + 1) - pointsPerStack;

	        // Make a quad of the vertices a, b, c, d.
	        indices.push(a, b, c);
	        indices.push(a, c, d);
	      }
	    }

	    firstIndex += divisions + 1;
	  }

	  return {
	    position: positions,
	    normal: normals,
	    texcoord: texcoords,
	    indices: indices,
	  };
	}

	/**
	 * creates a random integer between 0 and range - 1 inclusive.
	 * @param {number} range
	 * @return {number} random value between 0 and range - 1 inclusive.
	 * @private
	 */
	function randInt(range) {
	  return Math.random() * range | 0;
	}

	/**
	 * Used to supply random colors
	 * @callback RandomColorFunc
	 * @param {number} ndx index of triangle/quad if unindexed or index of vertex if indexed
	 * @param {number} channel 0 = red, 1 = green, 2 = blue, 3 = alpha
	 * @return {number} a number from 0 to 255
	 * @memberOf module:twgl/primitives
	 */

	/**
	 * @typedef {Object} RandomVerticesOptions
	 * @property {number} [vertsPerColor] Defaults to 3 for non-indexed vertices
	 * @property {module:twgl/primitives.RandomColorFunc} [rand] A function to generate random numbers
	 * @memberOf module:twgl/primitives
	 */

	/**
	 * Creates an augmentedTypedArray of random vertex colors.
	 * If the vertices are indexed (have an indices array) then will
	 * just make random colors. Otherwise assumes they are triangles
	 * and makes one random color for every 3 vertices.
	 * @param {Object.<string, AugmentedTypedArray>} vertices Vertices as returned from one of the createXXXVertices functions.
	 * @param {module:twgl/primitives.RandomVerticesOptions} [options] options.
	 * @return {Object.<string, AugmentedTypedArray>} same vertices as passed in with `color` added.
	 * @memberOf module:twgl/primitives
	 */
	function makeRandomVertexColors(vertices, options) {
	  options = options || {};
	  const numElements = vertices.position.numElements;
	  const vColors = createAugmentedTypedArray(4, numElements, Uint8Array);
	  const rand = options.rand || function(ndx, channel) {
	    return channel < 3 ? randInt(256) : 255;
	  };
	  vertices.color = vColors;
	  if (vertices.indices) {
	    // just make random colors if index
	    for (let ii = 0; ii < numElements; ++ii) {
	      vColors.push(rand(ii, 0), rand(ii, 1), rand(ii, 2), rand(ii, 3));
	    }
	  } else {
	    // make random colors per triangle
	    const numVertsPerColor = options.vertsPerColor || 3;
	    const numSets = numElements / numVertsPerColor;
	    for (let ii = 0; ii < numSets; ++ii) {  // eslint-disable-line
	      const color = [rand(ii, 0), rand(ii, 1), rand(ii, 2), rand(ii, 3)];
	      for (let jj = 0; jj < numVertsPerColor; ++jj) {
	        vColors.push(color);
	      }
	    }
	  }
	  return vertices;
	}

	/**
	 * creates a function that calls fn to create vertices and then
	 * creates a buffers for them
	 * @private
	 */
	function createBufferFunc(fn) {
	  return function(gl) {
	    const arrays = fn.apply(this, Array.prototype.slice.call(arguments, 1));
	    return createBuffersFromArrays(gl, arrays);
	  };
	}

	/**
	 * creates a function that calls fn to create vertices and then
	 * creates a bufferInfo object for them
	 * @private
	 */
	function createBufferInfoFunc(fn) {
	  return function(gl) {
	    const arrays = fn.apply(null,  Array.prototype.slice.call(arguments, 1));
	    return createBufferInfoFromArrays(gl, arrays);
	  };
	}

	const arraySpecPropertyNames = [
	  "numComponents",
	  "size",
	  "type",
	  "normalize",
	  "stride",
	  "offset",
	  "attrib",
	  "name",
	  "attribName",
	];

	/**
	 * Copy elements from one array to another
	 *
	 * @param {Array|TypedArray} src source array
	 * @param {Array|TypedArray} dst dest array
	 * @param {number} dstNdx index in dest to copy src
	 * @param {number} [offset] offset to add to copied values
	 * @private
	 */
	function copyElements(src, dst, dstNdx, offset) {
	  offset = offset || 0;
	  const length = src.length;
	  for (let ii = 0; ii < length; ++ii) {
	    dst[dstNdx + ii] = src[ii] + offset;
	  }
	}

	/**
	 * Creates an array of the same time
	 *
	 * @param {(number[]|ArrayBufferView|module:twgl.FullArraySpec)} srcArray array who's type to copy
	 * @param {number} length size of new array
	 * @return {(number[]|ArrayBufferView|module:twgl.FullArraySpec)} array with same type as srcArray
	 * @private
	 */
	function createArrayOfSameType(srcArray, length) {
	  const arraySrc = getArray$1(srcArray);
	  const newArray = new arraySrc.constructor(length);
	  let newArraySpec = newArray;
	  // If it appears to have been augmented make new one augmented
	  if (arraySrc.numComponents && arraySrc.numElements) {
	    augmentTypedArray(newArray, arraySrc.numComponents);
	  }
	  // If it was a full spec make new one a full spec
	  if (srcArray.data) {
	    newArraySpec = {
	      data: newArray,
	    };
	    copyNamedProperties(arraySpecPropertyNames, srcArray, newArraySpec);
	  }
	  return newArraySpec;
	}

	/**
	 * Concatenates sets of vertices
	 *
	 * Assumes the vertices match in composition. For example
	 * if one set of vertices has positions, normals, and indices
	 * all sets of vertices must have positions, normals, and indices
	 * and of the same type.
	 *
	 * Example:
	 *
	 *      const cubeVertices = twgl.primitives.createCubeVertices(2);
	 *      const sphereVertices = twgl.primitives.createSphereVertices(1, 10, 10);
	 *      // move the sphere 2 units up
	 *      twgl.primitives.reorientVertices(
	 *          sphereVertices, twgl.m4.translation([0, 2, 0]));
	 *      // merge the sphere with the cube
	 *      const cubeSphereVertices = twgl.primitives.concatVertices(
	 *          [cubeVertices, sphereVertices]);
	 *      // turn them into WebGL buffers and attrib data
	 *      const bufferInfo = twgl.createBufferInfoFromArrays(gl, cubeSphereVertices);
	 *
	 * @param {module:twgl.Arrays[]} arrays Array of arrays of vertices
	 * @return {module:twgl.Arrays} The concatenated vertices.
	 * @memberOf module:twgl/primitives
	 */
	function concatVertices(arrayOfArrays) {
	  const names = {};
	  let baseName;
	  // get names of all arrays.
	  // and numElements for each set of vertices
	  for (let ii = 0; ii < arrayOfArrays.length; ++ii) {
	    const arrays = arrayOfArrays[ii];
	    Object.keys(arrays).forEach(function(name) {  // eslint-disable-line
	      if (!names[name]) {
	        names[name] = [];
	      }
	      if (!baseName && name !== 'indices') {
	        baseName = name;
	      }
	      const arrayInfo = arrays[name];
	      const numComponents = getNumComponents$1(arrayInfo, name);
	      const array = getArray$1(arrayInfo);
	      const numElements = array.length / numComponents;
	      names[name].push(numElements);
	    });
	  }

	  // compute length of combined array
	  // and return one for reference
	  function getLengthOfCombinedArrays(name) {
	    let length = 0;
	    let arraySpec;
	    for (let ii = 0; ii < arrayOfArrays.length; ++ii) {
	      const arrays = arrayOfArrays[ii];
	      const arrayInfo = arrays[name];
	      const array = getArray$1(arrayInfo);
	      length += array.length;
	      if (!arraySpec || arrayInfo.data) {
	        arraySpec = arrayInfo;
	      }
	    }
	    return {
	      length: length,
	      spec: arraySpec,
	    };
	  }

	  function copyArraysToNewArray(name, base, newArray) {
	    let baseIndex = 0;
	    let offset = 0;
	    for (let ii = 0; ii < arrayOfArrays.length; ++ii) {
	      const arrays = arrayOfArrays[ii];
	      const arrayInfo = arrays[name];
	      const array = getArray$1(arrayInfo);
	      if (name === 'indices') {
	        copyElements(array, newArray, offset, baseIndex);
	        baseIndex += base[ii];
	      } else {
	        copyElements(array, newArray, offset);
	      }
	      offset += array.length;
	    }
	  }

	  const base = names[baseName];

	  const newArrays = {};
	  Object.keys(names).forEach(function(name) {
	    const info = getLengthOfCombinedArrays(name);
	    const newArraySpec = createArrayOfSameType(info.spec, info.length);
	    copyArraysToNewArray(name, base, getArray$1(newArraySpec));
	    newArrays[name] = newArraySpec;
	  });
	  return newArrays;
	}

	/**
	 * Creates a duplicate set of vertices
	 *
	 * This is useful for calling reorientVertices when you
	 * also want to keep the original available
	 *
	 * @param {module:twgl.Arrays} arrays of vertices
	 * @return {module:twgl.Arrays} The duplicated vertices.
	 * @memberOf module:twgl/primitives
	 */
	function duplicateVertices(arrays) {
	  const newArrays = {};
	  Object.keys(arrays).forEach(function(name) {
	    const arraySpec = arrays[name];
	    const srcArray = getArray$1(arraySpec);
	    const newArraySpec = createArrayOfSameType(arraySpec, srcArray.length);
	    copyElements(srcArray, getArray$1(newArraySpec), 0);
	    newArrays[name] = newArraySpec;
	  });
	  return newArrays;
	}

	const create3DFBufferInfo = createBufferInfoFunc(create3DFVertices);
	const create3DFBuffers = createBufferFunc(create3DFVertices);
	const createCubeBufferInfo = createBufferInfoFunc(createCubeVertices);
	const createCubeBuffers = createBufferFunc(createCubeVertices);
	const createPlaneBufferInfo = createBufferInfoFunc(createPlaneVertices);
	const createPlaneBuffers = createBufferFunc(createPlaneVertices);
	const createSphereBufferInfo = createBufferInfoFunc(createSphereVertices);
	const createSphereBuffers = createBufferFunc(createSphereVertices);
	const createTruncatedConeBufferInfo = createBufferInfoFunc(createTruncatedConeVertices);
	const createTruncatedConeBuffers = createBufferFunc(createTruncatedConeVertices);
	const createXYQuadBufferInfo = createBufferInfoFunc(createXYQuadVertices);
	const createXYQuadBuffers = createBufferFunc(createXYQuadVertices);
	const createCrescentBufferInfo = createBufferInfoFunc(createCrescentVertices);
	const createCrescentBuffers = createBufferFunc(createCrescentVertices);
	const createCylinderBufferInfo = createBufferInfoFunc(createCylinderVertices);
	const createCylinderBuffers = createBufferFunc(createCylinderVertices);
	const createTorusBufferInfo = createBufferInfoFunc(createTorusVertices);
	const createTorusBuffers = createBufferFunc(createTorusVertices);
	const createDiscBufferInfo = createBufferInfoFunc(createDiscVertices);
	const createDiscBuffers = createBufferFunc(createDiscVertices);

	// these were mis-spelled until 4.12
	const createCresentBufferInfo = createCrescentBufferInfo;
	const createCresentBuffers = createCrescentBuffers;
	const createCresentVertices = createCrescentVertices;

	var primitives = /*#__PURE__*/Object.freeze({
	  __proto__: null,
	  create3DFBufferInfo: create3DFBufferInfo,
	  create3DFBuffers: create3DFBuffers,
	  create3DFVertices: create3DFVertices,
	  createAugmentedTypedArray: createAugmentedTypedArray,
	  createCubeBufferInfo: createCubeBufferInfo,
	  createCubeBuffers: createCubeBuffers,
	  createCubeVertices: createCubeVertices,
	  createPlaneBufferInfo: createPlaneBufferInfo,
	  createPlaneBuffers: createPlaneBuffers,
	  createPlaneVertices: createPlaneVertices,
	  createSphereBufferInfo: createSphereBufferInfo,
	  createSphereBuffers: createSphereBuffers,
	  createSphereVertices: createSphereVertices,
	  createTruncatedConeBufferInfo: createTruncatedConeBufferInfo,
	  createTruncatedConeBuffers: createTruncatedConeBuffers,
	  createTruncatedConeVertices: createTruncatedConeVertices,
	  createXYQuadBufferInfo: createXYQuadBufferInfo,
	  createXYQuadBuffers: createXYQuadBuffers,
	  createXYQuadVertices: createXYQuadVertices,
	  createCresentBufferInfo: createCresentBufferInfo,
	  createCresentBuffers: createCresentBuffers,
	  createCresentVertices: createCresentVertices,
	  createCrescentBufferInfo: createCrescentBufferInfo,
	  createCrescentBuffers: createCrescentBuffers,
	  createCrescentVertices: createCrescentVertices,
	  createCylinderBufferInfo: createCylinderBufferInfo,
	  createCylinderBuffers: createCylinderBuffers,
	  createCylinderVertices: createCylinderVertices,
	  createTorusBufferInfo: createTorusBufferInfo,
	  createTorusBuffers: createTorusBuffers,
	  createTorusVertices: createTorusVertices,
	  createDiscBufferInfo: createDiscBufferInfo,
	  createDiscBuffers: createDiscBuffers,
	  createDiscVertices: createDiscVertices,
	  deindexVertices: deindexVertices,
	  flattenNormals: flattenNormals,
	  makeRandomVertexColors: makeRandomVertexColors,
	  reorientDirections: reorientDirections,
	  reorientNormals: reorientNormals,
	  reorientPositions: reorientPositions,
	  reorientVertices: reorientVertices,
	  concatVertices: concatVertices,
	  duplicateVertices: duplicateVertices
	});

	/*
	 * Copyright 2019 Gregg Tavares
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining a
	 * copy of this software and associated documentation files (the "Software"),
	 * to deal in the Software without restriction, including without limitation
	 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
	 * and/or sell copies of the Software, and to permit persons to whom the
	 * Software is furnished to do so, subject to the following conditions:
	 *
	 * The above copyright notice and this permission notice shall be included in
	 * all copies or substantial portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL
	 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
	 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
	 * DEALINGS IN THE SOFTWARE.
	 */

	/**
	 * Gets the gl version as a number
	 * @param {WebGLRenderingContext} gl A WebGLRenderingContext
	 * @return {number} version of gl
	 * @private
	 */
	//function getVersionAsNumber(gl) {
	//  return parseFloat(gl.getParameter(gl.VERSION).substr(6));
	//}

	/**
	 * Check if context is WebGL 2.0
	 * @param {WebGLRenderingContext} gl A WebGLRenderingContext
	 * @return {bool} true if it's WebGL 2.0
	 * @memberOf module:twgl
	 */
	function isWebGL2(gl) {
	  // This is the correct check but it's slow
	  //  return gl.getParameter(gl.VERSION).indexOf("WebGL 2.0") === 0;
	  // This might also be the correct check but I'm assuming it's slow-ish
	  // return gl instanceof WebGL2RenderingContext;
	  return !!gl.texStorage2D;
	}

	/*
	 * Copyright 2019 Gregg Tavares
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining a
	 * copy of this software and associated documentation files (the "Software"),
	 * to deal in the Software without restriction, including without limitation
	 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
	 * and/or sell copies of the Software, and to permit persons to whom the
	 * Software is furnished to do so, subject to the following conditions:
	 *
	 * The above copyright notice and this permission notice shall be included in
	 * all copies or substantial portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL
	 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
	 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
	 * DEALINGS IN THE SOFTWARE.
	 */

	/**
	 * Low level shader program related functions
	 *
	 * You should generally not need to use these functions. They are provided
	 * for those cases where you're doing something out of the ordinary
	 * and you need lower level access.
	 *
	 * For backward compatibility they are available at both `twgl.programs` and `twgl`
	 * itself
	 *
	 * See {@link module:twgl} for core functions
	 *
	 * @module twgl/programs
	 */

	const error$1 = error;
	function getElementById(id) {
	  return (typeof document !== 'undefined' && document.getElementById)
	      ? document.getElementById(id)
	      : null;
	}

	const TEXTURE0                       = 0x84c0;

	const ARRAY_BUFFER$1                   = 0x8892;
	const ELEMENT_ARRAY_BUFFER$1           = 0x8893;

	const COMPILE_STATUS                 = 0x8b81;
	const LINK_STATUS                    = 0x8b82;
	const FRAGMENT_SHADER                = 0x8b30;
	const VERTEX_SHADER                  = 0x8b31;
	const SEPARATE_ATTRIBS               = 0x8c8d;

	const ACTIVE_UNIFORMS                = 0x8b86;
	const ACTIVE_ATTRIBUTES              = 0x8b89;
	const TRANSFORM_FEEDBACK_VARYINGS    = 0x8c83;
	const ACTIVE_UNIFORM_BLOCKS          = 0x8a36;
	const UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER   = 0x8a44;
	const UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER = 0x8a46;
	const UNIFORM_BLOCK_DATA_SIZE                     = 0x8a40;
	const UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES        = 0x8a43;

	const FLOAT$3                         = 0x1406;
	const FLOAT_VEC2                    = 0x8B50;
	const FLOAT_VEC3                    = 0x8B51;
	const FLOAT_VEC4                    = 0x8B52;
	const INT$3                           = 0x1404;
	const INT_VEC2                      = 0x8B53;
	const INT_VEC3                      = 0x8B54;
	const INT_VEC4                      = 0x8B55;
	const BOOL                          = 0x8B56;
	const BOOL_VEC2                     = 0x8B57;
	const BOOL_VEC3                     = 0x8B58;
	const BOOL_VEC4                     = 0x8B59;
	const FLOAT_MAT2                    = 0x8B5A;
	const FLOAT_MAT3                    = 0x8B5B;
	const FLOAT_MAT4                    = 0x8B5C;
	const SAMPLER_2D                    = 0x8B5E;
	const SAMPLER_CUBE                  = 0x8B60;
	const SAMPLER_3D                    = 0x8B5F;
	const SAMPLER_2D_SHADOW             = 0x8B62;
	const FLOAT_MAT2x3                  = 0x8B65;
	const FLOAT_MAT2x4                  = 0x8B66;
	const FLOAT_MAT3x2                  = 0x8B67;
	const FLOAT_MAT3x4                  = 0x8B68;
	const FLOAT_MAT4x2                  = 0x8B69;
	const FLOAT_MAT4x3                  = 0x8B6A;
	const SAMPLER_2D_ARRAY              = 0x8DC1;
	const SAMPLER_2D_ARRAY_SHADOW       = 0x8DC4;
	const SAMPLER_CUBE_SHADOW           = 0x8DC5;
	const UNSIGNED_INT$3                  = 0x1405;
	const UNSIGNED_INT_VEC2             = 0x8DC6;
	const UNSIGNED_INT_VEC3             = 0x8DC7;
	const UNSIGNED_INT_VEC4             = 0x8DC8;
	const INT_SAMPLER_2D                = 0x8DCA;
	const INT_SAMPLER_3D                = 0x8DCB;
	const INT_SAMPLER_CUBE              = 0x8DCC;
	const INT_SAMPLER_2D_ARRAY          = 0x8DCF;
	const UNSIGNED_INT_SAMPLER_2D       = 0x8DD2;
	const UNSIGNED_INT_SAMPLER_3D       = 0x8DD3;
	const UNSIGNED_INT_SAMPLER_CUBE     = 0x8DD4;
	const UNSIGNED_INT_SAMPLER_2D_ARRAY = 0x8DD7;

	const TEXTURE_2D$1                    = 0x0DE1;
	const TEXTURE_CUBE_MAP$1              = 0x8513;
	const TEXTURE_3D$1                    = 0x806F;
	const TEXTURE_2D_ARRAY$1              = 0x8C1A;

	const typeMap = {};

	/**
	 * Returns the corresponding bind point for a given sampler type
	 */
	function getBindPointForSamplerType(gl, type) {
	  return typeMap[type].bindPoint;
	}

	// This kind of sucks! If you could compose functions as in `var fn = gl[name];`
	// this code could be a lot smaller but that is sadly really slow (T_T)

	function floatSetter(gl, location) {
	  return function(v) {
	    gl.uniform1f(location, v);
	  };
	}

	function floatArraySetter(gl, location) {
	  return function(v) {
	    gl.uniform1fv(location, v);
	  };
	}

	function floatVec2Setter(gl, location) {
	  return function(v) {
	    gl.uniform2fv(location, v);
	  };
	}

	function floatVec3Setter(gl, location) {
	  return function(v) {
	    gl.uniform3fv(location, v);
	  };
	}

	function floatVec4Setter(gl, location) {
	  return function(v) {
	    gl.uniform4fv(location, v);
	  };
	}

	function intSetter(gl, location) {
	  return function(v) {
	    gl.uniform1i(location, v);
	  };
	}

	function intArraySetter(gl, location) {
	  return function(v) {
	    gl.uniform1iv(location, v);
	  };
	}

	function intVec2Setter(gl, location) {
	  return function(v) {
	    gl.uniform2iv(location, v);
	  };
	}

	function intVec3Setter(gl, location) {
	  return function(v) {
	    gl.uniform3iv(location, v);
	  };
	}

	function intVec4Setter(gl, location) {
	  return function(v) {
	    gl.uniform4iv(location, v);
	  };
	}

	function uintSetter(gl, location) {
	  return function(v) {
	    gl.uniform1ui(location, v);
	  };
	}

	function uintArraySetter(gl, location) {
	  return function(v) {
	    gl.uniform1uiv(location, v);
	  };
	}

	function uintVec2Setter(gl, location) {
	  return function(v) {
	    gl.uniform2uiv(location, v);
	  };
	}

	function uintVec3Setter(gl, location) {
	  return function(v) {
	    gl.uniform3uiv(location, v);
	  };
	}

	function uintVec4Setter(gl, location) {
	  return function(v) {
	    gl.uniform4uiv(location, v);
	  };
	}

	function floatMat2Setter(gl, location) {
	  return function(v) {
	    gl.uniformMatrix2fv(location, false, v);
	  };
	}

	function floatMat3Setter(gl, location) {
	  return function(v) {
	    gl.uniformMatrix3fv(location, false, v);
	  };
	}

	function floatMat4Setter(gl, location) {
	  return function(v) {
	    gl.uniformMatrix4fv(location, false, v);
	  };
	}

	function floatMat23Setter(gl, location) {
	  return function(v) {
	    gl.uniformMatrix2x3fv(location, false, v);
	  };
	}

	function floatMat32Setter(gl, location) {
	  return function(v) {
	    gl.uniformMatrix3x2fv(location, false, v);
	  };
	}

	function floatMat24Setter(gl, location) {
	  return function(v) {
	    gl.uniformMatrix2x4fv(location, false, v);
	  };
	}

	function floatMat42Setter(gl, location) {
	  return function(v) {
	    gl.uniformMatrix4x2fv(location, false, v);
	  };
	}

	function floatMat34Setter(gl, location) {
	  return function(v) {
	    gl.uniformMatrix3x4fv(location, false, v);
	  };
	}

	function floatMat43Setter(gl, location) {
	  return function(v) {
	    gl.uniformMatrix4x3fv(location, false, v);
	  };
	}

	function samplerSetter(gl, type, unit, location) {
	  const bindPoint = getBindPointForSamplerType(gl, type);
	  return isWebGL2(gl) ? function(textureOrPair) {
	    let texture;
	    let sampler;
	    if (isTexture(gl, textureOrPair)) {
	      texture = textureOrPair;
	      sampler = null;
	    } else {
	      texture = textureOrPair.texture;
	      sampler = textureOrPair.sampler;
	    }
	    gl.uniform1i(location, unit);
	    gl.activeTexture(TEXTURE0 + unit);
	    gl.bindTexture(bindPoint, texture);
	    gl.bindSampler(unit, sampler);
	  } : function(texture) {
	    gl.uniform1i(location, unit);
	    gl.activeTexture(TEXTURE0 + unit);
	    gl.bindTexture(bindPoint, texture);
	  };
	}

	function samplerArraySetter(gl, type, unit, location, size) {
	  const bindPoint = getBindPointForSamplerType(gl, type);
	  const units = new Int32Array(size);
	  for (let ii = 0; ii < size; ++ii) {
	    units[ii] = unit + ii;
	  }

	  return isWebGL2(gl) ? function(textures) {
	    gl.uniform1iv(location, units);
	    textures.forEach(function(textureOrPair, index) {
	      gl.activeTexture(TEXTURE0 + units[index]);
	      let texture;
	      let sampler;
	      if (isTexture(gl, textureOrPair)) {
	        texture = textureOrPair;
	        sampler = null;
	      } else {
	        texture = textureOrPair.texture;
	        sampler = textureOrPair.sampler;
	      }
	      gl.bindSampler(unit, sampler);
	      gl.bindTexture(bindPoint, texture);
	    });
	  } : function(textures) {
	    gl.uniform1iv(location, units);
	    textures.forEach(function(texture, index) {
	      gl.activeTexture(TEXTURE0 + units[index]);
	      gl.bindTexture(bindPoint, texture);
	    });
	  };
	}

	typeMap[FLOAT$3]                         = { Type: Float32Array, size:  4, setter: floatSetter,      arraySetter: floatArraySetter, };
	typeMap[FLOAT_VEC2]                    = { Type: Float32Array, size:  8, setter: floatVec2Setter,  };
	typeMap[FLOAT_VEC3]                    = { Type: Float32Array, size: 12, setter: floatVec3Setter,  };
	typeMap[FLOAT_VEC4]                    = { Type: Float32Array, size: 16, setter: floatVec4Setter,  };
	typeMap[INT$3]                           = { Type: Int32Array,   size:  4, setter: intSetter,        arraySetter: intArraySetter, };
	typeMap[INT_VEC2]                      = { Type: Int32Array,   size:  8, setter: intVec2Setter,    };
	typeMap[INT_VEC3]                      = { Type: Int32Array,   size: 12, setter: intVec3Setter,    };
	typeMap[INT_VEC4]                      = { Type: Int32Array,   size: 16, setter: intVec4Setter,    };
	typeMap[UNSIGNED_INT$3]                  = { Type: Uint32Array,  size:  4, setter: uintSetter,       arraySetter: uintArraySetter, };
	typeMap[UNSIGNED_INT_VEC2]             = { Type: Uint32Array,  size:  8, setter: uintVec2Setter,   };
	typeMap[UNSIGNED_INT_VEC3]             = { Type: Uint32Array,  size: 12, setter: uintVec3Setter,   };
	typeMap[UNSIGNED_INT_VEC4]             = { Type: Uint32Array,  size: 16, setter: uintVec4Setter,   };
	typeMap[BOOL]                          = { Type: Uint32Array,  size:  4, setter: intSetter,        arraySetter: intArraySetter, };
	typeMap[BOOL_VEC2]                     = { Type: Uint32Array,  size:  8, setter: intVec2Setter,    };
	typeMap[BOOL_VEC3]                     = { Type: Uint32Array,  size: 12, setter: intVec3Setter,    };
	typeMap[BOOL_VEC4]                     = { Type: Uint32Array,  size: 16, setter: intVec4Setter,    };
	typeMap[FLOAT_MAT2]                    = { Type: Float32Array, size: 16, setter: floatMat2Setter,  };
	typeMap[FLOAT_MAT3]                    = { Type: Float32Array, size: 36, setter: floatMat3Setter,  };
	typeMap[FLOAT_MAT4]                    = { Type: Float32Array, size: 64, setter: floatMat4Setter,  };
	typeMap[FLOAT_MAT2x3]                  = { Type: Float32Array, size: 24, setter: floatMat23Setter, };
	typeMap[FLOAT_MAT2x4]                  = { Type: Float32Array, size: 32, setter: floatMat24Setter, };
	typeMap[FLOAT_MAT3x2]                  = { Type: Float32Array, size: 24, setter: floatMat32Setter, };
	typeMap[FLOAT_MAT3x4]                  = { Type: Float32Array, size: 48, setter: floatMat34Setter, };
	typeMap[FLOAT_MAT4x2]                  = { Type: Float32Array, size: 32, setter: floatMat42Setter, };
	typeMap[FLOAT_MAT4x3]                  = { Type: Float32Array, size: 48, setter: floatMat43Setter, };
	typeMap[SAMPLER_2D]                    = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D$1,       };
	typeMap[SAMPLER_CUBE]                  = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_CUBE_MAP$1, };
	typeMap[SAMPLER_3D]                    = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_3D$1,       };
	typeMap[SAMPLER_2D_SHADOW]             = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D$1,       };
	typeMap[SAMPLER_2D_ARRAY]              = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D_ARRAY$1, };
	typeMap[SAMPLER_2D_ARRAY_SHADOW]       = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D_ARRAY$1, };
	typeMap[SAMPLER_CUBE_SHADOW]           = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_CUBE_MAP$1, };
	typeMap[INT_SAMPLER_2D]                = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D$1,       };
	typeMap[INT_SAMPLER_3D]                = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_3D$1,       };
	typeMap[INT_SAMPLER_CUBE]              = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_CUBE_MAP$1, };
	typeMap[INT_SAMPLER_2D_ARRAY]          = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D_ARRAY$1, };
	typeMap[UNSIGNED_INT_SAMPLER_2D]       = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D$1,       };
	typeMap[UNSIGNED_INT_SAMPLER_3D]       = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_3D$1,       };
	typeMap[UNSIGNED_INT_SAMPLER_CUBE]     = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_CUBE_MAP$1, };
	typeMap[UNSIGNED_INT_SAMPLER_2D_ARRAY] = { Type: null,         size:  0, setter: samplerSetter,    arraySetter: samplerArraySetter, bindPoint: TEXTURE_2D_ARRAY$1, };

	function floatAttribSetter(gl, index) {
	  return function(b) {
	    if (b.value) {
	      gl.disableVertexAttribArray(index);
	      switch (b.value.length) {
	        case 4:
	          gl.vertexAttrib4fv(index, b.value);
	          break;
	        case 3:
	          gl.vertexAttrib3fv(index, b.value);
	          break;
	        case 2:
	          gl.vertexAttrib2fv(index, b.value);
	          break;
	        case 1:
	          gl.vertexAttrib1fv(index, b.value);
	          break;
	        default:
	          throw new Error('the length of a float constant value must be between 1 and 4!');
	      }
	    } else {
	      gl.bindBuffer(ARRAY_BUFFER$1, b.buffer);
	      gl.enableVertexAttribArray(index);
	      gl.vertexAttribPointer(
	          index, b.numComponents || b.size, b.type || FLOAT$3, b.normalize || false, b.stride || 0, b.offset || 0);
	      if (b.divisor !== undefined) {
	        gl.vertexAttribDivisor(index, b.divisor);
	      }
	    }
	  };
	}

	function intAttribSetter(gl, index) {
	  return function(b) {
	    if (b.value) {
	      gl.disableVertexAttribArray(index);
	      if (b.value.length === 4) {
	        gl.vertexAttrib4iv(index, b.value);
	      } else {
	        throw new Error('The length of an integer constant value must be 4!');
	      }
	    } else {
	      gl.bindBuffer(ARRAY_BUFFER$1, b.buffer);
	      gl.enableVertexAttribArray(index);
	      gl.vertexAttribIPointer(
	          index, b.numComponents || b.size, b.type || INT$3, b.stride || 0, b.offset || 0);
	      if (b.divisor !== undefined) {
	        gl.vertexAttribDivisor(index, b.divisor);
	      }
	    }
	  };
	}

	function uintAttribSetter(gl, index) {
	  return function(b) {
	    if (b.value) {
	      gl.disableVertexAttribArray(index);
	      if (b.value.length === 4) {
	        gl.vertexAttrib4uiv(index, b.value);
	      } else {
	        throw new Error('The length of an unsigned integer constant value must be 4!');
	      }
	    } else {
	      gl.bindBuffer(ARRAY_BUFFER$1, b.buffer);
	      gl.enableVertexAttribArray(index);
	      gl.vertexAttribIPointer(
	          index, b.numComponents || b.size, b.type || UNSIGNED_INT$3, b.stride || 0, b.offset || 0);
	      if (b.divisor !== undefined) {
	        gl.vertexAttribDivisor(index, b.divisor);
	      }
	    }
	  };
	}

	function matAttribSetter(gl, index, typeInfo) {
	  const defaultSize = typeInfo.size;
	  const count = typeInfo.count;

	  return function(b) {
	    gl.bindBuffer(ARRAY_BUFFER$1, b.buffer);
	    const numComponents = b.size || b.numComponents || defaultSize;
	    const size = numComponents / count;
	    const type = b.type || FLOAT$3;
	    const typeInfo = typeMap[type];
	    const stride = typeInfo.size * numComponents;
	    const normalize = b.normalize || false;
	    const offset = b.offset || 0;
	    const rowOffset = stride / count;
	    for (let i = 0; i < count; ++i) {
	      gl.enableVertexAttribArray(index + i);
	      gl.vertexAttribPointer(
	          index + i, size, type, normalize, stride, offset + rowOffset * i);
	      if (b.divisor !== undefined) {
	        gl.vertexAttribDivisor(index + i, b.divisor);
	      }
	    }
	  };
	}



	const attrTypeMap = {};
	attrTypeMap[FLOAT$3]             = { size:  4, setter: floatAttribSetter, };
	attrTypeMap[FLOAT_VEC2]        = { size:  8, setter: floatAttribSetter, };
	attrTypeMap[FLOAT_VEC3]        = { size: 12, setter: floatAttribSetter, };
	attrTypeMap[FLOAT_VEC4]        = { size: 16, setter: floatAttribSetter, };
	attrTypeMap[INT$3]               = { size:  4, setter: intAttribSetter,   };
	attrTypeMap[INT_VEC2]          = { size:  8, setter: intAttribSetter,   };
	attrTypeMap[INT_VEC3]          = { size: 12, setter: intAttribSetter,   };
	attrTypeMap[INT_VEC4]          = { size: 16, setter: intAttribSetter,   };
	attrTypeMap[UNSIGNED_INT$3]      = { size:  4, setter: uintAttribSetter,  };
	attrTypeMap[UNSIGNED_INT_VEC2] = { size:  8, setter: uintAttribSetter,  };
	attrTypeMap[UNSIGNED_INT_VEC3] = { size: 12, setter: uintAttribSetter,  };
	attrTypeMap[UNSIGNED_INT_VEC4] = { size: 16, setter: uintAttribSetter,  };
	attrTypeMap[BOOL]              = { size:  4, setter: intAttribSetter,   };
	attrTypeMap[BOOL_VEC2]         = { size:  8, setter: intAttribSetter,   };
	attrTypeMap[BOOL_VEC3]         = { size: 12, setter: intAttribSetter,   };
	attrTypeMap[BOOL_VEC4]         = { size: 16, setter: intAttribSetter,   };
	attrTypeMap[FLOAT_MAT2]        = { size:  4, setter: matAttribSetter,   count: 2, };
	attrTypeMap[FLOAT_MAT3]        = { size:  9, setter: matAttribSetter,   count: 3, };
	attrTypeMap[FLOAT_MAT4]        = { size: 16, setter: matAttribSetter,   count: 4, };

	/**
	 * Error Callback
	 * @callback ErrorCallback
	 * @param {string} msg error message.
	 * @param {number} [lineOffset] amount to add to line number
	 * @memberOf module:twgl
	 */

	function addLineNumbers(src, lineOffset) {
	  lineOffset = lineOffset || 0;
	  ++lineOffset;

	  return src.split("\n").map(function(line, ndx) {
	    return (ndx + lineOffset) + ": " + line;
	  }).join("\n");
	}

	const spaceRE = /^[ \t]*\n/;

	/**
	 * Loads a shader.
	 * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
	 * @param {string} shaderSource The shader source.
	 * @param {number} shaderType The type of shader.
	 * @param {module:twgl.ErrorCallback} opt_errorCallback callback for errors.
	 * @return {WebGLShader} The created shader.
	 * @private
	 */
	function loadShader(gl, shaderSource, shaderType, opt_errorCallback) {
	  const errFn = opt_errorCallback || error$1;
	  // Create the shader object
	  const shader = gl.createShader(shaderType);

	  // Remove the first end of line because WebGL 2.0 requires
	  // #version 300 es
	  // as the first line. No whitespace allowed before that line
	  // so
	  //
	  // <script>
	  // #version 300 es
	  // </script>
	  //
	  // Has one line before it which is invalid according to GLSL ES 3.00
	  //
	  let lineOffset = 0;
	  if (spaceRE.test(shaderSource)) {
	    lineOffset = 1;
	    shaderSource = shaderSource.replace(spaceRE, '');
	  }

	  // Load the shader source
	  gl.shaderSource(shader, shaderSource);

	  // Compile the shader
	  gl.compileShader(shader);

	  // Check the compile status
	  const compiled = gl.getShaderParameter(shader, COMPILE_STATUS);
	  if (!compiled) {
	    // Something went wrong during compilation; get the error
	    const lastError = gl.getShaderInfoLog(shader);
	    errFn(addLineNumbers(shaderSource, lineOffset) + "\n*** Error compiling shader: " + lastError);
	    gl.deleteShader(shader);
	    return null;
	  }

	  return shader;
	}

	/**
	 * @typedef {Object} ProgramOptions
	 * @property {function(string)} [errorCallback] callback for errors
	 * @property {Object.<string,number>} [attribLocations] a attribute name to location map
	 * @property {(module:twgl.BufferInfo|Object.<string,module:twgl.AttribInfo>|string[])} [transformFeedbackVaryings] If passed
	 *   a BufferInfo will use the attribs names inside. If passed an object of AttribInfos will use the names from that object. Otherwise
	 *   you can pass an array of names.
	 * @property {number} [transformFeedbackMode] the mode to pass `gl.transformFeedbackVaryings`. Defaults to `SEPARATE_ATTRIBS`.
	 * @memberOf module:twgl
	 */

	/**
	 * Gets the program options based on all these optional arguments
	 * @param {module:twgl.ProgramOptions|string[]} [opt_attribs] Options for the program or an array of attribs names. Locations will be assigned by index if not passed in
	 * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
	 * @param {module:twgl.ErrorCallback} [opt_errorCallback] callback for errors. By default it just prints an error to the console
	 *        on error. If you want something else pass an callback. It's passed an error message.
	 * @return {module:twgl.ProgramOptions} an instance of ProgramOptions based on the arguments passed in
	 * @private
	 */
	function getProgramOptions(opt_attribs, opt_locations, opt_errorCallback) {
	  let transformFeedbackVaryings;
	  let transformFeedbackMode;
	  if (typeof opt_locations === 'function') {
	    opt_errorCallback = opt_locations;
	    opt_locations = undefined;
	  }
	  if (typeof opt_attribs === 'function') {
	    opt_errorCallback = opt_attribs;
	    opt_attribs = undefined;
	  } else if (opt_attribs && !Array.isArray(opt_attribs)) {
	    // If we have an errorCallback we can just return this object
	    // Otherwise we need to construct one with default errorCallback
	    if (opt_attribs.errorCallback) {
	      return opt_attribs;
	    }
	    const opt = opt_attribs;
	    opt_errorCallback = opt.errorCallback;
	    opt_attribs = opt.attribLocations;
	    transformFeedbackVaryings = opt.transformFeedbackVaryings;
	    transformFeedbackMode = opt.transformFeedbackMode;
	  }

	  const options = {
	    errorCallback: opt_errorCallback || error$1,
	    transformFeedbackVaryings: transformFeedbackVaryings,
	    transformFeedbackMode: transformFeedbackMode,
	  };

	  if (opt_attribs) {
	    let attribLocations = {};
	    if (Array.isArray(opt_attribs)) {
	      opt_attribs.forEach(function(attrib,  ndx) {
	        attribLocations[attrib] = opt_locations ? opt_locations[ndx] : ndx;
	      });
	    } else {
	      attribLocations = opt_attribs;
	    }
	    options.attribLocations = attribLocations;
	  }

	  return options;
	}

	const defaultShaderType = [
	  "VERTEX_SHADER",
	  "FRAGMENT_SHADER",
	];

	function getShaderTypeFromScriptType(gl, scriptType) {
	  if (scriptType.indexOf("frag") >= 0) {
	    return FRAGMENT_SHADER;
	  } else if (scriptType.indexOf("vert") >= 0) {
	    return VERTEX_SHADER;
	  }
	  return undefined;
	}

	function deleteShaders(gl, shaders) {
	  shaders.forEach(function(shader) {
	    gl.deleteShader(shader);
	  });
	}

	/**
	 * Creates a program, attaches (and/or compiles) shaders, binds attrib locations, links the
	 * program and calls useProgram.
	 *
	 * NOTE: There are 4 signatures for this function
	 *
	 *     twgl.createProgram(gl, [vs, fs], options);
	 *     twgl.createProgram(gl, [vs, fs], opt_errFunc);
	 *     twgl.createProgram(gl, [vs, fs], opt_attribs, opt_errFunc);
	 *     twgl.createProgram(gl, [vs, fs], opt_attribs, opt_locations, opt_errFunc);
	 *
	 * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
	 * @param {WebGLShader[]|string[]} shaders The shaders to attach, or element ids for their source, or strings that contain their source
	 * @param {module:twgl.ProgramOptions|string[]|module:twgl.ErrorCallback} [opt_attribs] Options for the program or an array of attribs names or an error callback. Locations will be assigned by index if not passed in
	 * @param {number[]} [opt_locations|module:twgl.ErrorCallback] The locations for the. A parallel array to opt_attribs letting you assign locations or an error callback.
	 * @param {module:twgl.ErrorCallback} [opt_errorCallback] callback for errors. By default it just prints an error to the console
	 *        on error. If you want something else pass an callback. It's passed an error message.
	 * @return {WebGLProgram?} the created program or null if error.
	 * @memberOf module:twgl/programs
	 */
	function createProgram(
	    gl, shaders, opt_attribs, opt_locations, opt_errorCallback) {
	  const progOptions = getProgramOptions(opt_attribs, opt_locations, opt_errorCallback);
	  const realShaders = [];
	  const newShaders = [];
	  for (let ndx = 0; ndx < shaders.length; ++ndx) {
	    let shader = shaders[ndx];
	    if (typeof (shader) === 'string') {
	      const elem = getElementById(shader);
	      const src = elem ? elem.text : shader;
	      let type = gl[defaultShaderType[ndx]];
	      if (elem && elem.type) {
	        type = getShaderTypeFromScriptType(gl, elem.type) || type;
	      }
	      shader = loadShader(gl, src, type, progOptions.errorCallback);
	      newShaders.push(shader);
	    }
	    if (isShader(gl, shader)) {
	      realShaders.push(shader);
	    }
	  }

	  if (realShaders.length !== shaders.length) {
	    progOptions.errorCallback("not enough shaders for program");
	    deleteShaders(gl, newShaders);
	    return null;
	  }

	  const program = gl.createProgram();
	  realShaders.forEach(function(shader) {
	    gl.attachShader(program, shader);
	  });
	  if (progOptions.attribLocations) {
	    Object.keys(progOptions.attribLocations).forEach(function(attrib) {
	      gl.bindAttribLocation(program, progOptions.attribLocations[attrib], attrib);
	    });
	  }
	  let varyings = progOptions.transformFeedbackVaryings;
	  if (varyings) {
	    if (varyings.attribs) {
	      varyings = varyings.attribs;
	    }
	    if (!Array.isArray(varyings)) {
	      varyings = Object.keys(varyings);
	    }
	    gl.transformFeedbackVaryings(program, varyings, progOptions.transformFeedbackMode || SEPARATE_ATTRIBS);
	  }
	  gl.linkProgram(program);

	  // Check the link status
	  const linked = gl.getProgramParameter(program, LINK_STATUS);
	  if (!linked) {
	    // something went wrong with the link
	    const lastError = gl.getProgramInfoLog(program);
	    progOptions.errorCallback("Error in program linking:" + lastError);

	    gl.deleteProgram(program);
	    deleteShaders(gl, newShaders);
	    return null;
	  }
	  return program;
	}

	/**
	 * Creates a program from 2 sources.
	 *
	 * NOTE: There are 4 signatures for this function
	 *
	 *     twgl.createProgramFromSource(gl, [vs, fs], opt_options);
	 *     twgl.createProgramFromSource(gl, [vs, fs], opt_errFunc);
	 *     twgl.createProgramFromSource(gl, [vs, fs], opt_attribs, opt_errFunc);
	 *     twgl.createProgramFromSource(gl, [vs, fs], opt_attribs, opt_locations, opt_errFunc);
	 *
	 * @param {WebGLRenderingContext} gl The WebGLRenderingContext
	 *        to use.
	 * @param {string[]} shaderSources Array of sources for the
	 *        shaders. The first is assumed to be the vertex shader,
	 *        the second the fragment shader.
	 * @param {module:twgl.ProgramOptions|string[]|module:twgl.ErrorCallback} [opt_attribs] Options for the program or an array of attribs names or an error callback. Locations will be assigned by index if not passed in
	 * @param {number[]} [opt_locations|module:twgl.ErrorCallback] The locations for the. A parallel array to opt_attribs letting you assign locations or an error callback.
	 * @param {module:twgl.ErrorCallback} [opt_errorCallback] callback for errors. By default it just prints an error to the console
	 *        on error. If you want something else pass an callback. It's passed an error message.
	 * @return {WebGLProgram?} the created program or null if error.
	 * @memberOf module:twgl/programs
	 */
	function createProgramFromSources(
	    gl, shaderSources, opt_attribs, opt_locations, opt_errorCallback) {
	  const progOptions = getProgramOptions(opt_attribs, opt_locations, opt_errorCallback);
	  const shaders = [];
	  for (let ii = 0; ii < shaderSources.length; ++ii) {
	    const shader = loadShader(
	        gl, shaderSources[ii], gl[defaultShaderType[ii]], progOptions.errorCallback);
	    if (!shader) {
	      return null;
	    }
	    shaders.push(shader);
	  }
	  return createProgram(gl, shaders, progOptions);
	}

	/**
	 * Returns true if attribute/uniform is a reserved/built in
	 *
	 * It makes no sense to me why GL returns these because it's
	 * illegal to call `gl.getUniformLocation` and `gl.getAttribLocation`
	 * with names that start with `gl_` (and `webgl_` in WebGL)
	 *
	 * I can only assume they are there because they might count
	 * when computing the number of uniforms/attributes used when you want to
	 * know if you are near the limit. That doesn't really make sense
	 * to me but the fact that these get returned are in the spec.
	 *
	 * @param {WebGLActiveInfo} info As returned from `gl.getActiveUniform` or
	 *    `gl.getActiveAttrib`.
	 * @return {bool} true if it's reserved
	 * @private
	 */
	function isBuiltIn(info) {
	  const name = info.name;
	  return name.startsWith("gl_") || name.startsWith("webgl_");
	}

	/**
	 * Creates setter functions for all uniforms of a shader
	 * program.
	 *
	 * @see {@link module:twgl.setUniforms}
	 *
	 * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
	 * @param {WebGLProgram} program the program to create setters for.
	 * @returns {Object.<string, function>} an object with a setter by name for each uniform
	 * @memberOf module:twgl/programs
	 */
	function createUniformSetters(gl, program) {
	  let textureUnit = 0;

	  /**
	   * Creates a setter for a uniform of the given program with it's
	   * location embedded in the setter.
	   * @param {WebGLProgram} program
	   * @param {WebGLUniformInfo} uniformInfo
	   * @returns {function} the created setter.
	   */
	  function createUniformSetter(program, uniformInfo) {
	    const location = gl.getUniformLocation(program, uniformInfo.name);
	    const isArray = (uniformInfo.size > 1 && uniformInfo.name.substr(-3) === "[0]");
	    const type = uniformInfo.type;
	    const typeInfo = typeMap[type];
	    if (!typeInfo) {
	      throw new Error(`unknown type: 0x${type.toString(16)}`); // we should never get here.
	    }
	    let setter;
	    if (typeInfo.bindPoint) {
	      // it's a sampler
	      const unit = textureUnit;
	      textureUnit += uniformInfo.size;
	      if (isArray) {
	        setter = typeInfo.arraySetter(gl, type, unit, location, uniformInfo.size);
	      } else {
	        setter = typeInfo.setter(gl, type, unit, location, uniformInfo.size);
	      }
	    } else {
	      if (typeInfo.arraySetter && isArray) {
	        setter = typeInfo.arraySetter(gl, location);
	      } else {
	        setter = typeInfo.setter(gl, location);
	      }
	    }
	    setter.location = location;
	    return setter;
	  }

	  const uniformSetters = { };
	  const numUniforms = gl.getProgramParameter(program, ACTIVE_UNIFORMS);

	  for (let ii = 0; ii < numUniforms; ++ii) {
	    const uniformInfo = gl.getActiveUniform(program, ii);
	    if (isBuiltIn(uniformInfo)) {
	        continue;
	    }
	    let name = uniformInfo.name;
	    // remove the array suffix.
	    if (name.substr(-3) === "[0]") {
	      name = name.substr(0, name.length - 3);
	    }
	    const setter = createUniformSetter(program, uniformInfo);
	    uniformSetters[name] = setter;
	  }
	  return uniformSetters;
	}

	/**
	 * @typedef {Object} TransformFeedbackInfo
	 * @property {number} index index of transform feedback
	 * @property {number} type GL type
	 * @property {number} size 1 - 4
	 * @memberOf module:twgl
	 */

	/**
	 * Create TransformFeedbackInfo for passing to bindTransformFeedbackInfo.
	 * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
	 * @param {WebGLProgram} program an existing WebGLProgram.
	 * @return {Object<string, module:twgl.TransformFeedbackInfo>}
	 * @memberOf module:twgl
	 */
	function createTransformFeedbackInfo(gl, program) {
	  const info = {};
	  const numVaryings = gl.getProgramParameter(program, TRANSFORM_FEEDBACK_VARYINGS);
	  for (let ii = 0; ii < numVaryings; ++ii) {
	    const varying = gl.getTransformFeedbackVarying(program, ii);
	    info[varying.name] = {
	      index: ii,
	      type: varying.type,
	      size: varying.size,
	    };
	  }
	  return info;
	}

	/**
	 * @typedef {Object} UniformData
	 * @property {number} type The WebGL type enum for this uniform
	 * @property {number} size The number of elements for this uniform
	 * @property {number} blockNdx The block index this uniform appears in
	 * @property {number} offset The byte offset in the block for this uniform's value
	 * @memberOf module:twgl
	 */

	/**
	 * The specification for one UniformBlockObject
	 *
	 * @typedef {Object} BlockSpec
	 * @property {number} index The index of the block.
	 * @property {number} size The size in bytes needed for the block
	 * @property {number[]} uniformIndices The indices of the uniforms used by the block. These indices
	 *    correspond to entries in a UniformData array in the {@link module:twgl.UniformBlockSpec}.
	 * @property {bool} usedByVertexShader Self explanatory
	 * @property {bool} usedByFragmentShader Self explanatory
	 * @property {bool} used Self explanatory
	 * @memberOf module:twgl
	 */

	/**
	 * A `UniformBlockSpec` represents the data needed to create and bind
	 * UniformBlockObjects for a given program
	 *
	 * @typedef {Object} UniformBlockSpec
	 * @property {Object.<string, module:twgl.BlockSpec> blockSpecs The BlockSpec for each block by block name
	 * @property {UniformData[]} uniformData An array of data for each uniform by uniform index.
	 * @memberOf module:twgl
	 */

	/**
	 * Creates a UniformBlockSpec for the given program.
	 *
	 * A UniformBlockSpec represents the data needed to create and bind
	 * UniformBlockObjects
	 *
	 * @param {WebGL2RenderingContext} gl A WebGL2 Rendering Context
	 * @param {WebGLProgram} program A WebGLProgram for a successfully linked program
	 * @return {module:twgl.UniformBlockSpec} The created UniformBlockSpec
	 * @memberOf module:twgl/programs
	 */
	function createUniformBlockSpecFromProgram(gl, program) {
	  const numUniforms = gl.getProgramParameter(program, ACTIVE_UNIFORMS);
	  const uniformData = [];
	  const uniformIndices = [];

	  for (let ii = 0; ii < numUniforms; ++ii) {
	    uniformIndices.push(ii);
	    uniformData.push({});
	    const uniformInfo = gl.getActiveUniform(program, ii);
	    if (isBuiltIn(uniformInfo)) {
	      break;
	    }
	    // REMOVE [0]?
	    uniformData[ii].name = uniformInfo.name;
	  }

	  [
	    [ "UNIFORM_TYPE", "type" ],
	    [ "UNIFORM_SIZE", "size" ],  // num elements
	    [ "UNIFORM_BLOCK_INDEX", "blockNdx" ],
	    [ "UNIFORM_OFFSET", "offset", ],
	  ].forEach(function(pair) {
	    const pname = pair[0];
	    const key = pair[1];
	    gl.getActiveUniforms(program, uniformIndices, gl[pname]).forEach(function(value, ndx) {
	      uniformData[ndx][key] = value;
	    });
	  });

	  const blockSpecs = {};

	  const numUniformBlocks = gl.getProgramParameter(program, ACTIVE_UNIFORM_BLOCKS);
	  for (let ii = 0; ii < numUniformBlocks; ++ii) {
	    const name = gl.getActiveUniformBlockName(program, ii);
	    const blockSpec = {
	      index: ii,
	      usedByVertexShader: gl.getActiveUniformBlockParameter(program, ii, UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER),
	      usedByFragmentShader: gl.getActiveUniformBlockParameter(program, ii, UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER),
	      size: gl.getActiveUniformBlockParameter(program, ii, UNIFORM_BLOCK_DATA_SIZE),
	      uniformIndices: gl.getActiveUniformBlockParameter(program, ii, UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES),
	    };
	    blockSpec.used = blockSpec.usedByVertexShader || blockSpec.usedByFragmentShader;
	    blockSpecs[name] = blockSpec;
	  }

	  return {
	    blockSpecs: blockSpecs,
	    uniformData: uniformData,
	  };
	}

	/**
	 * Set uniforms and binds related textures.
	 *
	 * example:
	 *
	 *     const programInfo = createProgramInfo(
	 *         gl, ["some-vs", "some-fs"]);
	 *
	 *     const tex1 = gl.createTexture();
	 *     const tex2 = gl.createTexture();
	 *
	 *     ... assume we setup the textures with data ...
	 *
	 *     const uniforms = {
	 *       u_someSampler: tex1,
	 *       u_someOtherSampler: tex2,
	 *       u_someColor: [1,0,0,1],
	 *       u_somePosition: [0,1,1],
	 *       u_someMatrix: [
	 *         1,0,0,0,
	 *         0,1,0,0,
	 *         0,0,1,0,
	 *         0,0,0,0,
	 *       ],
	 *     };
	 *
	 *     gl.useProgram(program);
	 *
	 * This will automatically bind the textures AND set the
	 * uniforms.
	 *
	 *     twgl.setUniforms(programInfo, uniforms);
	 *
	 * For the example above it is equivalent to
	 *
	 *     var texUnit = 0;
	 *     gl.activeTexture(gl.TEXTURE0 + texUnit);
	 *     gl.bindTexture(gl.TEXTURE_2D, tex1);
	 *     gl.uniform1i(u_someSamplerLocation, texUnit++);
	 *     gl.activeTexture(gl.TEXTURE0 + texUnit);
	 *     gl.bindTexture(gl.TEXTURE_2D, tex2);
	 *     gl.uniform1i(u_someSamplerLocation, texUnit++);
	 *     gl.uniform4fv(u_someColorLocation, [1, 0, 0, 1]);
	 *     gl.uniform3fv(u_somePositionLocation, [0, 1, 1]);
	 *     gl.uniformMatrix4fv(u_someMatrix, false, [
	 *         1,0,0,0,
	 *         0,1,0,0,
	 *         0,0,1,0,
	 *         0,0,0,0,
	 *       ]);
	 *
	 * Note it is perfectly reasonable to call `setUniforms` multiple times. For example
	 *
	 *     const uniforms = {
	 *       u_someSampler: tex1,
	 *       u_someOtherSampler: tex2,
	 *     };
	 *
	 *     const moreUniforms {
	 *       u_someColor: [1,0,0,1],
	 *       u_somePosition: [0,1,1],
	 *       u_someMatrix: [
	 *         1,0,0,0,
	 *         0,1,0,0,
	 *         0,0,1,0,
	 *         0,0,0,0,
	 *       ],
	 *     };
	 *
	 *     twgl.setUniforms(programInfo, uniforms);
	 *     twgl.setUniforms(programInfo, moreUniforms);
	 *
	 * You can also add WebGLSamplers to uniform samplers as in
	 *
	 *     const uniforms = {
	 *       u_someSampler: {
	 *         texture: someWebGLTexture,
	 *         sampler: someWebGLSampler,
	 *       },
	 *     };
	 *
	 * In which case both the sampler and texture will be bound to the
	 * same unit.
	 *
	 * @param {(module:twgl.ProgramInfo|Object.<string, function>)} setters a `ProgramInfo` as returned from `createProgramInfo` or the setters returned from
	 *        `createUniformSetters`.
	 * @param {Object.<string, ?>} values an object with values for the
	 *        uniforms.
	 *   You can pass multiple objects by putting them in an array or by calling with more arguments.For example
	 *
	 *     const sharedUniforms = {
	 *       u_fogNear: 10,
	 *       u_projection: ...
	 *       ...
	 *     };
	 *
	 *     const localUniforms = {
	 *       u_world: ...
	 *       u_diffuseColor: ...
	 *     };
	 *
	 *     twgl.setUniforms(programInfo, sharedUniforms, localUniforms);
	 *
	 *     // is the same as
	 *
	 *     twgl.setUniforms(programInfo, [sharedUniforms, localUniforms]);
	 *
	 *     // is the same as
	 *
	 *     twgl.setUniforms(programInfo, sharedUniforms);
	 *     twgl.setUniforms(programInfo, localUniforms};
	 *
	 * @memberOf module:twgl/programs
	 */
	function setUniforms(setters, values) {  // eslint-disable-line
	  const actualSetters = setters.uniformSetters || setters;
	  const numArgs = arguments.length;
	  for (let aNdx = 1; aNdx < numArgs; ++aNdx) {
	    const values = arguments[aNdx];
	    if (Array.isArray(values)) {
	      const numValues = values.length;
	      for (let ii = 0; ii < numValues; ++ii) {
	        setUniforms(actualSetters, values[ii]);
	      }
	    } else {
	      for (const name in values) {
	        const setter = actualSetters[name];
	        if (setter) {
	          setter(values[name]);
	        }
	      }
	    }
	  }
	}

	/**
	 * Creates setter functions for all attributes of a shader
	 * program. You can pass this to {@link module:twgl.setBuffersAndAttributes} to set all your buffers and attributes.
	 *
	 * @see {@link module:twgl.setAttributes} for example
	 * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
	 * @param {WebGLProgram} program the program to create setters for.
	 * @return {Object.<string, function>} an object with a setter for each attribute by name.
	 * @memberOf module:twgl/programs
	 */
	function createAttributeSetters(gl, program) {
	  const attribSetters = {
	  };

	  const numAttribs = gl.getProgramParameter(program, ACTIVE_ATTRIBUTES);
	  for (let ii = 0; ii < numAttribs; ++ii) {
	    const attribInfo = gl.getActiveAttrib(program, ii);
	    if (isBuiltIn(attribInfo)) {
	        continue;
	    }
	    const index = gl.getAttribLocation(program, attribInfo.name);
	    const typeInfo = attrTypeMap[attribInfo.type];
	    const setter = typeInfo.setter(gl, index, typeInfo);
	    setter.location = index;
	    attribSetters[attribInfo.name] = setter;
	  }

	  return attribSetters;
	}

	/**
	 * Sets attributes and binds buffers (deprecated... use {@link module:twgl.setBuffersAndAttributes})
	 *
	 * Example:
	 *
	 *     const program = createProgramFromScripts(
	 *         gl, ["some-vs", "some-fs");
	 *
	 *     const attribSetters = createAttributeSetters(program);
	 *
	 *     const positionBuffer = gl.createBuffer();
	 *     const texcoordBuffer = gl.createBuffer();
	 *
	 *     const attribs = {
	 *       a_position: {buffer: positionBuffer, numComponents: 3},
	 *       a_texcoord: {buffer: texcoordBuffer, numComponents: 2},
	 *     };
	 *
	 *     gl.useProgram(program);
	 *
	 * This will automatically bind the buffers AND set the
	 * attributes.
	 *
	 *     setAttributes(attribSetters, attribs);
	 *
	 * Properties of attribs. For each attrib you can add
	 * properties:
	 *
	 * *   type: the type of data in the buffer. Default = gl.FLOAT
	 * *   normalize: whether or not to normalize the data. Default = false
	 * *   stride: the stride. Default = 0
	 * *   offset: offset into the buffer. Default = 0
	 * *   divisor: the divisor for instances. Default = undefined
	 *
	 * For example if you had 3 value float positions, 2 value
	 * float texcoord and 4 value uint8 colors you'd setup your
	 * attribs like this
	 *
	 *     const attribs = {
	 *       a_position: {buffer: positionBuffer, numComponents: 3},
	 *       a_texcoord: {buffer: texcoordBuffer, numComponents: 2},
	 *       a_color: {
	 *         buffer: colorBuffer,
	 *         numComponents: 4,
	 *         type: gl.UNSIGNED_BYTE,
	 *         normalize: true,
	 *       },
	 *     };
	 *
	 * @param {Object.<string, function>} setters Attribute setters as returned from createAttributeSetters
	 * @param {Object.<string, module:twgl.AttribInfo>} buffers AttribInfos mapped by attribute name.
	 * @memberOf module:twgl/programs
	 * @deprecated use {@link module:twgl.setBuffersAndAttributes}
	 */
	function setAttributes(setters, buffers) {
	  for (const name in buffers) {
	    const setter = setters[name];
	    if (setter) {
	      setter(buffers[name]);
	    }
	  }
	}

	/**
	 * Sets attributes and buffers including the `ELEMENT_ARRAY_BUFFER` if appropriate
	 *
	 * Example:
	 *
	 *     const programInfo = createProgramInfo(
	 *         gl, ["some-vs", "some-fs");
	 *
	 *     const arrays = {
	 *       position: { numComponents: 3, data: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0], },
	 *       texcoord: { numComponents: 2, data: [0, 0, 0, 1, 1, 0, 1, 1],                 },
	 *     };
	 *
	 *     const bufferInfo = createBufferInfoFromArrays(gl, arrays);
	 *
	 *     gl.useProgram(programInfo.program);
	 *
	 * This will automatically bind the buffers AND set the
	 * attributes.
	 *
	 *     setBuffersAndAttributes(gl, programInfo, bufferInfo);
	 *
	 * For the example above it is equivalent to
	 *
	 *     gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	 *     gl.enableVertexAttribArray(a_positionLocation);
	 *     gl.vertexAttribPointer(a_positionLocation, 3, gl.FLOAT, false, 0, 0);
	 *     gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
	 *     gl.enableVertexAttribArray(a_texcoordLocation);
	 *     gl.vertexAttribPointer(a_texcoordLocation, 4, gl.FLOAT, false, 0, 0);
	 *
	 * @param {WebGLRenderingContext} gl A WebGLRenderingContext.
	 * @param {(module:twgl.ProgramInfo|Object.<string, function>)} setters A `ProgramInfo` as returned from {@link module:twgl.createProgramInfo} or Attribute setters as returned from {@link module:twgl.createAttributeSetters}
	 * @param {(module:twgl.BufferInfo|module:twgl.VertexArrayInfo)} buffers a `BufferInfo` as returned from {@link module:twgl.createBufferInfoFromArrays}.
	 *   or a `VertexArrayInfo` as returned from {@link module:twgl.createVertexArrayInfo}
	 * @memberOf module:twgl/programs
	 */
	function setBuffersAndAttributes(gl, programInfo, buffers) {
	  if (buffers.vertexArrayObject) {
	    gl.bindVertexArray(buffers.vertexArrayObject);
	  } else {
	    setAttributes(programInfo.attribSetters || programInfo, buffers.attribs);
	    if (buffers.indices) {
	      gl.bindBuffer(ELEMENT_ARRAY_BUFFER$1, buffers.indices);
	    }
	  }
	}

	/**
	 * @typedef {Object} ProgramInfo
	 * @property {WebGLProgram} program A shader program
	 * @property {Object<string, function>} uniformSetters object of setters as returned from createUniformSetters,
	 * @property {Object<string, function>} attribSetters object of setters as returned from createAttribSetters,
	 * @property {module:twgl.UniformBlockSpec} [uniformBlockSpace] a uniform block spec for making UniformBlockInfos with createUniformBlockInfo etc..
	 * @property {Object<string, module:twgl.TransformFeedbackInfo>} [transformFeedbackInfo] info for transform feedbacks
	 * @memberOf module:twgl
	 */

	/**
	 * Creates a ProgramInfo from an existing program.
	 *
	 * A ProgramInfo contains
	 *
	 *     programInfo = {
	 *        program: WebGLProgram,
	 *        uniformSetters: object of setters as returned from createUniformSetters,
	 *        attribSetters: object of setters as returned from createAttribSetters,
	 *     }
	 *
	 * @param {WebGLRenderingContext} gl The WebGLRenderingContext
	 *        to use.
	 * @param {WebGLProgram} program an existing WebGLProgram.
	 * @return {module:twgl.ProgramInfo} The created ProgramInfo.
	 * @memberOf module:twgl/programs
	 */
	function createProgramInfoFromProgram(gl, program) {
	  const uniformSetters = createUniformSetters(gl, program);
	  const attribSetters = createAttributeSetters(gl, program);
	  const programInfo = {
	    program: program,
	    uniformSetters: uniformSetters,
	    attribSetters: attribSetters,
	  };

	  if (isWebGL2(gl)) {
	    programInfo.uniformBlockSpec = createUniformBlockSpecFromProgram(gl, program);
	    programInfo.transformFeedbackInfo = createTransformFeedbackInfo(gl, program);
	  }

	  return programInfo;
	}

	/**
	 * Creates a ProgramInfo from 2 sources.
	 *
	 * A ProgramInfo contains
	 *
	 *     programInfo = {
	 *        program: WebGLProgram,
	 *        uniformSetters: object of setters as returned from createUniformSetters,
	 *        attribSetters: object of setters as returned from createAttribSetters,
	 *     }
	 *
	 * NOTE: There are 4 signatures for this function
	 *
	 *     twgl.createProgramInfo(gl, [vs, fs], options);
	 *     twgl.createProgramInfo(gl, [vs, fs], opt_errFunc);
	 *     twgl.createProgramInfo(gl, [vs, fs], opt_attribs, opt_errFunc);
	 *     twgl.createProgramInfo(gl, [vs, fs], opt_attribs, opt_locations, opt_errFunc);
	 *
	 * @param {WebGLRenderingContext} gl The WebGLRenderingContext
	 *        to use.
	 * @param {string[]} shaderSources Array of sources for the
	 *        shaders or ids. The first is assumed to be the vertex shader,
	 *        the second the fragment shader.
	 * @param {module:twgl.ProgramOptions|string[]|module:twgl.ErrorCallback} [opt_attribs] Options for the program or an array of attribs names or an error callback. Locations will be assigned by index if not passed in
	 * @param {number[]} [opt_locations|module:twgl.ErrorCallback] The locations for the. A parallel array to opt_attribs letting you assign locations or an error callback.
	 * @param {module:twgl.ErrorCallback} [opt_errorCallback] callback for errors. By default it just prints an error to the console
	 *        on error. If you want something else pass an callback. It's passed an error message.
	 * @return {module:twgl.ProgramInfo?} The created ProgramInfo or null if it failed to link or compile
	 * @memberOf module:twgl/programs
	 */
	function createProgramInfo(
	    gl, shaderSources, opt_attribs, opt_locations, opt_errorCallback) {
	  const progOptions = getProgramOptions(opt_attribs, opt_locations, opt_errorCallback);
	  let good = true;
	  shaderSources = shaderSources.map(function(source) {
	    // Lets assume if there is no \n it's an id
	    if (source.indexOf("\n") < 0) {
	      const script = getElementById(source);
	      if (!script) {
	        progOptions.errorCallback("no element with id: " + source);
	        good = false;
	      } else {
	        source = script.text;
	      }
	    }
	    return source;
	  });
	  if (!good) {
	    return null;
	  }
	  const program = createProgramFromSources(gl, shaderSources, progOptions);
	  if (!program) {
	    return null;
	  }
	  return createProgramInfoFromProgram(gl, program);
	}

	/*
	 * Copyright 2019 Gregg Tavares
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining a
	 * copy of this software and associated documentation files (the "Software"),
	 * to deal in the Software without restriction, including without limitation
	 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
	 * and/or sell copies of the Software, and to permit persons to whom the
	 * Software is furnished to do so, subject to the following conditions:
	 *
	 * The above copyright notice and this permission notice shall be included in
	 * all copies or substantial portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL
	 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
	 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
	 * DEALINGS IN THE SOFTWARE.
	 */

	const TRIANGLES                      = 0x0004;
	const UNSIGNED_SHORT$3                 = 0x1403;

	/**
	 * Drawing related functions
	 *
	 * For backward compatibility they are available at both `twgl.draw` and `twgl`
	 * itself
	 *
	 * See {@link module:twgl} for core functions
	 *
	 * @module twgl/draw
	 */

	/**
	 * Calls `gl.drawElements` or `gl.drawArrays`, whichever is appropriate
	 *
	 * normally you'd call `gl.drawElements` or `gl.drawArrays` yourself
	 * but calling this means if you switch from indexed data to non-indexed
	 * data you don't have to remember to update your draw call.
	 *
	 * @param {WebGLRenderingContext} gl A WebGLRenderingContext
	 * @param {(module:twgl.BufferInfo|module:twgl.VertexArrayInfo)} bufferInfo A BufferInfo as returned from {@link module:twgl.createBufferInfoFromArrays} or
	 *   a VertexArrayInfo as returned from {@link module:twgl.createVertexArrayInfo}
	 * @param {number} [type] eg (gl.TRIANGLES, gl.LINES, gl.POINTS, gl.TRIANGLE_STRIP, ...). Defaults to `gl.TRIANGLES`
	 * @param {number} [count] An optional count. Defaults to bufferInfo.numElements
	 * @param {number} [offset] An optional offset. Defaults to 0.
	 * @param {number} [instanceCount] An optional instanceCount. if set then `drawArraysInstanced` or `drawElementsInstanced` will be called
	 * @memberOf module:twgl/draw
	 */
	function drawBufferInfo(gl, bufferInfo, type, count, offset, instanceCount) {
	  type = type === undefined ? TRIANGLES : type;
	  const indices = bufferInfo.indices;
	  const elementType = bufferInfo.elementType;
	  const numElements = count === undefined ? bufferInfo.numElements : count;
	  offset = offset === undefined ? 0 : offset;
	  if (elementType || indices) {
	    if (instanceCount !== undefined) {
	      gl.drawElementsInstanced(type, numElements, elementType === undefined ? UNSIGNED_SHORT$3 : bufferInfo.elementType, offset, instanceCount);
	    } else {
	      gl.drawElements(type, numElements, elementType === undefined ? UNSIGNED_SHORT$3 : bufferInfo.elementType, offset);
	    }
	  } else {
	    if (instanceCount !== undefined) {
	      gl.drawArraysInstanced(type, offset, numElements, instanceCount);
	    } else {
	      gl.drawArrays(type, offset, numElements);
	    }
	  }
	}

	window.showGBufferData = false;

	const m4$1 = m4;
	const v3$1 = v3;

	/* ======== GL helper functions ======== */

	function createCanvas(description) {
	  const centeredDivHolder = document.createElement('div');
	  centeredDivHolder.setAttribute('class', 'centeredDivHolder');

	  const relativeHolder = document.createElement('div');
	  relativeHolder.setAttribute('class', 'relativeHolder');
	  centeredDivHolder.appendChild(relativeHolder);

	  const canvasesHolder = document.createElement('div');
	  canvasesHolder.setAttribute('class', 'canvasesHolder');
	  relativeHolder.appendChild(canvasesHolder);

	  const canvas = document.createElement('canvas');
	  canvas.setAttribute('class', 'inner');
	  canvas.setAttribute('id', `c`);
	  canvasesHolder.appendChild(canvas);

	  const textCanvas = document.createElement('canvas');
	  textCanvas.setAttribute('class', 'overlay');
	  textCanvas.setAttribute('id', `overlay`);
	  canvasesHolder.appendChild(textCanvas);

	  if (description !== undefined) {
	    const label = document.createElement('span');
	    label.innerHTML = description;
	    label.setAttribute('class', 'inner label');
	    canvasesHolder.appendChild(label);
	  }

	  document.body.appendChild(centeredDivHolder);
	  resizeCanvasToMatchDisplaySize(canvas);
	  return canvas;
	}

	function createGLCanvas(description) {
	  const canvas = createCanvas(description);
	  const gl = initGL(canvas);
	  return gl;
	}

	function getOverlay() {
	  const overlay = document.getElementById(`overlay`);
	  return overlay.getContext('2d');
	}

	function drawBuffer(
	    gl, programInfo, bufferInfo, uniforms, globalUniforms) {
	  gl.useProgram(programInfo.program);

	  if (globalUniforms !== undefined) {
	    setUniforms(programInfo, globalUniforms);
	  }
	  setUniforms(programInfo, uniforms);

	  setBuffersAndAttributes(gl, programInfo, bufferInfo);

	  drawBufferInfo(gl, bufferInfo);
	}

	/* ======== Utility functions ======== */

	function degToRad(degrees) {
	  return degrees * Math.PI / 180;
	}

	function randomColor$1(hue) {
	  const args = {format: 'rgbArray'};
	  if (hue !== undefined) {
	    args.hue = hue;
	  }
	  const color = randomColor_1(args);
	  const colorVec = v3$1.create(color[0] / 255, color[1] / 255, color[2] / 255);
	  return colorVec;
	}

	function randomTransform(yMin, zMax) {
	  let transform = m4$1.identity();

	  // Translate
	  const max = 6.0;
	  const randomTranslate = v3$1.create(
	      Math.random() * max * 2 - max,
	      Math.max(Math.random() * max * 2 - max, yMin),
	      Math.min(Math.random() * max * 2 - max, zMax));
	  m4$1.translate(transform, randomTranslate, transform);

	  // Rotate
	  const randomRotation = v3$1.create(
	      Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI,
	      Math.random() * 2 * Math.PI);
	  m4$1.rotateX(transform, randomRotation[0], transform);
	  m4$1.rotateY(transform, randomRotation[1], transform);
	  m4$1.rotateZ(transform, randomRotation[2], transform);

	  // Scale
	  const scaleFactor = Math.random();
	  const randomScale = v3$1.create(scaleFactor, scaleFactor, scaleFactor);
	  m4$1.scale(transform, randomScale, transform);
	  return transform;
	}

	/* ======== Private functions ======== */

	function initGL(canvas) {
	  const gl = canvas.getContext('webgl2');
	  if (!gl) {
	    window.alert('Couldn\'t get WebGL context');
	  }
	  window.gl = gl;
	  return gl;
	}

	function resizeCanvasToMatchDisplaySize(canvas) {
	  // look up the size the canvas is displayed
	  var desiredWidth = canvas.clientWidth;
	  var desiredHeight = canvas.clientHeight;

	  // if the number of pixels in the canvas doesn't match
	  // update the canvas's content size.
	  if (canvas.width != desiredWidth || canvas.height != desiredHeight) {
	    canvas.width = desiredWidth;
	    canvas.height = desiredHeight;
	  }
	}

	class FPSCounter {
	  constructor(textContext, bufferSize = 100) {
	    this.context = textContext;
	    this.startTime = performance.now();
	    this.lastFrameTime = this.startTime;
	    this.bufferSize = bufferSize;
	    this.buffer = new Array(this.bufferSize);
	    this.maxIndexSeen = 0;
	    this.runningSum =
	        0;  // so we don't have to constantly sum all buffer elements
	    this.frameIndex = 0;  // circle buffer index
	  }

	  timeSinceStart() {
	    return this.lastFrameTime - this.startTime;
	  }

	  lastFrameDelta() {
	    const lastFrameIndex =
	        (this.frameIndex + this.bufferSize) % this.bufferSize;
	    return this.buffer[this.frameIndex] - this.buffer[lastFrameIndex];
	  }

	  /**
	   * @return {float} time in ms since last frame
	   */
	  logFrame() {
	    const time = performance.now();
	    if (this.startTime === 0) {
	      this.startTime = time;
	    }

	    // Figure out if an entry needs to be removed from the historical render
	    // times
	    const toBeRemoved = this.buffer[this.frameIndex] || 0;

	    // Calculate the current time to render (time elapsed since last frame)
	    const diff = time - this.lastFrameTime;
	    // Record the current time to render, then update running sum
	    this.buffer[this.frameIndex] = diff;
	    this.runningSum -= toBeRemoved;
	    this.runningSum += diff;

	    // Increment frameIndex along circular buffer
	    this.frameIndex = (this.frameIndex + 1) % this.bufferSize;
	    this.maxIndexSeen = Math.max(this.frameIndex, this.maxIndexSeen);

	    // Update time of last recorded frame and draw FPS
	    this.lastFrameTime = time;
	    const renderTime = this.runningSum / this.maxIndexSeen;
	    drawFPS(this.context, renderTime.toFixed(2));
	    return diff;
	  }
	}

	function drawFPS(ctx, renderTime) {
	  // Resize overlay to true size (makes text smaller and sharper)
	  ctx.canvas.width = ctx.canvas.clientWidth;
	  ctx.canvas.height = ctx.canvas.clientHeight;

	  // Clear the overlay canvas
	  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	  // Update display
	  const fps = parseInt(1000.0 / renderTime);
	  const displayStr = `${renderTime} ms / ${fps} fps`;
	  const text = ctx.measureText(displayStr);

	  // Calculate text bounds
	  const textHeight =
	      text.actualBoundingBoxAscent + text.actualBoundingBoxDescent;
	  const xOffset = 10;
	  const yOffset = ctx.canvas.clientHeight - textHeight - 5;
	  const yBuffer = 4;
	  const xBuffer = 2;

	  // Draw white rect
	  ctx.fillStyle = 'white';
	  ctx.fillRect(
	      xOffset - xBuffer / 2, yOffset - textHeight - yBuffer / 2,
	      text.width + xBuffer, textHeight + yBuffer);

	  // Draw black text
	  ctx.fillStyle = 'black';
	  ctx.fillText(displayStr, xOffset, yOffset);
	}

	class Material {
	  constructor() {
	    const defaultColor = v3.create(1, 1, 1);
	    this.color = {
	      diffuse: defaultColor,
	      specular: defaultColor,
	      ambient: defaultColor,
	    };
	    this.shininess = 10.0;
	    this.shininessMax = 1000.0;
	    this.specularIntensity = 0.0;
	    this.isTextured = false;
	    this.texture = null;
	  }

	  randomize(hue) {
	    const color = randomColor$1(hue);
	    this.color.diffuse = color;
	    this.color.specular = color;
	    this.color.ambient = color;
	    this.randomizeSpecular();
	  }

	  randomizeSpecular() {
	    this.shininess = Math.random() * 200.0 + 10.0;
	    this.specularIntensity = Math.random() > 0.5 ? 1.0 : 0.0;
	  }

	  setAllColors(color) {
	    this.color.diffuse = [...color];
	    this.color.specular = [...color];
	    this.color.ambient = [...color];
	  }

	  get uniforms() {
	    const result = {
	      u_diffuseColor: this.color.diffuse,
	      u_specularColor: this.color.specular,
	      u_ambientColor: this.color.ambient,
	      u_shininess: this.shininess,
	      u_shininessMax: this.shininessMax,
	      u_specularIntensity: this.specularIntensity,
	    };

	    if (this.isTextured) {
	      result.u_texture = this.texture;
	    }

	    return result;
	  }

	  /**
	   * Add a texture to this material.
	   * NOTE: if no texture is set, a default texture needs to be set in global
	   * uniforms (right now that happens in SceneManager)
	   * @param {WebGLTexture} tex
	   */
	  addTexture(tex) {
	    this.isTextured = true;
	    this.texture = tex;
	  }
	}

	class RenderableInterface {
	  constructor(gl, initialTransform = m4.identity()) {
	    this.gl = gl;
	    this.transform = initialTransform;
	  }

	  set update(func) {
	    this.updateFunc_ = func;
	  }

	  get update() {
	    return this.updateFunc_;
	  }

	  /**
	   * Render using a WebGL context and a specific camera.
	   * @param {Object} globalUniforms uniforms passed from SceneManager applicable
	   *     to all objects
	   * @param {WebGLProgram} overrideProgramInfo
	   */
	  draw(globalUniforms, overrideProgramInfo) {
	    throw new Error('unimplemented draw()');
	  }
	}

	class Primitive extends RenderableInterface {
	  /**
	   * @param {WebGL2RenderingContext} gl
	   * @param {WebGLProgram} programInfo
	   * @param {string} type one of 'cube', 'sphere', 'plane'
	   * @param {Material} material
	   * @param {m4} transform
	   */
	  constructor(gl, type, material, transform) {
	    super(gl, transform);
	    switch (type) {
	      case 'cube':
	        this.bufferInfo = primitives.createCubeBufferInfo(this.gl, 1);
	        break;
	      case 'sphere':
	        this.bufferInfo =
	            primitives.createSphereBufferInfo(this.gl, 0.5, 24, 12);
	        break;
	      case 'plane':
	        this.bufferInfo = primitives.createPlaneBufferInfo(this.gl, 1, 1);
	        break;
	      default:
	        throw new Error(`Undefined primitive ${type}`);
	    }
	    this.tag = `primitive.${type}`;
	    this.material = material;
	  }

	  get uniforms() {
	    const uniforms = {
	      u_modelMatrix: this.transform,
	    };

	    Object.assign(uniforms, this.material.uniforms);

	    return uniforms;
	  }

	  /**
	   * Render using a WebGL context and a specific camera.
	   * @param {Object} globalUniforms uniforms passed from SceneManager applicable
	   *     to all objects
	   */
	  draw(globalUniforms, overrideProgramInfo) {
	    drawBuffer(
	        this.gl, overrideProgramInfo, this.bufferInfo, this.uniforms,
	        globalUniforms);
	  }
	}

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

	const shader$1 = {
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

	const shader$2 = {
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
  lightGeometry = vec4(u_lightColor, 1);

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

	const shader$3 = {
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

	const GLContextManager = {
	  init_: function() {
	    if (this.gl_ === undefined) {
	      this.gl_ = createGLCanvas();
	      // @TODO: remove this once I remove position buffer
	      const ext = gl.getExtension('EXT_color_buffer_float');
	      if (!ext) {
	        alert('color buffer float extension not found');
	      }
	    }
	  },
	  get gl() {
	    this.init_();
	    return this.gl_;
	  }
	};

	const ShaderManager = {
	  init_: function() {
	    if (this.shaders_ === undefined) {
	      this.shaders_ = loadShaders(GLContextManager.gl);
	    }
	  },
	  shader: function(shaderName) {
	    this.init_();
	    return this.shaders_[shaderName];
	  },
	};

	function loadShaders(gl) {
	  const shaders = {
	    'flatTexture': shader,
	    'gBuffer': shader$1,
	    'lBuffer': shader$2,
	    'phong': shader$3,
	  };

	  const result = {};
	  for (let shaderName in shaders) {
	    result[shaderName] =
	        createProgramInfo(gl, [shaders[shaderName].vs, shaders[shaderName].fs]);
	  }
	  return result;
	}

	class OverlayGrid extends RenderableInterface {
	  constructor(gl) {
	    super(gl);
	    this.items = [];
	    this.numRows = 3;
	    this.numCols = 3;
	    this.enabled = false;
	    this.defaultProgram = ShaderManager.shader('flatTexture');
	  }

	  /**
	   * Add a screen to the grid.
	   * @param {WebGLTexture} texture
	   * @param {WebGLProgram} programInfo defaults to this.defaultProgram
	   */
	  addElement(texture, programInfo = this.defaultProgram) {
	    const el = {
	      geom: this.createScreenGeometry_(texture),
	      programInfo: programInfo,
	    };
	    this.items.push(el);
	  }

	  createScreenGeometry_(texture) {
	    const i = this.items.length;

	    const screenScale = 0.4;
	    const screenPadding = 0.05;
	    const aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;

	    // Start drawing in top right corner
	    const screenOffsetX = -(screenScale + screenPadding) * aspect;
	    const screenOffsetY = -(screenScale * this.numRows) / 2;

	    // Draw in reverse order
	    const col = this.numCols - (i % this.numCols);
	    const row = this.numRows - parseInt(i / this.numRows);

	    const translateDistanceX =
	        screenOffsetX + (screenScale + screenPadding) * row;
	    const translateDistanceY =
	        screenOffsetY + (screenScale + screenPadding) * col;

	    const screenTransform = m4.identity();
	    m4.translate(
	        screenTransform, v3.create(translateDistanceX, translateDistanceY, 0),
	        screenTransform);
	    m4.rotateX(screenTransform, degToRad(-90), screenTransform);
	    m4.scale(
	        screenTransform, v3.create(screenScale, screenScale, screenScale),
	        screenTransform);

	    const mat = new Material();
	    mat.addTexture(texture);

	    return new Primitive(this.gl, 'plane', mat, screenTransform);
	  }

	  /**
	   * Render using a WebGL context and a specific camera, using each element's
	   * individual shader.
	   * @param {Object} globalUniforms uniforms passed from SceneManager applicable
	   *     to all overlay objects
	   */
	  draw(globalUniforms) {
	    if (!this.enabled) {
	      return;
	    }

	    for (let i = 0; i < this.items.length; ++i) {
	      const plane = this.items[i].geom;
	      const programInfo = this.items[i].programInfo;

	      plane.draw(globalUniforms, programInfo);
	    }
	  }
	}

	class ScreenAlignedQuad extends Primitive {
	  constructor(gl) {
	    super(
	        gl, 'plane', new Material(),
	        ScreenAlignedQuad.createScreenTransform_());
	    this.defaultProgram = ShaderManager.shader('flatTexture');
	  }

	  /**
	   * Create the transform to make this plane fill the screen.
	   * @return {m4}
	   */
	  static createScreenTransform_() {
	    const transform = m4.identity();
	    m4.rotateX(transform, degToRad(-90), transform);
	    const screenScale = 2.0;
	    m4.scale(
	        transform, v3.create(screenScale, screenScale, screenScale), transform);
	    return transform;
	  }

	  /**
	   * Initialize this object's geometry field as an untextured quad.
	   */
	  init(texture) {
	    if (texture !== undefined) {
	      this.material.addTexture(texture);
	    }
	  }

	  /**
	   * Render using a WebGL context and a specific camera.
	   * @param {Object} globalUniforms uniforms passed from SceneManager applicable
	   *     to all overlay objects
	   */
	  draw(globalUniforms) {
	    super.draw(globalUniforms, this.defaultProgram);
	  }
	}

	class SceneManager {
	  constructor() {
	    this.gl = GLContextManager.gl;
	    this.hud = new OverlayGrid(this.gl);
	    this.geometry = {
	      main: [],
	      lights: [],
	      overlay: [this.hud],
	    };
	    this.cameras = [];
	  }

	  /**
	   * Add a camera to the scene.
	   * @param {Camera} camera
	   */
	  addCamera(camera) {
	    this.cameras.push(camera);
	  }

	  /**
	   * Add a renderable object to the scene.
	   * @param {(Primitive|Mesh)} geom
	   */
	  addGeom(geom) {
	    this.geometry.main.push(geom);
	  }

	  addScreenAlignedQuad(texture) {
	    const quad = new ScreenAlignedQuad(this.gl);
	    quad.init(texture);
	    // Needs to be unshift because we draw overlay elements back to front.
	    this.geometry.overlay.unshift(quad);
	  }

	  /**
	   * Add a light to the scene.
	   * @param {Light} light
	   */
	  addLight(light) {
	    this.geometry.lights.push(light);
	  }

	  /**
	   * Add the color and depth attachments from a BufferTarget as HUD elements.
	   * @param {BufferTarget} buffer
	   */
	  addBufferAttachmentsToHUD(buffer) {
	    for (let el in buffer.colorAttachments) {
	      this.addTextureToHUD(buffer.colorAttachments[el]);
	    }
	    this.addTextureToHUD(buffer.depthAttachment);
	  }

	  /**
	   * Add a single color or depth attachment as a HUD element.
	   * @param {WebGLTexture} texture
	   */
	  addTextureToHUD(texture) {
	    this.hud.addElement(texture);
	  }
	}

	class Camera {
	  /**
	   * @param {v3} eye
	   * @param {v3} target
	   * @param {v3} up
	   * @param {float} aspect camera's aspect ratio, usually from gl context
	   * @param {number} fovDegrees field of view, in degrees
	   */
	  constructor(eye, target, up, aspect, fovDegrees) {
	    this.position = eye;
	    this.target = target;
	    this.up = up;
	    this.fov = degToRad(fovDegrees);
	    this.aspect = aspect;
	    this.near = 0.1;
	    this.far = 100.0;
	    this.tag = 'camera';
	    this.transform = m4.identity();
	    this.targetTransform = m4.identity();
	  }

	  get position() {
	    return this.eye;
	  }

	  set position(val) {
	    this.eye = val;
	  }

	  get viewMatrix() {
	    // m4.lookAt creates a camera matrix, not a view matrix. This needs to be
	    // inverted to turn it into a view matrix
	    return m4.inverse(m4.lookAt(
	        m4.transformPoint(this.transform, this.position),
	        m4.transformPoint(this.targetTransform, this.target), this.up));
	  }

	  get projMatrix() {
	    return m4.perspective(this.fov, this.aspect, this.near, this.far);
	  }
	}

	class Light extends Primitive {
	  constructor(gl, position, radius, color) {
	    const material = new Material();
	    material.setAllColors(color);
	    super(gl, 'sphere', material);

	    this.setAttenuationInfo(color, radius);

	    const initialTransform = m4.identity();
	    m4.translate(initialTransform, position, initialTransform);
	    m4.scale(
	        initialTransform, v3.create(this.radius, this.radius, this.radius),
	        initialTransform);

	    this.transform = initialTransform;
	    this.position = position;
	    this.color = color;

	    this.tag = 'light';
	  }

	  get uniforms() {
	    const uniforms = super.uniforms;
	    uniforms.u_lightPos = this.position;
	    uniforms.u_lightRadius = this.radius;
	    uniforms.u_lightColor = this.color;
	    uniforms.u_lightConstant = this.attenuation.constant;
	    uniforms.u_lightLinear = this.attenuation.linear;
	    uniforms.u_lightQuadratic = this.attenuation.quadratic;
	    return uniforms;
	  }

	  /**
	   * Calculates attenuation factors that will give the light something sort of
	   * close to the desired radius, but in practice probably a bit smaller.
	   * Doesn't really matter because most of the light falls in the first 20% of
	   * its range.
	   * @param {v3} color
	   * @param {float} radius the desired radius
	   */
	  setAttenuationInfo(color, radius) {
	    this.attenuation = {
	      constant: 1.0,
	      linear: 4.5 / radius,
	      quadratic: 75.0 / (radius * radius),
	    };
	    const lightMax = Math.max(color[0], color[1], color[2]);
	    this.radius =
	        (-this.attenuation.linear +
	         Math.sqrt(
	             this.attenuation.linear * this.attenuation.linear -
	             4 * this.attenuation.quadratic *
	                 (this.attenuation.constant - (256.0 / 5.0) * lightMax))) /
	        (2 * this.attenuation.quadratic);
	  }
	}

	const TextureManager = {
	  init_: function() {
	    if (this.textures_ === undefined) {
	      this.textures_ = createTextures(GLContextManager.gl);
	    }
	  },
	  texture: function(textureName) {
	    this.init_();
	    return this.textures_[textureName];
	  },
	  get textures() {
	    this.init_();
	    return this.textures_;
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

	  const blankTexture = gl.createTexture();
	  gl.bindTexture(gl.TEXTURE_2D, blankTexture);
	  gl.texImage2D(
	      gl.TEXTURE_2D, 0, gl.LUMINANCE, 1, 1, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE,
	      new Uint8Array([0xFF]));

	  textures.blankTexture = blankTexture;

	  // Load uv checker texture
	  // @TODO: add support for loading multiple textures
	  const imgTexture = gl.createTexture();
	  gl.bindTexture(gl.TEXTURE_2D, imgTexture);
	  gl.texImage2D(
	      gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
	      new Uint8Array([0x00, 0x00, 0xFF, 0xFF]));
	  var image = new Image();
	  image.src = 'resources/uvcheck.png';
	  image.addEventListener('load', function() {
	    gl.bindTexture(gl.TEXTURE_2D, imgTexture);
	    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	    gl.generateMipmap(gl.TEXTURE_2D);
	  });
	  textures.uvcheck = imgTexture;

	  gl.bindTexture(gl.TEXTURE_2D, null);

	  return textures;
	}

	function createSimpleScene(gl) {
	  const graph = new SceneManager();

	  createCameras(gl, graph);

	  createLights(gl, graph);

	  createGeometry(gl, graph);

	  return graph;
	}

	// Assign an update(t) function to SceneManager
	SceneManager.prototype.update =
	    function(t) {
	  const secondsPerRotation = 60.0;
	  const rotationsPerMs = 1.0 / secondsPerRotation / 1000;
	  const rotationRadians = rotationsPerMs * 2 * Math.PI * t;
	  const camera = this.cameras[0];
	  camera.transform = m4.identity();
	  m4.rotateY(camera.transform, rotationRadians, camera.transform);
	  m4.translate(camera.transform, v3.create(0, 4, 8), camera.transform);

	  for (const el of this.geometry.main) {
	    if (el.update !== undefined) {
	      el.update(t);
	    }
	  }
	};

	function createCameras(gl, graph) {
	  const aspect =
	      parseFloat(gl.canvas.clientWidth) / parseFloat(gl.canvas.clientHeight);
	  const fovDegrees = 45.0;
	  const eye = [0, 0, 0];
	  const target = [0, 0, 0];
	  const up = [0, 1, 0];

	  const camera = new Camera(eye, target, up, aspect, fovDegrees);
	  graph.addCamera(camera);
	}

	function createLights(gl, graph) {
	  const lights = {
	    0: v3.create(1, 0.5, 0.5),
	    1: v3.create(0.5, 1, 0.5),
	    2: v3.create(1, 1, 1),
	  };
	  for (const lightNdx in lights) {
	    const x = -5 + lightNdx * 5;
	    const lightPos = v3.create(x, 0, 0);
	    const lightColor = lights[lightNdx];
	    const lightRadius = 20.0;
	    const light = new Light(gl, lightPos, lightRadius, lightColor);
	    graph.addLight(light);
	  }

	  const directionalLight =
	      new Light(gl, v3.create(0, 10, 0), 200.0, v3.create(1, 1, 1));
	  graph.addLight(directionalLight);
	}

	function createGeometry(gl, graph) {
	  const numCubes = 0;
	  for (let i = 0; i < numCubes; ++i) {
	    const cubeTransform = randomTransform(0.0, 0.0);
	    const cubeMat = new Material();
	    cubeMat.randomize();
	    cubeMat.shininess = 32.0;
	    const cube = new Primitive(gl, 'cube', cubeMat, cubeTransform);
	    graph.addGeom(cube);
	  }

	  for (let level = 0; level < 4; ++level) {
	    const y = -0.5;
	    const numSpheres = 8 * level || 1;
	    const radius = 2 * level;
	    createRingOfSpheres(gl, graph, y, numSpheres, radius);
	  }

	  const xRotations = [0, Math.PI, Math.PI / 2, 3 * Math.PI / 2];
	  const zRotations = [Math.PI / 2, 3 * Math.PI / 2];
	  for (let rotation of xRotations) {
	    const planeTransform = m4.identity();
	    m4.rotateX(planeTransform, rotation, planeTransform);
	    const plane = createWall(planeTransform);
	    graph.addGeom(plane);
	  }

	  for (let rotation of zRotations) {
	    const planeTransform = m4.identity();
	    m4.rotateZ(planeTransform, rotation, planeTransform);
	    const plane = createWall(planeTransform);
	    graph.addGeom(plane);
	  }
	}

	function createWall(planeTransform) {
	  m4.translate(planeTransform, [0, -10, 0], planeTransform);
	  m4.scale(planeTransform, [20, 20, 20], planeTransform);
	  const planeMat = new Material();
	  planeMat.addTexture(TextureManager.texture('uvcheck'));
	  return new Primitive(gl, 'plane', planeMat, planeTransform);
	}

	function createRingOfSpheres(gl, graph, startY, numSpheres, radius) {
	  for (let i = 0; i < numSpheres; ++i) {
	    const sphereTransform = m4.identity();

	    const sphereMat = new Material();
	    sphereMat.addTexture(TextureManager.texture('uvcheck'));
	    sphereMat.randomizeSpecular();
	    const sphere = new Primitive(gl, 'sphere', sphereMat, sphereTransform);
	    sphere.update = function(t) {
	      const y = startY + Math.cos(Math.PI * (t / 1000) % 4000);
	      this.transform = m4.identity();
	      m4.rotateY(this.transform, 2 * i * Math.PI / numSpheres, this.transform);
	      m4.translate(this.transform, v3.create(0, y, radius), this.transform);
	    };
	    graph.addGeom(sphere);
	  }
	}

	class RenderTargetInterface {
	  constructor(gl, width, height) {
	    this.gl = gl;
	    this.width = width;
	    this.height = height;
	  }

	  /**
	   * Responsible at the minimum for setting the viewport and binding any
	   * framebuffers.
	   */
	  setUp() {
	    throw new Error('unimplemented setUp() method');
	  }

	  /**
	   * Responsible at the minimum for unbinding any framebuffers.
	   */
	  tearDown() {
	    throw new Error('unimplemented tearDown() method');
	  }
	}

	class BufferTarget extends RenderTargetInterface {
	  constructor(gl, width, height, colorAttachments, hasDepthAttachment = true) {
	    super(gl, width, height);
	    this.colorAttachments = {};
	    this.depthAttachment = null;
	    this.createFBO_(colorAttachments, hasDepthAttachment);
	  }

	  setUp() {
	    if (this.fbo === undefined) {
	      throw new Error('calling setUp() with undefined FBO');
	    }
	    this.bindFBO_(this.fbo);
	    this.gl.viewport(0, 0, this.width, this.height);
	  }

	  tearDown() {
	    this.unbindFBO_();
	  }

	  /**
	   * Create the framebuffer object for this target and initialize all of its
	   * attachments.
	   * @param {string[]} colorAttachments
	   * @param {bool} hasDepthAttachment
	   */
	  createFBO_(colorAttachments, hasDepthAttachment) {
	    this.fbo = this.gl.createFramebuffer();

	    this.setUp();
	    this.createColorAttachments_(colorAttachments);
	    if (hasDepthAttachment) {
	      this.createDepthAttachment_();
	    }
	    this.setDrawBuffers_();
	    this.tearDown();

	    this.validateFBO_();
	  }

	  /**
	   * Initializes and binds a texture for each named colorAttachment.
	   * Warning: will unbind texture.
	   * @param {string[]} colorAttachments
	   */
	  createColorAttachments_(colorAttachments) {
	    const gl = this.gl;
	    for (let i = 0; i < colorAttachments.length; ++i) {
	      const attachmentName = colorAttachments[i];
	      const tex = gl.createTexture();
	      gl.bindTexture(gl.TEXTURE_2D, tex);
	      // @TODO: revert this to RGB, RGB, UNSIGNED_FLOAT once I remove position
	      // buffer, then update to RGBA when I consolidate g-buffer attachments
	      gl.texImage2D(
	          gl.TEXTURE_2D, 0, gl.RGBA16F, this.width, this.height, 0, gl.RGBA,
	          gl.FLOAT, null);
	      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	      gl.framebufferTexture2D(
	          gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, tex, 0);

	      this.colorAttachments[attachmentName] = tex;
	    }
	    gl.bindTexture(gl.TEXTURE_2D, null);
	  }

	  /**
	   * Initializes and binds a depth texture.
	   * Warning: will unbind texture.
	   */
	  createDepthAttachment_() {
	    const gl = this.gl;
	    const depth = gl.createTexture();
	    gl.bindTexture(gl.TEXTURE_2D, depth);
	    gl.texImage2D(
	        gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT32F, this.width, this.height, 0,
	        gl.DEPTH_COMPONENT, gl.FLOAT, null);
	    gl.framebufferTexture2D(
	        gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depth, 0);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

	    this.depthAttachment = depth;

	    gl.bindTexture(gl.TEXTURE_2D, null);
	  }

	  /**
	   * Sets the gl draw buffers for this render target's FBO.
	   * @param {string[]} colorAttachments
	   */
	  setDrawBuffers_() {
	    const numAttachments = Object.keys(this.colorAttachments).length;
	    const buffers = [];
	    for (let i = 0; i < numAttachments; ++i) {
	      buffers.push(this.gl.COLOR_ATTACHMENT0 + i);
	    }
	    gl.drawBuffers(buffers);
	  }

	  /**
	   * Make sure the current FBO is valid according to the WebGL specification.
	   */
	  validateFBO_() {
	    const gl = this.gl;
	    this.bindFBO_();
	    const e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
	    if (e !== gl.FRAMEBUFFER_COMPLETE) {
	      throw new Error(`incomplete fbo: ${e.toString()}`);
	    }
	    this.unbindFBO_();
	  }

	  bindFBO_() {
	    if (this.fbo === undefined) {
	      throw new Error('FBO has not yet been created');
	    }
	    this.gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
	  }

	  unbindFBO_() {
	    this.gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	  }
	}

	class ScreenTarget extends RenderTargetInterface {
	  constructor(gl) {
	    super(gl, gl.canvas.clientWidth, gl.canvas.clientHeight);
	  }

	  setUp() {
	    this.gl.viewport(0, 0, this.width, this.height);
	  }

	  tearDown() {
	    return;
	  }
	}

	class RenderPass {
	  constructor(
	      renderTarget, programInfo, renderables, camera, setUpFunc, tearDownFunc,
	      extraUniforms = {}) {
	    this.renderables = renderables;
	    this.programInfo = programInfo;
	    this.renderTarget = renderTarget;
	    this.camera = camera;
	    this.setUp = setUpFunc;
	    this.tearDown = tearDownFunc;
	    this.extraUniforms = extraUniforms;
	  }

	  get uniforms() {
	    const globalUniforms = {
	      u_viewMatrix: this.camera.viewMatrix,
	      u_projectionMatrix: this.camera.projMatrix,
	      u_cameraPos: this.camera.position,
	      u_texture: TextureManager.texture('blankTexture'),
	      u_resolutionX: this.renderTarget.width,
	      u_resolutionY: this.renderTarget.height,
	    };
	    for (let uniform in this.extraUniforms) {
	      globalUniforms[uniform] = this.extraUniforms[uniform];
	    }
	    return globalUniforms;
	  }

	  render() {
	    this.renderTarget.setUp();

	    this.setUp();
	    for (const el of this.renderables) {
	      el.draw(this.uniforms, this.programInfo);
	    }
	    this.tearDown();

	    this.renderTarget.tearDown();
	  }
	}

	function createDeferredRenderer(gl, sceneManager) {
	  const renderer = {
	    passes: createPasses(gl, sceneManager),
	    render: function() {
	      for (const renderPass of this.passes) {
	        renderPass.render();
	      }
	    }
	  };

	  addPassResultsToOverlay(renderer.passes, sceneManager);

	  return renderer;
	}

	function createPasses(gl, sceneManager) {
	  const gBufferPass = createGBufferPass(gl, sceneManager);
	  const lBufferPass =
	      createLBufferPass(gl, sceneManager, gBufferPass.renderTarget);
	  const overlayPass = createOverlayPass(gl, sceneManager);
	  return [
	    gBufferPass,
	    lBufferPass,
	    overlayPass,
	  ];
	}

	function addPassResultsToOverlay(renderPasses, sceneManager) {
	  sceneManager.addBufferAttachmentsToHUD(renderPasses[0].renderTarget);
	  sceneManager.addScreenAlignedQuad(
	      renderPasses[1].renderTarget.colorAttachments.lightingResult);
	}

	/**
	 * Create a render pass to hold gbuffer data.
	 * @param {WebGL2RenderingContext} gl
	 * @param {SceneManager} sceneManager
	 * @return {RenderPass}
	 */
	function createGBufferPass(gl, sceneManager) {
	  const attachments = ['albedo', 'normal', 'specular', 'position'];
	  const gBufferTarget = new BufferTarget(
	      gl, gl.canvas.clientWidth, gl.canvas.clientHeight, attachments);

	  const setUp = function() {
	    // Doesn't really matter, but we'll set it for now since
	    // the position buffer makes things kinda nasty
	    gl.clearColor(0, 0, 0, 1);
	    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	    gl.enable(gl.DEPTH_TEST);
	  };

	  const tearDown = function() {};

	  const gBufferPass = new RenderPass(
	      gBufferTarget, ShaderManager.shader('gBuffer'),
	      sceneManager.geometry.main, sceneManager.cameras[0], setUp, tearDown, {});
	  return gBufferPass;
	}

	/**
	 * Create a render pass to hold lighting results.
	 * @param {WebGL2RenderingContext} gl
	 * @param {SceneManager} sceneManager
	 * @param {BufferTarget} gbuffer the FBO from the gbuffer pass
	 * @return {RenderPass}
	 */
	function createLBufferPass(gl, sceneManager, gbuffer) {
	  const attachments = ['lightingResult', 'lightGeometry'];
	  const lBufferTarget = new BufferTarget(
	      gl, gl.canvas.clientWidth, gl.canvas.clientHeight, attachments);

	  const setUp = function() {
	    gl.enable(gl.CULL_FACE);
	    gl.cullFace(gl.FRONT);
	    gl.clearColor(0, 0, 0, 1);
	    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	    gl.disable(gl.DEPTH_TEST);
	    gl.enable(gl.BLEND);
	    gl.blendEquation(gl.FUNC_ADD);
	    gl.blendFunc(gl.ONE, gl.ONE);
	  };

	  const tearDown = function() {
	    gl.disable(gl.CULL_FACE);
	    gl.cullFace(gl.BACK);
	    gl.disable(gl.BLEND);
	  };

	  const uniforms = {
	    u_albedoTexture: gbuffer.colorAttachments.albedo,
	    u_normalTexture: gbuffer.colorAttachments.normal,
	    u_specularTexture: gbuffer.colorAttachments.specular,
	    u_positionTexture: gbuffer.colorAttachments.position,
	  };

	  const lBufferPass = new RenderPass(
	      lBufferTarget, ShaderManager.shader('lBuffer'),
	      sceneManager.geometry.lights, sceneManager.cameras[0], setUp, tearDown,
	      uniforms);
	  return lBufferPass;
	}

	/**
	 * Create a render pass to display overlay geometry.
	 * @param {WebGL2RenderingContext} gl
	 * @param {SceneManager} sceneManager
	 * @return {RenderPass}
	 */
	function createOverlayPass(gl, sceneManager) {
	  const overlayTarget = new ScreenTarget(gl);

	  const overlayCamera = {
	    viewMatrix: m4.identity(),
	    projMatrix: m4.identity(),
	    position: v3.create(0, 0, 0),
	  };

	  const setUp = function() {
	    gl.disable(gl.DEPTH_TEST);
	    gl.clearColor(0.58, 0.78, 0.85, 1);
	    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	  };

	  const tearDown = function() {
	    gl.enable(gl.DEPTH_TEST);
	  };

	  const overlayPass = new RenderPass(
	      overlayTarget, ShaderManager.shader('flatTexture'),
	      sceneManager.geometry.overlay, overlayCamera, setUp, tearDown, {});
	  return overlayPass;
	}

	/**
	 * dat-gui JavaScript Controller Library
	 * http://code.google.com/p/dat-gui
	 *
	 * Copyright 2011 Data Arts Team, Google Creative Lab
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 * http://www.apache.org/licenses/LICENSE-2.0
	 */

	function ___$insertStyle(css) {
	  if (!css) {
	    return;
	  }
	  if (typeof window === 'undefined') {
	    return;
	  }

	  var style = document.createElement('style');

	  style.setAttribute('type', 'text/css');
	  style.innerHTML = css;
	  document.head.appendChild(style);

	  return css;
	}

	function colorToString (color, forceCSSHex) {
	  var colorFormat = color.__state.conversionName.toString();
	  var r = Math.round(color.r);
	  var g = Math.round(color.g);
	  var b = Math.round(color.b);
	  var a = color.a;
	  var h = Math.round(color.h);
	  var s = color.s.toFixed(1);
	  var v = color.v.toFixed(1);
	  if (forceCSSHex || colorFormat === 'THREE_CHAR_HEX' || colorFormat === 'SIX_CHAR_HEX') {
	    var str = color.hex.toString(16);
	    while (str.length < 6) {
	      str = '0' + str;
	    }
	    return '#' + str;
	  } else if (colorFormat === 'CSS_RGB') {
	    return 'rgb(' + r + ',' + g + ',' + b + ')';
	  } else if (colorFormat === 'CSS_RGBA') {
	    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
	  } else if (colorFormat === 'HEX') {
	    return '0x' + color.hex.toString(16);
	  } else if (colorFormat === 'RGB_ARRAY') {
	    return '[' + r + ',' + g + ',' + b + ']';
	  } else if (colorFormat === 'RGBA_ARRAY') {
	    return '[' + r + ',' + g + ',' + b + ',' + a + ']';
	  } else if (colorFormat === 'RGB_OBJ') {
	    return '{r:' + r + ',g:' + g + ',b:' + b + '}';
	  } else if (colorFormat === 'RGBA_OBJ') {
	    return '{r:' + r + ',g:' + g + ',b:' + b + ',a:' + a + '}';
	  } else if (colorFormat === 'HSV_OBJ') {
	    return '{h:' + h + ',s:' + s + ',v:' + v + '}';
	  } else if (colorFormat === 'HSVA_OBJ') {
	    return '{h:' + h + ',s:' + s + ',v:' + v + ',a:' + a + '}';
	  }
	  return 'unknown format';
	}

	var ARR_EACH = Array.prototype.forEach;
	var ARR_SLICE = Array.prototype.slice;
	var Common = {
	  BREAK: {},
	  extend: function extend(target) {
	    this.each(ARR_SLICE.call(arguments, 1), function (obj) {
	      var keys = this.isObject(obj) ? Object.keys(obj) : [];
	      keys.forEach(function (key) {
	        if (!this.isUndefined(obj[key])) {
	          target[key] = obj[key];
	        }
	      }.bind(this));
	    }, this);
	    return target;
	  },
	  defaults: function defaults(target) {
	    this.each(ARR_SLICE.call(arguments, 1), function (obj) {
	      var keys = this.isObject(obj) ? Object.keys(obj) : [];
	      keys.forEach(function (key) {
	        if (this.isUndefined(target[key])) {
	          target[key] = obj[key];
	        }
	      }.bind(this));
	    }, this);
	    return target;
	  },
	  compose: function compose() {
	    var toCall = ARR_SLICE.call(arguments);
	    return function () {
	      var args = ARR_SLICE.call(arguments);
	      for (var i = toCall.length - 1; i >= 0; i--) {
	        args = [toCall[i].apply(this, args)];
	      }
	      return args[0];
	    };
	  },
	  each: function each(obj, itr, scope) {
	    if (!obj) {
	      return;
	    }
	    if (ARR_EACH && obj.forEach && obj.forEach === ARR_EACH) {
	      obj.forEach(itr, scope);
	    } else if (obj.length === obj.length + 0) {
	      var key = void 0;
	      var l = void 0;
	      for (key = 0, l = obj.length; key < l; key++) {
	        if (key in obj && itr.call(scope, obj[key], key) === this.BREAK) {
	          return;
	        }
	      }
	    } else {
	      for (var _key in obj) {
	        if (itr.call(scope, obj[_key], _key) === this.BREAK) {
	          return;
	        }
	      }
	    }
	  },
	  defer: function defer(fnc) {
	    setTimeout(fnc, 0);
	  },
	  debounce: function debounce(func, threshold, callImmediately) {
	    var timeout = void 0;
	    return function () {
	      var obj = this;
	      var args = arguments;
	      function delayed() {
	        timeout = null;
	        if (!callImmediately) func.apply(obj, args);
	      }
	      var callNow = callImmediately || !timeout;
	      clearTimeout(timeout);
	      timeout = setTimeout(delayed, threshold);
	      if (callNow) {
	        func.apply(obj, args);
	      }
	    };
	  },
	  toArray: function toArray(obj) {
	    if (obj.toArray) return obj.toArray();
	    return ARR_SLICE.call(obj);
	  },
	  isUndefined: function isUndefined(obj) {
	    return obj === undefined;
	  },
	  isNull: function isNull(obj) {
	    return obj === null;
	  },
	  isNaN: function (_isNaN) {
	    function isNaN(_x) {
	      return _isNaN.apply(this, arguments);
	    }
	    isNaN.toString = function () {
	      return _isNaN.toString();
	    };
	    return isNaN;
	  }(function (obj) {
	    return isNaN(obj);
	  }),
	  isArray: Array.isArray || function (obj) {
	    return obj.constructor === Array;
	  },
	  isObject: function isObject(obj) {
	    return obj === Object(obj);
	  },
	  isNumber: function isNumber(obj) {
	    return obj === obj + 0;
	  },
	  isString: function isString(obj) {
	    return obj === obj + '';
	  },
	  isBoolean: function isBoolean(obj) {
	    return obj === false || obj === true;
	  },
	  isFunction: function isFunction(obj) {
	    return Object.prototype.toString.call(obj) === '[object Function]';
	  }
	};

	var INTERPRETATIONS = [
	{
	  litmus: Common.isString,
	  conversions: {
	    THREE_CHAR_HEX: {
	      read: function read(original) {
	        var test = original.match(/^#([A-F0-9])([A-F0-9])([A-F0-9])$/i);
	        if (test === null) {
	          return false;
	        }
	        return {
	          space: 'HEX',
	          hex: parseInt('0x' + test[1].toString() + test[1].toString() + test[2].toString() + test[2].toString() + test[3].toString() + test[3].toString(), 0)
	        };
	      },
	      write: colorToString
	    },
	    SIX_CHAR_HEX: {
	      read: function read(original) {
	        var test = original.match(/^#([A-F0-9]{6})$/i);
	        if (test === null) {
	          return false;
	        }
	        return {
	          space: 'HEX',
	          hex: parseInt('0x' + test[1].toString(), 0)
	        };
	      },
	      write: colorToString
	    },
	    CSS_RGB: {
	      read: function read(original) {
	        var test = original.match(/^rgb\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);
	        if (test === null) {
	          return false;
	        }
	        return {
	          space: 'RGB',
	          r: parseFloat(test[1]),
	          g: parseFloat(test[2]),
	          b: parseFloat(test[3])
	        };
	      },
	      write: colorToString
	    },
	    CSS_RGBA: {
	      read: function read(original) {
	        var test = original.match(/^rgba\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);
	        if (test === null) {
	          return false;
	        }
	        return {
	          space: 'RGB',
	          r: parseFloat(test[1]),
	          g: parseFloat(test[2]),
	          b: parseFloat(test[3]),
	          a: parseFloat(test[4])
	        };
	      },
	      write: colorToString
	    }
	  }
	},
	{
	  litmus: Common.isNumber,
	  conversions: {
	    HEX: {
	      read: function read(original) {
	        return {
	          space: 'HEX',
	          hex: original,
	          conversionName: 'HEX'
	        };
	      },
	      write: function write(color) {
	        return color.hex;
	      }
	    }
	  }
	},
	{
	  litmus: Common.isArray,
	  conversions: {
	    RGB_ARRAY: {
	      read: function read(original) {
	        if (original.length !== 3) {
	          return false;
	        }
	        return {
	          space: 'RGB',
	          r: original[0],
	          g: original[1],
	          b: original[2]
	        };
	      },
	      write: function write(color) {
	        return [color.r, color.g, color.b];
	      }
	    },
	    RGBA_ARRAY: {
	      read: function read(original) {
	        if (original.length !== 4) return false;
	        return {
	          space: 'RGB',
	          r: original[0],
	          g: original[1],
	          b: original[2],
	          a: original[3]
	        };
	      },
	      write: function write(color) {
	        return [color.r, color.g, color.b, color.a];
	      }
	    }
	  }
	},
	{
	  litmus: Common.isObject,
	  conversions: {
	    RGBA_OBJ: {
	      read: function read(original) {
	        if (Common.isNumber(original.r) && Common.isNumber(original.g) && Common.isNumber(original.b) && Common.isNumber(original.a)) {
	          return {
	            space: 'RGB',
	            r: original.r,
	            g: original.g,
	            b: original.b,
	            a: original.a
	          };
	        }
	        return false;
	      },
	      write: function write(color) {
	        return {
	          r: color.r,
	          g: color.g,
	          b: color.b,
	          a: color.a
	        };
	      }
	    },
	    RGB_OBJ: {
	      read: function read(original) {
	        if (Common.isNumber(original.r) && Common.isNumber(original.g) && Common.isNumber(original.b)) {
	          return {
	            space: 'RGB',
	            r: original.r,
	            g: original.g,
	            b: original.b
	          };
	        }
	        return false;
	      },
	      write: function write(color) {
	        return {
	          r: color.r,
	          g: color.g,
	          b: color.b
	        };
	      }
	    },
	    HSVA_OBJ: {
	      read: function read(original) {
	        if (Common.isNumber(original.h) && Common.isNumber(original.s) && Common.isNumber(original.v) && Common.isNumber(original.a)) {
	          return {
	            space: 'HSV',
	            h: original.h,
	            s: original.s,
	            v: original.v,
	            a: original.a
	          };
	        }
	        return false;
	      },
	      write: function write(color) {
	        return {
	          h: color.h,
	          s: color.s,
	          v: color.v,
	          a: color.a
	        };
	      }
	    },
	    HSV_OBJ: {
	      read: function read(original) {
	        if (Common.isNumber(original.h) && Common.isNumber(original.s) && Common.isNumber(original.v)) {
	          return {
	            space: 'HSV',
	            h: original.h,
	            s: original.s,
	            v: original.v
	          };
	        }
	        return false;
	      },
	      write: function write(color) {
	        return {
	          h: color.h,
	          s: color.s,
	          v: color.v
	        };
	      }
	    }
	  }
	}];
	var result = void 0;
	var toReturn = void 0;
	var interpret = function interpret() {
	  toReturn = false;
	  var original = arguments.length > 1 ? Common.toArray(arguments) : arguments[0];
	  Common.each(INTERPRETATIONS, function (family) {
	    if (family.litmus(original)) {
	      Common.each(family.conversions, function (conversion, conversionName) {
	        result = conversion.read(original);
	        if (toReturn === false && result !== false) {
	          toReturn = result;
	          result.conversionName = conversionName;
	          result.conversion = conversion;
	          return Common.BREAK;
	        }
	      });
	      return Common.BREAK;
	    }
	  });
	  return toReturn;
	};

	var tmpComponent = void 0;
	var ColorMath = {
	  hsv_to_rgb: function hsv_to_rgb(h, s, v) {
	    var hi = Math.floor(h / 60) % 6;
	    var f = h / 60 - Math.floor(h / 60);
	    var p = v * (1.0 - s);
	    var q = v * (1.0 - f * s);
	    var t = v * (1.0 - (1.0 - f) * s);
	    var c = [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][hi];
	    return {
	      r: c[0] * 255,
	      g: c[1] * 255,
	      b: c[2] * 255
	    };
	  },
	  rgb_to_hsv: function rgb_to_hsv(r, g, b) {
	    var min = Math.min(r, g, b);
	    var max = Math.max(r, g, b);
	    var delta = max - min;
	    var h = void 0;
	    var s = void 0;
	    if (max !== 0) {
	      s = delta / max;
	    } else {
	      return {
	        h: NaN,
	        s: 0,
	        v: 0
	      };
	    }
	    if (r === max) {
	      h = (g - b) / delta;
	    } else if (g === max) {
	      h = 2 + (b - r) / delta;
	    } else {
	      h = 4 + (r - g) / delta;
	    }
	    h /= 6;
	    if (h < 0) {
	      h += 1;
	    }
	    return {
	      h: h * 360,
	      s: s,
	      v: max / 255
	    };
	  },
	  rgb_to_hex: function rgb_to_hex(r, g, b) {
	    var hex = this.hex_with_component(0, 2, r);
	    hex = this.hex_with_component(hex, 1, g);
	    hex = this.hex_with_component(hex, 0, b);
	    return hex;
	  },
	  component_from_hex: function component_from_hex(hex, componentIndex) {
	    return hex >> componentIndex * 8 & 0xFF;
	  },
	  hex_with_component: function hex_with_component(hex, componentIndex, value) {
	    return value << (tmpComponent = componentIndex * 8) | hex & ~(0xFF << tmpComponent);
	  }
	};

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
	  return typeof obj;
	} : function (obj) {
	  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
	};











	var classCallCheck = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};

	var createClass = function () {
	  function defineProperties(target, props) {
	    for (var i = 0; i < props.length; i++) {
	      var descriptor = props[i];
	      descriptor.enumerable = descriptor.enumerable || false;
	      descriptor.configurable = true;
	      if ("value" in descriptor) descriptor.writable = true;
	      Object.defineProperty(target, descriptor.key, descriptor);
	    }
	  }

	  return function (Constructor, protoProps, staticProps) {
	    if (protoProps) defineProperties(Constructor.prototype, protoProps);
	    if (staticProps) defineProperties(Constructor, staticProps);
	    return Constructor;
	  };
	}();







	var get = function get(object, property, receiver) {
	  if (object === null) object = Function.prototype;
	  var desc = Object.getOwnPropertyDescriptor(object, property);

	  if (desc === undefined) {
	    var parent = Object.getPrototypeOf(object);

	    if (parent === null) {
	      return undefined;
	    } else {
	      return get(parent, property, receiver);
	    }
	  } else if ("value" in desc) {
	    return desc.value;
	  } else {
	    var getter = desc.get;

	    if (getter === undefined) {
	      return undefined;
	    }

	    return getter.call(receiver);
	  }
	};

	var inherits = function (subClass, superClass) {
	  if (typeof superClass !== "function" && superClass !== null) {
	    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
	  }

	  subClass.prototype = Object.create(superClass && superClass.prototype, {
	    constructor: {
	      value: subClass,
	      enumerable: false,
	      writable: true,
	      configurable: true
	    }
	  });
	  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
	};











	var possibleConstructorReturn = function (self, call) {
	  if (!self) {
	    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	  }

	  return call && (typeof call === "object" || typeof call === "function") ? call : self;
	};

	var Color = function () {
	  function Color() {
	    classCallCheck(this, Color);
	    this.__state = interpret.apply(this, arguments);
	    if (this.__state === false) {
	      throw new Error('Failed to interpret color arguments');
	    }
	    this.__state.a = this.__state.a || 1;
	  }
	  createClass(Color, [{
	    key: 'toString',
	    value: function toString() {
	      return colorToString(this);
	    }
	  }, {
	    key: 'toHexString',
	    value: function toHexString() {
	      return colorToString(this, true);
	    }
	  }, {
	    key: 'toOriginal',
	    value: function toOriginal() {
	      return this.__state.conversion.write(this);
	    }
	  }]);
	  return Color;
	}();
	function defineRGBComponent(target, component, componentHexIndex) {
	  Object.defineProperty(target, component, {
	    get: function get$$1() {
	      if (this.__state.space === 'RGB') {
	        return this.__state[component];
	      }
	      Color.recalculateRGB(this, component, componentHexIndex);
	      return this.__state[component];
	    },
	    set: function set$$1(v) {
	      if (this.__state.space !== 'RGB') {
	        Color.recalculateRGB(this, component, componentHexIndex);
	        this.__state.space = 'RGB';
	      }
	      this.__state[component] = v;
	    }
	  });
	}
	function defineHSVComponent(target, component) {
	  Object.defineProperty(target, component, {
	    get: function get$$1() {
	      if (this.__state.space === 'HSV') {
	        return this.__state[component];
	      }
	      Color.recalculateHSV(this);
	      return this.__state[component];
	    },
	    set: function set$$1(v) {
	      if (this.__state.space !== 'HSV') {
	        Color.recalculateHSV(this);
	        this.__state.space = 'HSV';
	      }
	      this.__state[component] = v;
	    }
	  });
	}
	Color.recalculateRGB = function (color, component, componentHexIndex) {
	  if (color.__state.space === 'HEX') {
	    color.__state[component] = ColorMath.component_from_hex(color.__state.hex, componentHexIndex);
	  } else if (color.__state.space === 'HSV') {
	    Common.extend(color.__state, ColorMath.hsv_to_rgb(color.__state.h, color.__state.s, color.__state.v));
	  } else {
	    throw new Error('Corrupted color state');
	  }
	};
	Color.recalculateHSV = function (color) {
	  var result = ColorMath.rgb_to_hsv(color.r, color.g, color.b);
	  Common.extend(color.__state, {
	    s: result.s,
	    v: result.v
	  });
	  if (!Common.isNaN(result.h)) {
	    color.__state.h = result.h;
	  } else if (Common.isUndefined(color.__state.h)) {
	    color.__state.h = 0;
	  }
	};
	Color.COMPONENTS = ['r', 'g', 'b', 'h', 's', 'v', 'hex', 'a'];
	defineRGBComponent(Color.prototype, 'r', 2);
	defineRGBComponent(Color.prototype, 'g', 1);
	defineRGBComponent(Color.prototype, 'b', 0);
	defineHSVComponent(Color.prototype, 'h');
	defineHSVComponent(Color.prototype, 's');
	defineHSVComponent(Color.prototype, 'v');
	Object.defineProperty(Color.prototype, 'a', {
	  get: function get$$1() {
	    return this.__state.a;
	  },
	  set: function set$$1(v) {
	    this.__state.a = v;
	  }
	});
	Object.defineProperty(Color.prototype, 'hex', {
	  get: function get$$1() {
	    if (!this.__state.space !== 'HEX') {
	      this.__state.hex = ColorMath.rgb_to_hex(this.r, this.g, this.b);
	    }
	    return this.__state.hex;
	  },
	  set: function set$$1(v) {
	    this.__state.space = 'HEX';
	    this.__state.hex = v;
	  }
	});

	var Controller = function () {
	  function Controller(object, property) {
	    classCallCheck(this, Controller);
	    this.initialValue = object[property];
	    this.domElement = document.createElement('div');
	    this.object = object;
	    this.property = property;
	    this.__onChange = undefined;
	    this.__onFinishChange = undefined;
	  }
	  createClass(Controller, [{
	    key: 'onChange',
	    value: function onChange(fnc) {
	      this.__onChange = fnc;
	      return this;
	    }
	  }, {
	    key: 'onFinishChange',
	    value: function onFinishChange(fnc) {
	      this.__onFinishChange = fnc;
	      return this;
	    }
	  }, {
	    key: 'setValue',
	    value: function setValue(newValue) {
	      this.object[this.property] = newValue;
	      if (this.__onChange) {
	        this.__onChange.call(this, newValue);
	      }
	      this.updateDisplay();
	      return this;
	    }
	  }, {
	    key: 'getValue',
	    value: function getValue() {
	      return this.object[this.property];
	    }
	  }, {
	    key: 'updateDisplay',
	    value: function updateDisplay() {
	      return this;
	    }
	  }, {
	    key: 'isModified',
	    value: function isModified() {
	      return this.initialValue !== this.getValue();
	    }
	  }]);
	  return Controller;
	}();

	var EVENT_MAP = {
	  HTMLEvents: ['change'],
	  MouseEvents: ['click', 'mousemove', 'mousedown', 'mouseup', 'mouseover'],
	  KeyboardEvents: ['keydown']
	};
	var EVENT_MAP_INV = {};
	Common.each(EVENT_MAP, function (v, k) {
	  Common.each(v, function (e) {
	    EVENT_MAP_INV[e] = k;
	  });
	});
	var CSS_VALUE_PIXELS = /(\d+(\.\d+)?)px/;
	function cssValueToPixels(val) {
	  if (val === '0' || Common.isUndefined(val)) {
	    return 0;
	  }
	  var match = val.match(CSS_VALUE_PIXELS);
	  if (!Common.isNull(match)) {
	    return parseFloat(match[1]);
	  }
	  return 0;
	}
	var dom = {
	  makeSelectable: function makeSelectable(elem, selectable) {
	    if (elem === undefined || elem.style === undefined) return;
	    elem.onselectstart = selectable ? function () {
	      return false;
	    } : function () {};
	    elem.style.MozUserSelect = selectable ? 'auto' : 'none';
	    elem.style.KhtmlUserSelect = selectable ? 'auto' : 'none';
	    elem.unselectable = selectable ? 'on' : 'off';
	  },
	  makeFullscreen: function makeFullscreen(elem, hor, vert) {
	    var vertical = vert;
	    var horizontal = hor;
	    if (Common.isUndefined(horizontal)) {
	      horizontal = true;
	    }
	    if (Common.isUndefined(vertical)) {
	      vertical = true;
	    }
	    elem.style.position = 'absolute';
	    if (horizontal) {
	      elem.style.left = 0;
	      elem.style.right = 0;
	    }
	    if (vertical) {
	      elem.style.top = 0;
	      elem.style.bottom = 0;
	    }
	  },
	  fakeEvent: function fakeEvent(elem, eventType, pars, aux) {
	    var params = pars || {};
	    var className = EVENT_MAP_INV[eventType];
	    if (!className) {
	      throw new Error('Event type ' + eventType + ' not supported.');
	    }
	    var evt = document.createEvent(className);
	    switch (className) {
	      case 'MouseEvents':
	        {
	          var clientX = params.x || params.clientX || 0;
	          var clientY = params.y || params.clientY || 0;
	          evt.initMouseEvent(eventType, params.bubbles || false, params.cancelable || true, window, params.clickCount || 1, 0,
	          0,
	          clientX,
	          clientY,
	          false, false, false, false, 0, null);
	          break;
	        }
	      case 'KeyboardEvents':
	        {
	          var init = evt.initKeyboardEvent || evt.initKeyEvent;
	          Common.defaults(params, {
	            cancelable: true,
	            ctrlKey: false,
	            altKey: false,
	            shiftKey: false,
	            metaKey: false,
	            keyCode: undefined,
	            charCode: undefined
	          });
	          init(eventType, params.bubbles || false, params.cancelable, window, params.ctrlKey, params.altKey, params.shiftKey, params.metaKey, params.keyCode, params.charCode);
	          break;
	        }
	      default:
	        {
	          evt.initEvent(eventType, params.bubbles || false, params.cancelable || true);
	          break;
	        }
	    }
	    Common.defaults(evt, aux);
	    elem.dispatchEvent(evt);
	  },
	  bind: function bind(elem, event, func, newBool) {
	    var bool = newBool || false;
	    if (elem.addEventListener) {
	      elem.addEventListener(event, func, bool);
	    } else if (elem.attachEvent) {
	      elem.attachEvent('on' + event, func);
	    }
	    return dom;
	  },
	  unbind: function unbind(elem, event, func, newBool) {
	    var bool = newBool || false;
	    if (elem.removeEventListener) {
	      elem.removeEventListener(event, func, bool);
	    } else if (elem.detachEvent) {
	      elem.detachEvent('on' + event, func);
	    }
	    return dom;
	  },
	  addClass: function addClass(elem, className) {
	    if (elem.className === undefined) {
	      elem.className = className;
	    } else if (elem.className !== className) {
	      var classes = elem.className.split(/ +/);
	      if (classes.indexOf(className) === -1) {
	        classes.push(className);
	        elem.className = classes.join(' ').replace(/^\s+/, '').replace(/\s+$/, '');
	      }
	    }
	    return dom;
	  },
	  removeClass: function removeClass(elem, className) {
	    if (className) {
	      if (elem.className === className) {
	        elem.removeAttribute('class');
	      } else {
	        var classes = elem.className.split(/ +/);
	        var index = classes.indexOf(className);
	        if (index !== -1) {
	          classes.splice(index, 1);
	          elem.className = classes.join(' ');
	        }
	      }
	    } else {
	      elem.className = undefined;
	    }
	    return dom;
	  },
	  hasClass: function hasClass(elem, className) {
	    return new RegExp('(?:^|\\s+)' + className + '(?:\\s+|$)').test(elem.className) || false;
	  },
	  getWidth: function getWidth(elem) {
	    var style = getComputedStyle(elem);
	    return cssValueToPixels(style['border-left-width']) + cssValueToPixels(style['border-right-width']) + cssValueToPixels(style['padding-left']) + cssValueToPixels(style['padding-right']) + cssValueToPixels(style.width);
	  },
	  getHeight: function getHeight(elem) {
	    var style = getComputedStyle(elem);
	    return cssValueToPixels(style['border-top-width']) + cssValueToPixels(style['border-bottom-width']) + cssValueToPixels(style['padding-top']) + cssValueToPixels(style['padding-bottom']) + cssValueToPixels(style.height);
	  },
	  getOffset: function getOffset(el) {
	    var elem = el;
	    var offset = { left: 0, top: 0 };
	    if (elem.offsetParent) {
	      do {
	        offset.left += elem.offsetLeft;
	        offset.top += elem.offsetTop;
	        elem = elem.offsetParent;
	      } while (elem);
	    }
	    return offset;
	  },
	  isActive: function isActive(elem) {
	    return elem === document.activeElement && (elem.type || elem.href);
	  }
	};

	var BooleanController = function (_Controller) {
	  inherits(BooleanController, _Controller);
	  function BooleanController(object, property) {
	    classCallCheck(this, BooleanController);
	    var _this2 = possibleConstructorReturn(this, (BooleanController.__proto__ || Object.getPrototypeOf(BooleanController)).call(this, object, property));
	    var _this = _this2;
	    _this2.__prev = _this2.getValue();
	    _this2.__checkbox = document.createElement('input');
	    _this2.__checkbox.setAttribute('type', 'checkbox');
	    function onChange() {
	      _this.setValue(!_this.__prev);
	    }
	    dom.bind(_this2.__checkbox, 'change', onChange, false);
	    _this2.domElement.appendChild(_this2.__checkbox);
	    _this2.updateDisplay();
	    return _this2;
	  }
	  createClass(BooleanController, [{
	    key: 'setValue',
	    value: function setValue(v) {
	      var toReturn = get(BooleanController.prototype.__proto__ || Object.getPrototypeOf(BooleanController.prototype), 'setValue', this).call(this, v);
	      if (this.__onFinishChange) {
	        this.__onFinishChange.call(this, this.getValue());
	      }
	      this.__prev = this.getValue();
	      return toReturn;
	    }
	  }, {
	    key: 'updateDisplay',
	    value: function updateDisplay() {
	      if (this.getValue() === true) {
	        this.__checkbox.setAttribute('checked', 'checked');
	        this.__checkbox.checked = true;
	        this.__prev = true;
	      } else {
	        this.__checkbox.checked = false;
	        this.__prev = false;
	      }
	      return get(BooleanController.prototype.__proto__ || Object.getPrototypeOf(BooleanController.prototype), 'updateDisplay', this).call(this);
	    }
	  }]);
	  return BooleanController;
	}(Controller);

	var OptionController = function (_Controller) {
	  inherits(OptionController, _Controller);
	  function OptionController(object, property, opts) {
	    classCallCheck(this, OptionController);
	    var _this2 = possibleConstructorReturn(this, (OptionController.__proto__ || Object.getPrototypeOf(OptionController)).call(this, object, property));
	    var options = opts;
	    var _this = _this2;
	    _this2.__select = document.createElement('select');
	    if (Common.isArray(options)) {
	      var map = {};
	      Common.each(options, function (element) {
	        map[element] = element;
	      });
	      options = map;
	    }
	    Common.each(options, function (value, key) {
	      var opt = document.createElement('option');
	      opt.innerHTML = key;
	      opt.setAttribute('value', value);
	      _this.__select.appendChild(opt);
	    });
	    _this2.updateDisplay();
	    dom.bind(_this2.__select, 'change', function () {
	      var desiredValue = this.options[this.selectedIndex].value;
	      _this.setValue(desiredValue);
	    });
	    _this2.domElement.appendChild(_this2.__select);
	    return _this2;
	  }
	  createClass(OptionController, [{
	    key: 'setValue',
	    value: function setValue(v) {
	      var toReturn = get(OptionController.prototype.__proto__ || Object.getPrototypeOf(OptionController.prototype), 'setValue', this).call(this, v);
	      if (this.__onFinishChange) {
	        this.__onFinishChange.call(this, this.getValue());
	      }
	      return toReturn;
	    }
	  }, {
	    key: 'updateDisplay',
	    value: function updateDisplay() {
	      if (dom.isActive(this.__select)) return this;
	      this.__select.value = this.getValue();
	      return get(OptionController.prototype.__proto__ || Object.getPrototypeOf(OptionController.prototype), 'updateDisplay', this).call(this);
	    }
	  }]);
	  return OptionController;
	}(Controller);

	var StringController = function (_Controller) {
	  inherits(StringController, _Controller);
	  function StringController(object, property) {
	    classCallCheck(this, StringController);
	    var _this2 = possibleConstructorReturn(this, (StringController.__proto__ || Object.getPrototypeOf(StringController)).call(this, object, property));
	    var _this = _this2;
	    function onChange() {
	      _this.setValue(_this.__input.value);
	    }
	    function onBlur() {
	      if (_this.__onFinishChange) {
	        _this.__onFinishChange.call(_this, _this.getValue());
	      }
	    }
	    _this2.__input = document.createElement('input');
	    _this2.__input.setAttribute('type', 'text');
	    dom.bind(_this2.__input, 'keyup', onChange);
	    dom.bind(_this2.__input, 'change', onChange);
	    dom.bind(_this2.__input, 'blur', onBlur);
	    dom.bind(_this2.__input, 'keydown', function (e) {
	      if (e.keyCode === 13) {
	        this.blur();
	      }
	    });
	    _this2.updateDisplay();
	    _this2.domElement.appendChild(_this2.__input);
	    return _this2;
	  }
	  createClass(StringController, [{
	    key: 'updateDisplay',
	    value: function updateDisplay() {
	      if (!dom.isActive(this.__input)) {
	        this.__input.value = this.getValue();
	      }
	      return get(StringController.prototype.__proto__ || Object.getPrototypeOf(StringController.prototype), 'updateDisplay', this).call(this);
	    }
	  }]);
	  return StringController;
	}(Controller);

	function numDecimals(x) {
	  var _x = x.toString();
	  if (_x.indexOf('.') > -1) {
	    return _x.length - _x.indexOf('.') - 1;
	  }
	  return 0;
	}
	var NumberController = function (_Controller) {
	  inherits(NumberController, _Controller);
	  function NumberController(object, property, params) {
	    classCallCheck(this, NumberController);
	    var _this = possibleConstructorReturn(this, (NumberController.__proto__ || Object.getPrototypeOf(NumberController)).call(this, object, property));
	    var _params = params || {};
	    _this.__min = _params.min;
	    _this.__max = _params.max;
	    _this.__step = _params.step;
	    if (Common.isUndefined(_this.__step)) {
	      if (_this.initialValue === 0) {
	        _this.__impliedStep = 1;
	      } else {
	        _this.__impliedStep = Math.pow(10, Math.floor(Math.log(Math.abs(_this.initialValue)) / Math.LN10)) / 10;
	      }
	    } else {
	      _this.__impliedStep = _this.__step;
	    }
	    _this.__precision = numDecimals(_this.__impliedStep);
	    return _this;
	  }
	  createClass(NumberController, [{
	    key: 'setValue',
	    value: function setValue(v) {
	      var _v = v;
	      if (this.__min !== undefined && _v < this.__min) {
	        _v = this.__min;
	      } else if (this.__max !== undefined && _v > this.__max) {
	        _v = this.__max;
	      }
	      if (this.__step !== undefined && _v % this.__step !== 0) {
	        _v = Math.round(_v / this.__step) * this.__step;
	      }
	      return get(NumberController.prototype.__proto__ || Object.getPrototypeOf(NumberController.prototype), 'setValue', this).call(this, _v);
	    }
	  }, {
	    key: 'min',
	    value: function min(minValue) {
	      this.__min = minValue;
	      return this;
	    }
	  }, {
	    key: 'max',
	    value: function max(maxValue) {
	      this.__max = maxValue;
	      return this;
	    }
	  }, {
	    key: 'step',
	    value: function step(stepValue) {
	      this.__step = stepValue;
	      this.__impliedStep = stepValue;
	      this.__precision = numDecimals(stepValue);
	      return this;
	    }
	  }]);
	  return NumberController;
	}(Controller);

	function roundToDecimal(value, decimals) {
	  var tenTo = Math.pow(10, decimals);
	  return Math.round(value * tenTo) / tenTo;
	}
	var NumberControllerBox = function (_NumberController) {
	  inherits(NumberControllerBox, _NumberController);
	  function NumberControllerBox(object, property, params) {
	    classCallCheck(this, NumberControllerBox);
	    var _this2 = possibleConstructorReturn(this, (NumberControllerBox.__proto__ || Object.getPrototypeOf(NumberControllerBox)).call(this, object, property, params));
	    _this2.__truncationSuspended = false;
	    var _this = _this2;
	    var prevY = void 0;
	    function onChange() {
	      var attempted = parseFloat(_this.__input.value);
	      if (!Common.isNaN(attempted)) {
	        _this.setValue(attempted);
	      }
	    }
	    function onFinish() {
	      if (_this.__onFinishChange) {
	        _this.__onFinishChange.call(_this, _this.getValue());
	      }
	    }
	    function onBlur() {
	      onFinish();
	    }
	    function onMouseDrag(e) {
	      var diff = prevY - e.clientY;
	      _this.setValue(_this.getValue() + diff * _this.__impliedStep);
	      prevY = e.clientY;
	    }
	    function onMouseUp() {
	      dom.unbind(window, 'mousemove', onMouseDrag);
	      dom.unbind(window, 'mouseup', onMouseUp);
	      onFinish();
	    }
	    function onMouseDown(e) {
	      dom.bind(window, 'mousemove', onMouseDrag);
	      dom.bind(window, 'mouseup', onMouseUp);
	      prevY = e.clientY;
	    }
	    _this2.__input = document.createElement('input');
	    _this2.__input.setAttribute('type', 'text');
	    dom.bind(_this2.__input, 'change', onChange);
	    dom.bind(_this2.__input, 'blur', onBlur);
	    dom.bind(_this2.__input, 'mousedown', onMouseDown);
	    dom.bind(_this2.__input, 'keydown', function (e) {
	      if (e.keyCode === 13) {
	        _this.__truncationSuspended = true;
	        this.blur();
	        _this.__truncationSuspended = false;
	        onFinish();
	      }
	    });
	    _this2.updateDisplay();
	    _this2.domElement.appendChild(_this2.__input);
	    return _this2;
	  }
	  createClass(NumberControllerBox, [{
	    key: 'updateDisplay',
	    value: function updateDisplay() {
	      this.__input.value = this.__truncationSuspended ? this.getValue() : roundToDecimal(this.getValue(), this.__precision);
	      return get(NumberControllerBox.prototype.__proto__ || Object.getPrototypeOf(NumberControllerBox.prototype), 'updateDisplay', this).call(this);
	    }
	  }]);
	  return NumberControllerBox;
	}(NumberController);

	function map(v, i1, i2, o1, o2) {
	  return o1 + (o2 - o1) * ((v - i1) / (i2 - i1));
	}
	var NumberControllerSlider = function (_NumberController) {
	  inherits(NumberControllerSlider, _NumberController);
	  function NumberControllerSlider(object, property, min, max, step) {
	    classCallCheck(this, NumberControllerSlider);
	    var _this2 = possibleConstructorReturn(this, (NumberControllerSlider.__proto__ || Object.getPrototypeOf(NumberControllerSlider)).call(this, object, property, { min: min, max: max, step: step }));
	    var _this = _this2;
	    _this2.__background = document.createElement('div');
	    _this2.__foreground = document.createElement('div');
	    dom.bind(_this2.__background, 'mousedown', onMouseDown);
	    dom.bind(_this2.__background, 'touchstart', onTouchStart);
	    dom.addClass(_this2.__background, 'slider');
	    dom.addClass(_this2.__foreground, 'slider-fg');
	    function onMouseDown(e) {
	      document.activeElement.blur();
	      dom.bind(window, 'mousemove', onMouseDrag);
	      dom.bind(window, 'mouseup', onMouseUp);
	      onMouseDrag(e);
	    }
	    function onMouseDrag(e) {
	      e.preventDefault();
	      var bgRect = _this.__background.getBoundingClientRect();
	      _this.setValue(map(e.clientX, bgRect.left, bgRect.right, _this.__min, _this.__max));
	      return false;
	    }
	    function onMouseUp() {
	      dom.unbind(window, 'mousemove', onMouseDrag);
	      dom.unbind(window, 'mouseup', onMouseUp);
	      if (_this.__onFinishChange) {
	        _this.__onFinishChange.call(_this, _this.getValue());
	      }
	    }
	    function onTouchStart(e) {
	      if (e.touches.length !== 1) {
	        return;
	      }
	      dom.bind(window, 'touchmove', onTouchMove);
	      dom.bind(window, 'touchend', onTouchEnd);
	      onTouchMove(e);
	    }
	    function onTouchMove(e) {
	      var clientX = e.touches[0].clientX;
	      var bgRect = _this.__background.getBoundingClientRect();
	      _this.setValue(map(clientX, bgRect.left, bgRect.right, _this.__min, _this.__max));
	    }
	    function onTouchEnd() {
	      dom.unbind(window, 'touchmove', onTouchMove);
	      dom.unbind(window, 'touchend', onTouchEnd);
	      if (_this.__onFinishChange) {
	        _this.__onFinishChange.call(_this, _this.getValue());
	      }
	    }
	    _this2.updateDisplay();
	    _this2.__background.appendChild(_this2.__foreground);
	    _this2.domElement.appendChild(_this2.__background);
	    return _this2;
	  }
	  createClass(NumberControllerSlider, [{
	    key: 'updateDisplay',
	    value: function updateDisplay() {
	      var pct = (this.getValue() - this.__min) / (this.__max - this.__min);
	      this.__foreground.style.width = pct * 100 + '%';
	      return get(NumberControllerSlider.prototype.__proto__ || Object.getPrototypeOf(NumberControllerSlider.prototype), 'updateDisplay', this).call(this);
	    }
	  }]);
	  return NumberControllerSlider;
	}(NumberController);

	var FunctionController = function (_Controller) {
	  inherits(FunctionController, _Controller);
	  function FunctionController(object, property, text) {
	    classCallCheck(this, FunctionController);
	    var _this2 = possibleConstructorReturn(this, (FunctionController.__proto__ || Object.getPrototypeOf(FunctionController)).call(this, object, property));
	    var _this = _this2;
	    _this2.__button = document.createElement('div');
	    _this2.__button.innerHTML = text === undefined ? 'Fire' : text;
	    dom.bind(_this2.__button, 'click', function (e) {
	      e.preventDefault();
	      _this.fire();
	      return false;
	    });
	    dom.addClass(_this2.__button, 'button');
	    _this2.domElement.appendChild(_this2.__button);
	    return _this2;
	  }
	  createClass(FunctionController, [{
	    key: 'fire',
	    value: function fire() {
	      if (this.__onChange) {
	        this.__onChange.call(this);
	      }
	      this.getValue().call(this.object);
	      if (this.__onFinishChange) {
	        this.__onFinishChange.call(this, this.getValue());
	      }
	    }
	  }]);
	  return FunctionController;
	}(Controller);

	var ColorController = function (_Controller) {
	  inherits(ColorController, _Controller);
	  function ColorController(object, property) {
	    classCallCheck(this, ColorController);
	    var _this2 = possibleConstructorReturn(this, (ColorController.__proto__ || Object.getPrototypeOf(ColorController)).call(this, object, property));
	    _this2.__color = new Color(_this2.getValue());
	    _this2.__temp = new Color(0);
	    var _this = _this2;
	    _this2.domElement = document.createElement('div');
	    dom.makeSelectable(_this2.domElement, false);
	    _this2.__selector = document.createElement('div');
	    _this2.__selector.className = 'selector';
	    _this2.__saturation_field = document.createElement('div');
	    _this2.__saturation_field.className = 'saturation-field';
	    _this2.__field_knob = document.createElement('div');
	    _this2.__field_knob.className = 'field-knob';
	    _this2.__field_knob_border = '2px solid ';
	    _this2.__hue_knob = document.createElement('div');
	    _this2.__hue_knob.className = 'hue-knob';
	    _this2.__hue_field = document.createElement('div');
	    _this2.__hue_field.className = 'hue-field';
	    _this2.__input = document.createElement('input');
	    _this2.__input.type = 'text';
	    _this2.__input_textShadow = '0 1px 1px ';
	    dom.bind(_this2.__input, 'keydown', function (e) {
	      if (e.keyCode === 13) {
	        onBlur.call(this);
	      }
	    });
	    dom.bind(_this2.__input, 'blur', onBlur);
	    dom.bind(_this2.__selector, 'mousedown', function ()        {
	      dom.addClass(this, 'drag').bind(window, 'mouseup', function ()        {
	        dom.removeClass(_this.__selector, 'drag');
	      });
	    });
	    dom.bind(_this2.__selector, 'touchstart', function ()        {
	      dom.addClass(this, 'drag').bind(window, 'touchend', function ()        {
	        dom.removeClass(_this.__selector, 'drag');
	      });
	    });
	    var valueField = document.createElement('div');
	    Common.extend(_this2.__selector.style, {
	      width: '122px',
	      height: '102px',
	      padding: '3px',
	      backgroundColor: '#222',
	      boxShadow: '0px 1px 3px rgba(0,0,0,0.3)'
	    });
	    Common.extend(_this2.__field_knob.style, {
	      position: 'absolute',
	      width: '12px',
	      height: '12px',
	      border: _this2.__field_knob_border + (_this2.__color.v < 0.5 ? '#fff' : '#000'),
	      boxShadow: '0px 1px 3px rgba(0,0,0,0.5)',
	      borderRadius: '12px',
	      zIndex: 1
	    });
	    Common.extend(_this2.__hue_knob.style, {
	      position: 'absolute',
	      width: '15px',
	      height: '2px',
	      borderRight: '4px solid #fff',
	      zIndex: 1
	    });
	    Common.extend(_this2.__saturation_field.style, {
	      width: '100px',
	      height: '100px',
	      border: '1px solid #555',
	      marginRight: '3px',
	      display: 'inline-block',
	      cursor: 'pointer'
	    });
	    Common.extend(valueField.style, {
	      width: '100%',
	      height: '100%',
	      background: 'none'
	    });
	    linearGradient(valueField, 'top', 'rgba(0,0,0,0)', '#000');
	    Common.extend(_this2.__hue_field.style, {
	      width: '15px',
	      height: '100px',
	      border: '1px solid #555',
	      cursor: 'ns-resize',
	      position: 'absolute',
	      top: '3px',
	      right: '3px'
	    });
	    hueGradient(_this2.__hue_field);
	    Common.extend(_this2.__input.style, {
	      outline: 'none',
	      textAlign: 'center',
	      color: '#fff',
	      border: 0,
	      fontWeight: 'bold',
	      textShadow: _this2.__input_textShadow + 'rgba(0,0,0,0.7)'
	    });
	    dom.bind(_this2.__saturation_field, 'mousedown', fieldDown);
	    dom.bind(_this2.__saturation_field, 'touchstart', fieldDown);
	    dom.bind(_this2.__field_knob, 'mousedown', fieldDown);
	    dom.bind(_this2.__field_knob, 'touchstart', fieldDown);
	    dom.bind(_this2.__hue_field, 'mousedown', fieldDownH);
	    dom.bind(_this2.__hue_field, 'touchstart', fieldDownH);
	    function fieldDown(e) {
	      setSV(e);
	      dom.bind(window, 'mousemove', setSV);
	      dom.bind(window, 'touchmove', setSV);
	      dom.bind(window, 'mouseup', fieldUpSV);
	      dom.bind(window, 'touchend', fieldUpSV);
	    }
	    function fieldDownH(e) {
	      setH(e);
	      dom.bind(window, 'mousemove', setH);
	      dom.bind(window, 'touchmove', setH);
	      dom.bind(window, 'mouseup', fieldUpH);
	      dom.bind(window, 'touchend', fieldUpH);
	    }
	    function fieldUpSV() {
	      dom.unbind(window, 'mousemove', setSV);
	      dom.unbind(window, 'touchmove', setSV);
	      dom.unbind(window, 'mouseup', fieldUpSV);
	      dom.unbind(window, 'touchend', fieldUpSV);
	      onFinish();
	    }
	    function fieldUpH() {
	      dom.unbind(window, 'mousemove', setH);
	      dom.unbind(window, 'touchmove', setH);
	      dom.unbind(window, 'mouseup', fieldUpH);
	      dom.unbind(window, 'touchend', fieldUpH);
	      onFinish();
	    }
	    function onBlur() {
	      var i = interpret(this.value);
	      if (i !== false) {
	        _this.__color.__state = i;
	        _this.setValue(_this.__color.toOriginal());
	      } else {
	        this.value = _this.__color.toString();
	      }
	    }
	    function onFinish() {
	      if (_this.__onFinishChange) {
	        _this.__onFinishChange.call(_this, _this.__color.toOriginal());
	      }
	    }
	    _this2.__saturation_field.appendChild(valueField);
	    _this2.__selector.appendChild(_this2.__field_knob);
	    _this2.__selector.appendChild(_this2.__saturation_field);
	    _this2.__selector.appendChild(_this2.__hue_field);
	    _this2.__hue_field.appendChild(_this2.__hue_knob);
	    _this2.domElement.appendChild(_this2.__input);
	    _this2.domElement.appendChild(_this2.__selector);
	    _this2.updateDisplay();
	    function setSV(e) {
	      if (e.type.indexOf('touch') === -1) {
	        e.preventDefault();
	      }
	      var fieldRect = _this.__saturation_field.getBoundingClientRect();
	      var _ref = e.touches && e.touches[0] || e,
	          clientX = _ref.clientX,
	          clientY = _ref.clientY;
	      var s = (clientX - fieldRect.left) / (fieldRect.right - fieldRect.left);
	      var v = 1 - (clientY - fieldRect.top) / (fieldRect.bottom - fieldRect.top);
	      if (v > 1) {
	        v = 1;
	      } else if (v < 0) {
	        v = 0;
	      }
	      if (s > 1) {
	        s = 1;
	      } else if (s < 0) {
	        s = 0;
	      }
	      _this.__color.v = v;
	      _this.__color.s = s;
	      _this.setValue(_this.__color.toOriginal());
	      return false;
	    }
	    function setH(e) {
	      if (e.type.indexOf('touch') === -1) {
	        e.preventDefault();
	      }
	      var fieldRect = _this.__hue_field.getBoundingClientRect();
	      var _ref2 = e.touches && e.touches[0] || e,
	          clientY = _ref2.clientY;
	      var h = 1 - (clientY - fieldRect.top) / (fieldRect.bottom - fieldRect.top);
	      if (h > 1) {
	        h = 1;
	      } else if (h < 0) {
	        h = 0;
	      }
	      _this.__color.h = h * 360;
	      _this.setValue(_this.__color.toOriginal());
	      return false;
	    }
	    return _this2;
	  }
	  createClass(ColorController, [{
	    key: 'updateDisplay',
	    value: function updateDisplay() {
	      var i = interpret(this.getValue());
	      if (i !== false) {
	        var mismatch = false;
	        Common.each(Color.COMPONENTS, function (component) {
	          if (!Common.isUndefined(i[component]) && !Common.isUndefined(this.__color.__state[component]) && i[component] !== this.__color.__state[component]) {
	            mismatch = true;
	            return {};
	          }
	        }, this);
	        if (mismatch) {
	          Common.extend(this.__color.__state, i);
	        }
	      }
	      Common.extend(this.__temp.__state, this.__color.__state);
	      this.__temp.a = 1;
	      var flip = this.__color.v < 0.5 || this.__color.s > 0.5 ? 255 : 0;
	      var _flip = 255 - flip;
	      Common.extend(this.__field_knob.style, {
	        marginLeft: 100 * this.__color.s - 7 + 'px',
	        marginTop: 100 * (1 - this.__color.v) - 7 + 'px',
	        backgroundColor: this.__temp.toHexString(),
	        border: this.__field_knob_border + 'rgb(' + flip + ',' + flip + ',' + flip + ')'
	      });
	      this.__hue_knob.style.marginTop = (1 - this.__color.h / 360) * 100 + 'px';
	      this.__temp.s = 1;
	      this.__temp.v = 1;
	      linearGradient(this.__saturation_field, 'left', '#fff', this.__temp.toHexString());
	      this.__input.value = this.__color.toString();
	      Common.extend(this.__input.style, {
	        backgroundColor: this.__color.toHexString(),
	        color: 'rgb(' + flip + ',' + flip + ',' + flip + ')',
	        textShadow: this.__input_textShadow + 'rgba(' + _flip + ',' + _flip + ',' + _flip + ',.7)'
	      });
	    }
	  }]);
	  return ColorController;
	}(Controller);
	var vendors = ['-moz-', '-o-', '-webkit-', '-ms-', ''];
	function linearGradient(elem, x, a, b) {
	  elem.style.background = '';
	  Common.each(vendors, function (vendor) {
	    elem.style.cssText += 'background: ' + vendor + 'linear-gradient(' + x + ', ' + a + ' 0%, ' + b + ' 100%); ';
	  });
	}
	function hueGradient(elem) {
	  elem.style.background = '';
	  elem.style.cssText += 'background: -moz-linear-gradient(top,  #ff0000 0%, #ff00ff 17%, #0000ff 34%, #00ffff 50%, #00ff00 67%, #ffff00 84%, #ff0000 100%);';
	  elem.style.cssText += 'background: -webkit-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);';
	  elem.style.cssText += 'background: -o-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);';
	  elem.style.cssText += 'background: -ms-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);';
	  elem.style.cssText += 'background: linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);';
	}

	var css = {
	  load: function load(url, indoc) {
	    var doc = indoc || document;
	    var link = doc.createElement('link');
	    link.type = 'text/css';
	    link.rel = 'stylesheet';
	    link.href = url;
	    doc.getElementsByTagName('head')[0].appendChild(link);
	  },
	  inject: function inject(cssContent, indoc) {
	    var doc = indoc || document;
	    var injected = document.createElement('style');
	    injected.type = 'text/css';
	    injected.innerHTML = cssContent;
	    var head = doc.getElementsByTagName('head')[0];
	    try {
	      head.appendChild(injected);
	    } catch (e) {
	    }
	  }
	};

	var saveDialogContents = "<div id=\"dg-save\" class=\"dg dialogue\">\n\n  Here's the new load parameter for your <code>GUI</code>'s constructor:\n\n  <textarea id=\"dg-new-constructor\"></textarea>\n\n  <div id=\"dg-save-locally\">\n\n    <input id=\"dg-local-storage\" type=\"checkbox\"/> Automatically save\n    values to <code>localStorage</code> on exit.\n\n    <div id=\"dg-local-explain\">The values saved to <code>localStorage</code> will\n      override those passed to <code>dat.GUI</code>'s constructor. This makes it\n      easier to work incrementally, but <code>localStorage</code> is fragile,\n      and your friends may not see the same values you do.\n\n    </div>\n\n  </div>\n\n</div>";

	var ControllerFactory = function ControllerFactory(object, property) {
	  var initialValue = object[property];
	  if (Common.isArray(arguments[2]) || Common.isObject(arguments[2])) {
	    return new OptionController(object, property, arguments[2]);
	  }
	  if (Common.isNumber(initialValue)) {
	    if (Common.isNumber(arguments[2]) && Common.isNumber(arguments[3])) {
	      if (Common.isNumber(arguments[4])) {
	        return new NumberControllerSlider(object, property, arguments[2], arguments[3], arguments[4]);
	      }
	      return new NumberControllerSlider(object, property, arguments[2], arguments[3]);
	    }
	    if (Common.isNumber(arguments[4])) {
	      return new NumberControllerBox(object, property, { min: arguments[2], max: arguments[3], step: arguments[4] });
	    }
	    return new NumberControllerBox(object, property, { min: arguments[2], max: arguments[3] });
	  }
	  if (Common.isString(initialValue)) {
	    return new StringController(object, property);
	  }
	  if (Common.isFunction(initialValue)) {
	    return new FunctionController(object, property, '');
	  }
	  if (Common.isBoolean(initialValue)) {
	    return new BooleanController(object, property);
	  }
	  return null;
	};

	function requestAnimationFrame$1(callback) {
	  setTimeout(callback, 1000 / 60);
	}
	var requestAnimationFrame$1$1 = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || requestAnimationFrame$1;

	var CenteredDiv = function () {
	  function CenteredDiv() {
	    classCallCheck(this, CenteredDiv);
	    this.backgroundElement = document.createElement('div');
	    Common.extend(this.backgroundElement.style, {
	      backgroundColor: 'rgba(0,0,0,0.8)',
	      top: 0,
	      left: 0,
	      display: 'none',
	      zIndex: '1000',
	      opacity: 0,
	      WebkitTransition: 'opacity 0.2s linear',
	      transition: 'opacity 0.2s linear'
	    });
	    dom.makeFullscreen(this.backgroundElement);
	    this.backgroundElement.style.position = 'fixed';
	    this.domElement = document.createElement('div');
	    Common.extend(this.domElement.style, {
	      position: 'fixed',
	      display: 'none',
	      zIndex: '1001',
	      opacity: 0,
	      WebkitTransition: '-webkit-transform 0.2s ease-out, opacity 0.2s linear',
	      transition: 'transform 0.2s ease-out, opacity 0.2s linear'
	    });
	    document.body.appendChild(this.backgroundElement);
	    document.body.appendChild(this.domElement);
	    var _this = this;
	    dom.bind(this.backgroundElement, 'click', function () {
	      _this.hide();
	    });
	  }
	  createClass(CenteredDiv, [{
	    key: 'show',
	    value: function show() {
	      var _this = this;
	      this.backgroundElement.style.display = 'block';
	      this.domElement.style.display = 'block';
	      this.domElement.style.opacity = 0;
	      this.domElement.style.webkitTransform = 'scale(1.1)';
	      this.layout();
	      Common.defer(function () {
	        _this.backgroundElement.style.opacity = 1;
	        _this.domElement.style.opacity = 1;
	        _this.domElement.style.webkitTransform = 'scale(1)';
	      });
	    }
	  }, {
	    key: 'hide',
	    value: function hide() {
	      var _this = this;
	      var hide = function hide() {
	        _this.domElement.style.display = 'none';
	        _this.backgroundElement.style.display = 'none';
	        dom.unbind(_this.domElement, 'webkitTransitionEnd', hide);
	        dom.unbind(_this.domElement, 'transitionend', hide);
	        dom.unbind(_this.domElement, 'oTransitionEnd', hide);
	      };
	      dom.bind(this.domElement, 'webkitTransitionEnd', hide);
	      dom.bind(this.domElement, 'transitionend', hide);
	      dom.bind(this.domElement, 'oTransitionEnd', hide);
	      this.backgroundElement.style.opacity = 0;
	      this.domElement.style.opacity = 0;
	      this.domElement.style.webkitTransform = 'scale(1.1)';
	    }
	  }, {
	    key: 'layout',
	    value: function layout() {
	      this.domElement.style.left = window.innerWidth / 2 - dom.getWidth(this.domElement) / 2 + 'px';
	      this.domElement.style.top = window.innerHeight / 2 - dom.getHeight(this.domElement) / 2 + 'px';
	    }
	  }]);
	  return CenteredDiv;
	}();

	var styleSheet = ___$insertStyle(".dg ul{list-style:none;margin:0;padding:0;width:100%;clear:both}.dg.ac{position:fixed;top:0;left:0;right:0;height:0;z-index:0}.dg:not(.ac) .main{overflow:hidden}.dg.main{-webkit-transition:opacity .1s linear;-o-transition:opacity .1s linear;-moz-transition:opacity .1s linear;transition:opacity .1s linear}.dg.main.taller-than-window{overflow-y:auto}.dg.main.taller-than-window .close-button{opacity:1;margin-top:-1px;border-top:1px solid #2c2c2c}.dg.main ul.closed .close-button{opacity:1 !important}.dg.main:hover .close-button,.dg.main .close-button.drag{opacity:1}.dg.main .close-button{-webkit-transition:opacity .1s linear;-o-transition:opacity .1s linear;-moz-transition:opacity .1s linear;transition:opacity .1s linear;border:0;line-height:19px;height:20px;cursor:pointer;text-align:center;background-color:#000}.dg.main .close-button.close-top{position:relative}.dg.main .close-button.close-bottom{position:absolute}.dg.main .close-button:hover{background-color:#111}.dg.a{float:right;margin-right:15px;overflow-y:visible}.dg.a.has-save>ul.close-top{margin-top:0}.dg.a.has-save>ul.close-bottom{margin-top:27px}.dg.a.has-save>ul.closed{margin-top:0}.dg.a .save-row{top:0;z-index:1002}.dg.a .save-row.close-top{position:relative}.dg.a .save-row.close-bottom{position:fixed}.dg li{-webkit-transition:height .1s ease-out;-o-transition:height .1s ease-out;-moz-transition:height .1s ease-out;transition:height .1s ease-out;-webkit-transition:overflow .1s linear;-o-transition:overflow .1s linear;-moz-transition:overflow .1s linear;transition:overflow .1s linear}.dg li:not(.folder){cursor:auto;height:27px;line-height:27px;padding:0 4px 0 5px}.dg li.folder{padding:0;border-left:4px solid rgba(0,0,0,0)}.dg li.title{cursor:pointer;margin-left:-4px}.dg .closed li:not(.title),.dg .closed ul li,.dg .closed ul li>*{height:0;overflow:hidden;border:0}.dg .cr{clear:both;padding-left:3px;height:27px;overflow:hidden}.dg .property-name{cursor:default;float:left;clear:left;width:40%;overflow:hidden;text-overflow:ellipsis}.dg .c{float:left;width:60%;position:relative}.dg .c input[type=text]{border:0;margin-top:4px;padding:3px;width:100%;float:right}.dg .has-slider input[type=text]{width:30%;margin-left:0}.dg .slider{float:left;width:66%;margin-left:-5px;margin-right:0;height:19px;margin-top:4px}.dg .slider-fg{height:100%}.dg .c input[type=checkbox]{margin-top:7px}.dg .c select{margin-top:5px}.dg .cr.function,.dg .cr.function .property-name,.dg .cr.function *,.dg .cr.boolean,.dg .cr.boolean *{cursor:pointer}.dg .cr.color{overflow:visible}.dg .selector{display:none;position:absolute;margin-left:-9px;margin-top:23px;z-index:10}.dg .c:hover .selector,.dg .selector.drag{display:block}.dg li.save-row{padding:0}.dg li.save-row .button{display:inline-block;padding:0px 6px}.dg.dialogue{background-color:#222;width:460px;padding:15px;font-size:13px;line-height:15px}#dg-new-constructor{padding:10px;color:#222;font-family:Monaco, monospace;font-size:10px;border:0;resize:none;box-shadow:inset 1px 1px 1px #888;word-wrap:break-word;margin:12px 0;display:block;width:440px;overflow-y:scroll;height:100px;position:relative}#dg-local-explain{display:none;font-size:11px;line-height:17px;border-radius:3px;background-color:#333;padding:8px;margin-top:10px}#dg-local-explain code{font-size:10px}#dat-gui-save-locally{display:none}.dg{color:#eee;font:11px 'Lucida Grande', sans-serif;text-shadow:0 -1px 0 #111}.dg.main::-webkit-scrollbar{width:5px;background:#1a1a1a}.dg.main::-webkit-scrollbar-corner{height:0;display:none}.dg.main::-webkit-scrollbar-thumb{border-radius:5px;background:#676767}.dg li:not(.folder){background:#1a1a1a;border-bottom:1px solid #2c2c2c}.dg li.save-row{line-height:25px;background:#dad5cb;border:0}.dg li.save-row select{margin-left:5px;width:108px}.dg li.save-row .button{margin-left:5px;margin-top:1px;border-radius:2px;font-size:9px;line-height:7px;padding:4px 4px 5px 4px;background:#c5bdad;color:#fff;text-shadow:0 1px 0 #b0a58f;box-shadow:0 -1px 0 #b0a58f;cursor:pointer}.dg li.save-row .button.gears{background:#c5bdad url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAANCAYAAAB/9ZQ7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAQJJREFUeNpiYKAU/P//PwGIC/ApCABiBSAW+I8AClAcgKxQ4T9hoMAEUrxx2QSGN6+egDX+/vWT4e7N82AMYoPAx/evwWoYoSYbACX2s7KxCxzcsezDh3evFoDEBYTEEqycggWAzA9AuUSQQgeYPa9fPv6/YWm/Acx5IPb7ty/fw+QZblw67vDs8R0YHyQhgObx+yAJkBqmG5dPPDh1aPOGR/eugW0G4vlIoTIfyFcA+QekhhHJhPdQxbiAIguMBTQZrPD7108M6roWYDFQiIAAv6Aow/1bFwXgis+f2LUAynwoIaNcz8XNx3Dl7MEJUDGQpx9gtQ8YCueB+D26OECAAQDadt7e46D42QAAAABJRU5ErkJggg==) 2px 1px no-repeat;height:7px;width:8px}.dg li.save-row .button:hover{background-color:#bab19e;box-shadow:0 -1px 0 #b0a58f}.dg li.folder{border-bottom:0}.dg li.title{padding-left:16px;background:#000 url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlI+hKgFxoCgAOw==) 6px 10px no-repeat;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.2)}.dg .closed li.title{background-image:url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlGIWqMCbWAEAOw==)}.dg .cr.boolean{border-left:3px solid #806787}.dg .cr.color{border-left:3px solid}.dg .cr.function{border-left:3px solid #e61d5f}.dg .cr.number{border-left:3px solid #2FA1D6}.dg .cr.number input[type=text]{color:#2FA1D6}.dg .cr.string{border-left:3px solid #1ed36f}.dg .cr.string input[type=text]{color:#1ed36f}.dg .cr.function:hover,.dg .cr.boolean:hover{background:#111}.dg .c input[type=text]{background:#303030;outline:none}.dg .c input[type=text]:hover{background:#3c3c3c}.dg .c input[type=text]:focus{background:#494949;color:#fff}.dg .c .slider{background:#303030;cursor:ew-resize}.dg .c .slider-fg{background:#2FA1D6;max-width:100%}.dg .c .slider:hover{background:#3c3c3c}.dg .c .slider:hover .slider-fg{background:#44abda}\n");

	css.inject(styleSheet);
	var CSS_NAMESPACE = 'dg';
	var HIDE_KEY_CODE = 72;
	var CLOSE_BUTTON_HEIGHT = 20;
	var DEFAULT_DEFAULT_PRESET_NAME = 'Default';
	var SUPPORTS_LOCAL_STORAGE = function () {
	  try {
	    return !!window.localStorage;
	  } catch (e) {
	    return false;
	  }
	}();
	var SAVE_DIALOGUE = void 0;
	var autoPlaceVirgin = true;
	var autoPlaceContainer = void 0;
	var hide = false;
	var hideableGuis = [];
	var GUI = function GUI(pars) {
	  var _this = this;
	  var params = pars || {};
	  this.domElement = document.createElement('div');
	  this.__ul = document.createElement('ul');
	  this.domElement.appendChild(this.__ul);
	  dom.addClass(this.domElement, CSS_NAMESPACE);
	  this.__folders = {};
	  this.__controllers = [];
	  this.__rememberedObjects = [];
	  this.__rememberedObjectIndecesToControllers = [];
	  this.__listening = [];
	  params = Common.defaults(params, {
	    closeOnTop: false,
	    autoPlace: true,
	    width: GUI.DEFAULT_WIDTH
	  });
	  params = Common.defaults(params, {
	    resizable: params.autoPlace,
	    hideable: params.autoPlace
	  });
	  if (!Common.isUndefined(params.load)) {
	    if (params.preset) {
	      params.load.preset = params.preset;
	    }
	  } else {
	    params.load = { preset: DEFAULT_DEFAULT_PRESET_NAME };
	  }
	  if (Common.isUndefined(params.parent) && params.hideable) {
	    hideableGuis.push(this);
	  }
	  params.resizable = Common.isUndefined(params.parent) && params.resizable;
	  if (params.autoPlace && Common.isUndefined(params.scrollable)) {
	    params.scrollable = true;
	  }
	  var useLocalStorage = SUPPORTS_LOCAL_STORAGE && localStorage.getItem(getLocalStorageHash(this, 'isLocal')) === 'true';
	  var saveToLocalStorage = void 0;
	  var titleRow = void 0;
	  Object.defineProperties(this,
	  {
	    parent: {
	      get: function get$$1() {
	        return params.parent;
	      }
	    },
	    scrollable: {
	      get: function get$$1() {
	        return params.scrollable;
	      }
	    },
	    autoPlace: {
	      get: function get$$1() {
	        return params.autoPlace;
	      }
	    },
	    closeOnTop: {
	      get: function get$$1() {
	        return params.closeOnTop;
	      }
	    },
	    preset: {
	      get: function get$$1() {
	        if (_this.parent) {
	          return _this.getRoot().preset;
	        }
	        return params.load.preset;
	      },
	      set: function set$$1(v) {
	        if (_this.parent) {
	          _this.getRoot().preset = v;
	        } else {
	          params.load.preset = v;
	        }
	        setPresetSelectIndex(this);
	        _this.revert();
	      }
	    },
	    width: {
	      get: function get$$1() {
	        return params.width;
	      },
	      set: function set$$1(v) {
	        params.width = v;
	        setWidth(_this, v);
	      }
	    },
	    name: {
	      get: function get$$1() {
	        return params.name;
	      },
	      set: function set$$1(v) {
	        params.name = v;
	        if (titleRow) {
	          titleRow.innerHTML = params.name;
	        }
	      }
	    },
	    closed: {
	      get: function get$$1() {
	        return params.closed;
	      },
	      set: function set$$1(v) {
	        params.closed = v;
	        if (params.closed) {
	          dom.addClass(_this.__ul, GUI.CLASS_CLOSED);
	        } else {
	          dom.removeClass(_this.__ul, GUI.CLASS_CLOSED);
	        }
	        this.onResize();
	        if (_this.__closeButton) {
	          _this.__closeButton.innerHTML = v ? GUI.TEXT_OPEN : GUI.TEXT_CLOSED;
	        }
	      }
	    },
	    load: {
	      get: function get$$1() {
	        return params.load;
	      }
	    },
	    useLocalStorage: {
	      get: function get$$1() {
	        return useLocalStorage;
	      },
	      set: function set$$1(bool) {
	        if (SUPPORTS_LOCAL_STORAGE) {
	          useLocalStorage = bool;
	          if (bool) {
	            dom.bind(window, 'unload', saveToLocalStorage);
	          } else {
	            dom.unbind(window, 'unload', saveToLocalStorage);
	          }
	          localStorage.setItem(getLocalStorageHash(_this, 'isLocal'), bool);
	        }
	      }
	    }
	  });
	  if (Common.isUndefined(params.parent)) {
	    this.closed = params.closed || false;
	    dom.addClass(this.domElement, GUI.CLASS_MAIN);
	    dom.makeSelectable(this.domElement, false);
	    if (SUPPORTS_LOCAL_STORAGE) {
	      if (useLocalStorage) {
	        _this.useLocalStorage = true;
	        var savedGui = localStorage.getItem(getLocalStorageHash(this, 'gui'));
	        if (savedGui) {
	          params.load = JSON.parse(savedGui);
	        }
	      }
	    }
	    this.__closeButton = document.createElement('div');
	    this.__closeButton.innerHTML = GUI.TEXT_CLOSED;
	    dom.addClass(this.__closeButton, GUI.CLASS_CLOSE_BUTTON);
	    if (params.closeOnTop) {
	      dom.addClass(this.__closeButton, GUI.CLASS_CLOSE_TOP);
	      this.domElement.insertBefore(this.__closeButton, this.domElement.childNodes[0]);
	    } else {
	      dom.addClass(this.__closeButton, GUI.CLASS_CLOSE_BOTTOM);
	      this.domElement.appendChild(this.__closeButton);
	    }
	    dom.bind(this.__closeButton, 'click', function () {
	      _this.closed = !_this.closed;
	    });
	  } else {
	    if (params.closed === undefined) {
	      params.closed = true;
	    }
	    var titleRowName = document.createTextNode(params.name);
	    dom.addClass(titleRowName, 'controller-name');
	    titleRow = addRow(_this, titleRowName);
	    var onClickTitle = function onClickTitle(e) {
	      e.preventDefault();
	      _this.closed = !_this.closed;
	      return false;
	    };
	    dom.addClass(this.__ul, GUI.CLASS_CLOSED);
	    dom.addClass(titleRow, 'title');
	    dom.bind(titleRow, 'click', onClickTitle);
	    if (!params.closed) {
	      this.closed = false;
	    }
	  }
	  if (params.autoPlace) {
	    if (Common.isUndefined(params.parent)) {
	      if (autoPlaceVirgin) {
	        autoPlaceContainer = document.createElement('div');
	        dom.addClass(autoPlaceContainer, CSS_NAMESPACE);
	        dom.addClass(autoPlaceContainer, GUI.CLASS_AUTO_PLACE_CONTAINER);
	        document.body.appendChild(autoPlaceContainer);
	        autoPlaceVirgin = false;
	      }
	      autoPlaceContainer.appendChild(this.domElement);
	      dom.addClass(this.domElement, GUI.CLASS_AUTO_PLACE);
	    }
	    if (!this.parent) {
	      setWidth(_this, params.width);
	    }
	  }
	  this.__resizeHandler = function () {
	    _this.onResizeDebounced();
	  };
	  dom.bind(window, 'resize', this.__resizeHandler);
	  dom.bind(this.__ul, 'webkitTransitionEnd', this.__resizeHandler);
	  dom.bind(this.__ul, 'transitionend', this.__resizeHandler);
	  dom.bind(this.__ul, 'oTransitionEnd', this.__resizeHandler);
	  this.onResize();
	  if (params.resizable) {
	    addResizeHandle(this);
	  }
	  saveToLocalStorage = function saveToLocalStorage() {
	    if (SUPPORTS_LOCAL_STORAGE && localStorage.getItem(getLocalStorageHash(_this, 'isLocal')) === 'true') {
	      localStorage.setItem(getLocalStorageHash(_this, 'gui'), JSON.stringify(_this.getSaveObject()));
	    }
	  };
	  this.saveToLocalStorageIfPossible = saveToLocalStorage;
	  function resetWidth() {
	    var root = _this.getRoot();
	    root.width += 1;
	    Common.defer(function () {
	      root.width -= 1;
	    });
	  }
	  if (!params.parent) {
	    resetWidth();
	  }
	};
	GUI.toggleHide = function () {
	  hide = !hide;
	  Common.each(hideableGuis, function (gui) {
	    gui.domElement.style.display = hide ? 'none' : '';
	  });
	};
	GUI.CLASS_AUTO_PLACE = 'a';
	GUI.CLASS_AUTO_PLACE_CONTAINER = 'ac';
	GUI.CLASS_MAIN = 'main';
	GUI.CLASS_CONTROLLER_ROW = 'cr';
	GUI.CLASS_TOO_TALL = 'taller-than-window';
	GUI.CLASS_CLOSED = 'closed';
	GUI.CLASS_CLOSE_BUTTON = 'close-button';
	GUI.CLASS_CLOSE_TOP = 'close-top';
	GUI.CLASS_CLOSE_BOTTOM = 'close-bottom';
	GUI.CLASS_DRAG = 'drag';
	GUI.DEFAULT_WIDTH = 245;
	GUI.TEXT_CLOSED = 'Close Controls';
	GUI.TEXT_OPEN = 'Open Controls';
	GUI._keydownHandler = function (e) {
	  if (document.activeElement.type !== 'text' && (e.which === HIDE_KEY_CODE || e.keyCode === HIDE_KEY_CODE)) {
	    GUI.toggleHide();
	  }
	};
	dom.bind(window, 'keydown', GUI._keydownHandler, false);
	Common.extend(GUI.prototype,
	{
	  add: function add(object, property) {
	    return _add(this, object, property, {
	      factoryArgs: Array.prototype.slice.call(arguments, 2)
	    });
	  },
	  addColor: function addColor(object, property) {
	    return _add(this, object, property, {
	      color: true
	    });
	  },
	  remove: function remove(controller) {
	    this.__ul.removeChild(controller.__li);
	    this.__controllers.splice(this.__controllers.indexOf(controller), 1);
	    var _this = this;
	    Common.defer(function () {
	      _this.onResize();
	    });
	  },
	  destroy: function destroy() {
	    if (this.parent) {
	      throw new Error('Only the root GUI should be removed with .destroy(). ' + 'For subfolders, use gui.removeFolder(folder) instead.');
	    }
	    if (this.autoPlace) {
	      autoPlaceContainer.removeChild(this.domElement);
	    }
	    var _this = this;
	    Common.each(this.__folders, function (subfolder) {
	      _this.removeFolder(subfolder);
	    });
	    dom.unbind(window, 'keydown', GUI._keydownHandler, false);
	    removeListeners(this);
	  },
	  addFolder: function addFolder(name) {
	    if (this.__folders[name] !== undefined) {
	      throw new Error('You already have a folder in this GUI by the' + ' name "' + name + '"');
	    }
	    var newGuiParams = { name: name, parent: this };
	    newGuiParams.autoPlace = this.autoPlace;
	    if (this.load &&
	    this.load.folders &&
	    this.load.folders[name]) {
	      newGuiParams.closed = this.load.folders[name].closed;
	      newGuiParams.load = this.load.folders[name];
	    }
	    var gui = new GUI(newGuiParams);
	    this.__folders[name] = gui;
	    var li = addRow(this, gui.domElement);
	    dom.addClass(li, 'folder');
	    return gui;
	  },
	  removeFolder: function removeFolder(folder) {
	    this.__ul.removeChild(folder.domElement.parentElement);
	    delete this.__folders[folder.name];
	    if (this.load &&
	    this.load.folders &&
	    this.load.folders[folder.name]) {
	      delete this.load.folders[folder.name];
	    }
	    removeListeners(folder);
	    var _this = this;
	    Common.each(folder.__folders, function (subfolder) {
	      folder.removeFolder(subfolder);
	    });
	    Common.defer(function () {
	      _this.onResize();
	    });
	  },
	  open: function open() {
	    this.closed = false;
	  },
	  close: function close() {
	    this.closed = true;
	  },
	  hide: function hide() {
	    this.domElement.style.display = 'none';
	  },
	  show: function show() {
	    this.domElement.style.display = '';
	  },
	  onResize: function onResize() {
	    var root = this.getRoot();
	    if (root.scrollable) {
	      var top = dom.getOffset(root.__ul).top;
	      var h = 0;
	      Common.each(root.__ul.childNodes, function (node) {
	        if (!(root.autoPlace && node === root.__save_row)) {
	          h += dom.getHeight(node);
	        }
	      });
	      if (window.innerHeight - top - CLOSE_BUTTON_HEIGHT < h) {
	        dom.addClass(root.domElement, GUI.CLASS_TOO_TALL);
	        root.__ul.style.height = window.innerHeight - top - CLOSE_BUTTON_HEIGHT + 'px';
	      } else {
	        dom.removeClass(root.domElement, GUI.CLASS_TOO_TALL);
	        root.__ul.style.height = 'auto';
	      }
	    }
	    if (root.__resize_handle) {
	      Common.defer(function () {
	        root.__resize_handle.style.height = root.__ul.offsetHeight + 'px';
	      });
	    }
	    if (root.__closeButton) {
	      root.__closeButton.style.width = root.width + 'px';
	    }
	  },
	  onResizeDebounced: Common.debounce(function () {
	    this.onResize();
	  }, 50),
	  remember: function remember() {
	    if (Common.isUndefined(SAVE_DIALOGUE)) {
	      SAVE_DIALOGUE = new CenteredDiv();
	      SAVE_DIALOGUE.domElement.innerHTML = saveDialogContents;
	    }
	    if (this.parent) {
	      throw new Error('You can only call remember on a top level GUI.');
	    }
	    var _this = this;
	    Common.each(Array.prototype.slice.call(arguments), function (object) {
	      if (_this.__rememberedObjects.length === 0) {
	        addSaveMenu(_this);
	      }
	      if (_this.__rememberedObjects.indexOf(object) === -1) {
	        _this.__rememberedObjects.push(object);
	      }
	    });
	    if (this.autoPlace) {
	      setWidth(this, this.width);
	    }
	  },
	  getRoot: function getRoot() {
	    var gui = this;
	    while (gui.parent) {
	      gui = gui.parent;
	    }
	    return gui;
	  },
	  getSaveObject: function getSaveObject() {
	    var toReturn = this.load;
	    toReturn.closed = this.closed;
	    if (this.__rememberedObjects.length > 0) {
	      toReturn.preset = this.preset;
	      if (!toReturn.remembered) {
	        toReturn.remembered = {};
	      }
	      toReturn.remembered[this.preset] = getCurrentPreset(this);
	    }
	    toReturn.folders = {};
	    Common.each(this.__folders, function (element, key) {
	      toReturn.folders[key] = element.getSaveObject();
	    });
	    return toReturn;
	  },
	  save: function save() {
	    if (!this.load.remembered) {
	      this.load.remembered = {};
	    }
	    this.load.remembered[this.preset] = getCurrentPreset(this);
	    markPresetModified(this, false);
	    this.saveToLocalStorageIfPossible();
	  },
	  saveAs: function saveAs(presetName) {
	    if (!this.load.remembered) {
	      this.load.remembered = {};
	      this.load.remembered[DEFAULT_DEFAULT_PRESET_NAME] = getCurrentPreset(this, true);
	    }
	    this.load.remembered[presetName] = getCurrentPreset(this);
	    this.preset = presetName;
	    addPresetOption(this, presetName, true);
	    this.saveToLocalStorageIfPossible();
	  },
	  revert: function revert(gui) {
	    Common.each(this.__controllers, function (controller) {
	      if (!this.getRoot().load.remembered) {
	        controller.setValue(controller.initialValue);
	      } else {
	        recallSavedValue(gui || this.getRoot(), controller);
	      }
	      if (controller.__onFinishChange) {
	        controller.__onFinishChange.call(controller, controller.getValue());
	      }
	    }, this);
	    Common.each(this.__folders, function (folder) {
	      folder.revert(folder);
	    });
	    if (!gui) {
	      markPresetModified(this.getRoot(), false);
	    }
	  },
	  listen: function listen(controller) {
	    var init = this.__listening.length === 0;
	    this.__listening.push(controller);
	    if (init) {
	      updateDisplays(this.__listening);
	    }
	  },
	  updateDisplay: function updateDisplay() {
	    Common.each(this.__controllers, function (controller) {
	      controller.updateDisplay();
	    });
	    Common.each(this.__folders, function (folder) {
	      folder.updateDisplay();
	    });
	  }
	});
	function addRow(gui, newDom, liBefore) {
	  var li = document.createElement('li');
	  if (newDom) {
	    li.appendChild(newDom);
	  }
	  if (liBefore) {
	    gui.__ul.insertBefore(li, liBefore);
	  } else {
	    gui.__ul.appendChild(li);
	  }
	  gui.onResize();
	  return li;
	}
	function removeListeners(gui) {
	  dom.unbind(window, 'resize', gui.__resizeHandler);
	  if (gui.saveToLocalStorageIfPossible) {
	    dom.unbind(window, 'unload', gui.saveToLocalStorageIfPossible);
	  }
	}
	function markPresetModified(gui, modified) {
	  var opt = gui.__preset_select[gui.__preset_select.selectedIndex];
	  if (modified) {
	    opt.innerHTML = opt.value + '*';
	  } else {
	    opt.innerHTML = opt.value;
	  }
	}
	function augmentController(gui, li, controller) {
	  controller.__li = li;
	  controller.__gui = gui;
	  Common.extend(controller,                                   {
	    options: function options(_options) {
	      if (arguments.length > 1) {
	        var nextSibling = controller.__li.nextElementSibling;
	        controller.remove();
	        return _add(gui, controller.object, controller.property, {
	          before: nextSibling,
	          factoryArgs: [Common.toArray(arguments)]
	        });
	      }
	      if (Common.isArray(_options) || Common.isObject(_options)) {
	        var _nextSibling = controller.__li.nextElementSibling;
	        controller.remove();
	        return _add(gui, controller.object, controller.property, {
	          before: _nextSibling,
	          factoryArgs: [_options]
	        });
	      }
	    },
	    name: function name(_name) {
	      controller.__li.firstElementChild.firstElementChild.innerHTML = _name;
	      return controller;
	    },
	    listen: function listen() {
	      controller.__gui.listen(controller);
	      return controller;
	    },
	    remove: function remove() {
	      controller.__gui.remove(controller);
	      return controller;
	    }
	  });
	  if (controller instanceof NumberControllerSlider) {
	    var box = new NumberControllerBox(controller.object, controller.property, { min: controller.__min, max: controller.__max, step: controller.__step });
	    Common.each(['updateDisplay', 'onChange', 'onFinishChange', 'step', 'min', 'max'], function (method) {
	      var pc = controller[method];
	      var pb = box[method];
	      controller[method] = box[method] = function () {
	        var args = Array.prototype.slice.call(arguments);
	        pb.apply(box, args);
	        return pc.apply(controller, args);
	      };
	    });
	    dom.addClass(li, 'has-slider');
	    controller.domElement.insertBefore(box.domElement, controller.domElement.firstElementChild);
	  } else if (controller instanceof NumberControllerBox) {
	    var r = function r(returned) {
	      if (Common.isNumber(controller.__min) && Common.isNumber(controller.__max)) {
	        var oldName = controller.__li.firstElementChild.firstElementChild.innerHTML;
	        var wasListening = controller.__gui.__listening.indexOf(controller) > -1;
	        controller.remove();
	        var newController = _add(gui, controller.object, controller.property, {
	          before: controller.__li.nextElementSibling,
	          factoryArgs: [controller.__min, controller.__max, controller.__step]
	        });
	        newController.name(oldName);
	        if (wasListening) newController.listen();
	        return newController;
	      }
	      return returned;
	    };
	    controller.min = Common.compose(r, controller.min);
	    controller.max = Common.compose(r, controller.max);
	  } else if (controller instanceof BooleanController) {
	    dom.bind(li, 'click', function () {
	      dom.fakeEvent(controller.__checkbox, 'click');
	    });
	    dom.bind(controller.__checkbox, 'click', function (e) {
	      e.stopPropagation();
	    });
	  } else if (controller instanceof FunctionController) {
	    dom.bind(li, 'click', function () {
	      dom.fakeEvent(controller.__button, 'click');
	    });
	    dom.bind(li, 'mouseover', function () {
	      dom.addClass(controller.__button, 'hover');
	    });
	    dom.bind(li, 'mouseout', function () {
	      dom.removeClass(controller.__button, 'hover');
	    });
	  } else if (controller instanceof ColorController) {
	    dom.addClass(li, 'color');
	    controller.updateDisplay = Common.compose(function (val) {
	      li.style.borderLeftColor = controller.__color.toString();
	      return val;
	    }, controller.updateDisplay);
	    controller.updateDisplay();
	  }
	  controller.setValue = Common.compose(function (val) {
	    if (gui.getRoot().__preset_select && controller.isModified()) {
	      markPresetModified(gui.getRoot(), true);
	    }
	    return val;
	  }, controller.setValue);
	}
	function recallSavedValue(gui, controller) {
	  var root = gui.getRoot();
	  var matchedIndex = root.__rememberedObjects.indexOf(controller.object);
	  if (matchedIndex !== -1) {
	    var controllerMap = root.__rememberedObjectIndecesToControllers[matchedIndex];
	    if (controllerMap === undefined) {
	      controllerMap = {};
	      root.__rememberedObjectIndecesToControllers[matchedIndex] = controllerMap;
	    }
	    controllerMap[controller.property] = controller;
	    if (root.load && root.load.remembered) {
	      var presetMap = root.load.remembered;
	      var preset = void 0;
	      if (presetMap[gui.preset]) {
	        preset = presetMap[gui.preset];
	      } else if (presetMap[DEFAULT_DEFAULT_PRESET_NAME]) {
	        preset = presetMap[DEFAULT_DEFAULT_PRESET_NAME];
	      } else {
	        return;
	      }
	      if (preset[matchedIndex] && preset[matchedIndex][controller.property] !== undefined) {
	        var value = preset[matchedIndex][controller.property];
	        controller.initialValue = value;
	        controller.setValue(value);
	      }
	    }
	  }
	}
	function _add(gui, object, property, params) {
	  if (object[property] === undefined) {
	    throw new Error('Object "' + object + '" has no property "' + property + '"');
	  }
	  var controller = void 0;
	  if (params.color) {
	    controller = new ColorController(object, property);
	  } else {
	    var factoryArgs = [object, property].concat(params.factoryArgs);
	    controller = ControllerFactory.apply(gui, factoryArgs);
	  }
	  if (params.before instanceof Controller) {
	    params.before = params.before.__li;
	  }
	  recallSavedValue(gui, controller);
	  dom.addClass(controller.domElement, 'c');
	  var name = document.createElement('span');
	  dom.addClass(name, 'property-name');
	  name.innerHTML = controller.property;
	  var container = document.createElement('div');
	  container.appendChild(name);
	  container.appendChild(controller.domElement);
	  var li = addRow(gui, container, params.before);
	  dom.addClass(li, GUI.CLASS_CONTROLLER_ROW);
	  if (controller instanceof ColorController) {
	    dom.addClass(li, 'color');
	  } else {
	    dom.addClass(li, _typeof(controller.getValue()));
	  }
	  augmentController(gui, li, controller);
	  gui.__controllers.push(controller);
	  return controller;
	}
	function getLocalStorageHash(gui, key) {
	  return document.location.href + '.' + key;
	}
	function addPresetOption(gui, name, setSelected) {
	  var opt = document.createElement('option');
	  opt.innerHTML = name;
	  opt.value = name;
	  gui.__preset_select.appendChild(opt);
	  if (setSelected) {
	    gui.__preset_select.selectedIndex = gui.__preset_select.length - 1;
	  }
	}
	function showHideExplain(gui, explain) {
	  explain.style.display = gui.useLocalStorage ? 'block' : 'none';
	}
	function addSaveMenu(gui) {
	  var div = gui.__save_row = document.createElement('li');
	  dom.addClass(gui.domElement, 'has-save');
	  gui.__ul.insertBefore(div, gui.__ul.firstChild);
	  dom.addClass(div, 'save-row');
	  var gears = document.createElement('span');
	  gears.innerHTML = '&nbsp;';
	  dom.addClass(gears, 'button gears');
	  var button = document.createElement('span');
	  button.innerHTML = 'Save';
	  dom.addClass(button, 'button');
	  dom.addClass(button, 'save');
	  var button2 = document.createElement('span');
	  button2.innerHTML = 'New';
	  dom.addClass(button2, 'button');
	  dom.addClass(button2, 'save-as');
	  var button3 = document.createElement('span');
	  button3.innerHTML = 'Revert';
	  dom.addClass(button3, 'button');
	  dom.addClass(button3, 'revert');
	  var select = gui.__preset_select = document.createElement('select');
	  if (gui.load && gui.load.remembered) {
	    Common.each(gui.load.remembered, function (value, key) {
	      addPresetOption(gui, key, key === gui.preset);
	    });
	  } else {
	    addPresetOption(gui, DEFAULT_DEFAULT_PRESET_NAME, false);
	  }
	  dom.bind(select, 'change', function () {
	    for (var index = 0; index < gui.__preset_select.length; index++) {
	      gui.__preset_select[index].innerHTML = gui.__preset_select[index].value;
	    }
	    gui.preset = this.value;
	  });
	  div.appendChild(select);
	  div.appendChild(gears);
	  div.appendChild(button);
	  div.appendChild(button2);
	  div.appendChild(button3);
	  if (SUPPORTS_LOCAL_STORAGE) {
	    var explain = document.getElementById('dg-local-explain');
	    var localStorageCheckBox = document.getElementById('dg-local-storage');
	    var saveLocally = document.getElementById('dg-save-locally');
	    saveLocally.style.display = 'block';
	    if (localStorage.getItem(getLocalStorageHash(gui, 'isLocal')) === 'true') {
	      localStorageCheckBox.setAttribute('checked', 'checked');
	    }
	    showHideExplain(gui, explain);
	    dom.bind(localStorageCheckBox, 'change', function () {
	      gui.useLocalStorage = !gui.useLocalStorage;
	      showHideExplain(gui, explain);
	    });
	  }
	  var newConstructorTextArea = document.getElementById('dg-new-constructor');
	  dom.bind(newConstructorTextArea, 'keydown', function (e) {
	    if (e.metaKey && (e.which === 67 || e.keyCode === 67)) {
	      SAVE_DIALOGUE.hide();
	    }
	  });
	  dom.bind(gears, 'click', function () {
	    newConstructorTextArea.innerHTML = JSON.stringify(gui.getSaveObject(), undefined, 2);
	    SAVE_DIALOGUE.show();
	    newConstructorTextArea.focus();
	    newConstructorTextArea.select();
	  });
	  dom.bind(button, 'click', function () {
	    gui.save();
	  });
	  dom.bind(button2, 'click', function () {
	    var presetName = prompt('Enter a new preset name.');
	    if (presetName) {
	      gui.saveAs(presetName);
	    }
	  });
	  dom.bind(button3, 'click', function () {
	    gui.revert();
	  });
	}
	function addResizeHandle(gui) {
	  var pmouseX = void 0;
	  gui.__resize_handle = document.createElement('div');
	  Common.extend(gui.__resize_handle.style, {
	    width: '6px',
	    marginLeft: '-3px',
	    height: '200px',
	    cursor: 'ew-resize',
	    position: 'absolute'
	  });
	  function drag(e) {
	    e.preventDefault();
	    gui.width += pmouseX - e.clientX;
	    gui.onResize();
	    pmouseX = e.clientX;
	    return false;
	  }
	  function dragStop() {
	    dom.removeClass(gui.__closeButton, GUI.CLASS_DRAG);
	    dom.unbind(window, 'mousemove', drag);
	    dom.unbind(window, 'mouseup', dragStop);
	  }
	  function dragStart(e) {
	    e.preventDefault();
	    pmouseX = e.clientX;
	    dom.addClass(gui.__closeButton, GUI.CLASS_DRAG);
	    dom.bind(window, 'mousemove', drag);
	    dom.bind(window, 'mouseup', dragStop);
	    return false;
	  }
	  dom.bind(gui.__resize_handle, 'mousedown', dragStart);
	  dom.bind(gui.__closeButton, 'mousedown', dragStart);
	  gui.domElement.insertBefore(gui.__resize_handle, gui.domElement.firstElementChild);
	}
	function setWidth(gui, w) {
	  gui.domElement.style.width = w + 'px';
	  if (gui.__save_row && gui.autoPlace) {
	    gui.__save_row.style.width = w + 'px';
	  }
	  if (gui.__closeButton) {
	    gui.__closeButton.style.width = w + 'px';
	  }
	}
	function getCurrentPreset(gui, useInitialValues) {
	  var toReturn = {};
	  Common.each(gui.__rememberedObjects, function (val, index) {
	    var savedValues = {};
	    var controllerMap = gui.__rememberedObjectIndecesToControllers[index];
	    Common.each(controllerMap, function (controller, property) {
	      savedValues[property] = useInitialValues ? controller.initialValue : controller.getValue();
	    });
	    toReturn[index] = savedValues;
	  });
	  return toReturn;
	}
	function setPresetSelectIndex(gui) {
	  for (var index = 0; index < gui.__preset_select.length; index++) {
	    if (gui.__preset_select[index].value === gui.preset) {
	      gui.__preset_select.selectedIndex = index;
	    }
	  }
	}
	function updateDisplays(controllerArray) {
	  if (controllerArray.length !== 0) {
	    requestAnimationFrame$1$1.call(window, function () {
	      updateDisplays(controllerArray);
	    });
	  }
	  Common.each(controllerArray, function (c) {
	    c.updateDisplay();
	  });
	}
	var GUI$1 = GUI;

	window.onload = function() {
	  window.showGBufferData = false;
	  var gui = new GUI$1();
	  gui.add(window, 'showGBufferData');
	  const gl = GLContextManager.gl;
	  const overlay = getOverlay();
	  const sceneManager = createSimpleScene(gl);
	  const renderer = createDeferredRenderer(gl, sceneManager);
	  const counter = new FPSCounter(overlay);
	  drawFrame(gl, sceneManager, renderer, counter);
	};

	/**
	 * Draw a single frame to the screen and request another.
	 * @param {WebGL2RenderingContext} gl the webgl context
	 * @param {SceneGraph} graph
	 * @param {OverlayGrid} hud the scene's HUD container, for enabling
	 * @param {Object} renderer an object with an array of RenderPasses and a
	 *     render() method
	 * @param {FPSCounter} counter
	 */
	function drawFrame(gl, sceneManager, renderer, counter) {
	  counter.logFrame();

	  sceneManager.hud.enabled = window.showGBufferData;

	  sceneManager.update(counter.timeSinceStart());

	  renderer.render();

	  requestAnimationFrame(function() {
	    drawFrame(gl, sceneManager, renderer, counter);
	  });
	}

}());
