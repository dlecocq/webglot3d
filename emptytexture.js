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

/** 
 * This class initializes an empty texture.  This is primarily
 * meant for use with ping-pong rendering
 *
 * Originally, it was going to be a wrapper around WebGL textures
 * but it turns out to mostly be unnecessary.  So, it simply 
 * returns the generated WebGL texture.
 *
 * @param {WebGLContext} context The WebGL context in which we're operating
 * @param {int} width The width of the texture to allocate
 * @param {int} height The height of the texture to allocate
 * @returns {WebGLTexture}
 */
function emptytexture(context, width, height) {
	/** The texture object we'll be returning */
	this.texture = null;
	/** @deprecated */
	this.image	 = null;
	/** The local copy of the WebGLContext */
	this.gl	     = context;
	/** The local copy of the width of the generated texture */
	this.width  = 0;
	/** The local copy of the height of the generated texture */
	this.height = 0;

	/**
	 * Work with the WebGL context to actually initialize the 
	 * texture.
	 *
	 * @param {int} width The width to make the texture
	 * @param {int} height The height to make the texture
	 */
	this.initialize = function(width, height) {
		this.width  = width;
		this.height = height;
		
		this.texture = this.gl.createTexture();
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);

		var pixels = new WebGLFloatArray(width * height * 4);
		
		this.gl.texImage2D(this.gl.TEXTURE_2D, 0, 0x8814, width, height, 0, this.gl.RGBA, this.gl.FLOAT, pixels);
		//this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, width, height, 0, this.gl.RGBA, this.gl.FLOAT, pixels);
		
		this.gl.enable(this.gl.TEXTURE_2D);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_S_WRAP, this.gl.REPEAT);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_T_WRAP, this.gl.REPEAT);
		this.gl.bindTexture(this.gl.TEXTURE_2D, null);
	}
	
	/**
	 * Bind the texture in the WebGL context.  This class is just a
	 * helper, and returns the actual texture, and not a wrapper around
	 * the texture.
	 *
	 * @deprecated
	 */
	this.bind = function() {
		this.gl.enable(this.gl.TEXTURE_2D);
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
	}
	
	this.initialize(width, height);
	
	return this.texture;
}