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

/** @class
 * A helper class to read textures and use them
 *
 * @constructor
 * @param {WebGLContext} context the context we'll use to \
 *     generate the texture
 * @param {String} src the path of the image
 */
function texture(context, src) {
	/** The WebGLTexture we'll generate */
	this.texture = null;
	this.image	 = null;
	/** The WebGLContext we'll use */
	this.gl	     = context;
	/** The path to the image file. */
	this.src     = src;
	/** The width of the image */
	this.width   = 0;
	/** The height of the image */
	this.height  = 0;

	/** The callback handler for when the data is read */
	this.handler = function() {
		this.gl.console.log("Loaded " + this.src);
		this.gl.enable(this.gl.TEXTURE_2D);
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
		this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.image);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
		this.gl.bindTexture(this.gl.TEXTURE_2D, null);
		this.gl.console.log(this.texture);
		this.gl.console.log(this.image);
		this.width  = this.image.width;
		this.height = this.image.height;
	}

	/** Start reading the image */
	this.initialize = function() {
		this.texture = this.gl.createTexture();
		this.image = new Image();
		this.image.texture = this;
		this.image.onload = function() {
			this.texture.handler();
		}
		this.image.src = this.src;
	}
	
	/** Bind the texture */
	this.bind = function() {
		this.gl.enable(this.gl.TEXTURE_2D);
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
	}
	
	this.initialize();
}