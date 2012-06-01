/* Copyright (c) 2009-2010 King Abdullah University of Science and Technology
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/** Creates a WebGLTexture based on any function that the 
 * programmer would like to use.  Include a function that
 * when given a Float32Array, sets all the appropriate
 * values.  It expects that the supplied data will be of
 * the format RGBA in successive elements, and is stored
 * internally in full 32-bit floats.  Thus, the array passed
 * to the user-provided function has size width * height * 4
 * 
 * @param {WebGLContext} context the context to use to create textures
 * @param {int} width the width to make the texture
 * @param {int} height the height to make the texture
 * @param {function(Float32Array)} a function that fills \
 *     the provided array with the appropriate data
 */
function ftexture(context, width, height, f) {
	/** The WebGLTexture to return */
	this.texture = null;
	/** @deprecated */
	this.image	 = null;
	/** The WebGL context to use */
	this.gl	     = context;
	/** local copy of the width of the texture */
	this.width   = width;
	/** local copy of the height of the texture */
	this.height  = height;

	/** This function does the heavy lifting, but the structure
	 * of the class is going to change soon.  Currently, ftexture
	 * actually returns a WebGLTexture, and not a wrapper of one.
	 *
	 * @param {function(Float32Array)} f
	 */
	this.initialize = function(f) {
		this.texture = this.gl.createTexture();
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);

		var pixels = new Float32Array(this.width * this.height * 4);
		// Pass pixels into the user-provided function
		pixels = f(pixels);
		this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.width, this.height, 0, this.gl.RGBA, this.gl.FLOAT, pixels);
		
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
		this.gl.bindTexture(this.gl.TEXTURE_2D, null);
	}
	
	/** Bind the texture
	 *
	 * @deprecated
	 */
	this.bind = function() {
		this.gl.enable(this.gl.TEXTURE_2D);
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
	}
	
	this.initialize(f);
	
	return this.texture;
}