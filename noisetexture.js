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

/** Noisetexture-generating function.  Some algorithms need
 * a random noise texture as input.  Notably the flow surface
 * 
 * @param {WebGLContext} context the context in which we'll be working
 * @param {int} width the width of the texture to generate
 * @param {int} height the height of the texture to generate
 *
 * @see flow
 */
function noisetexture(context, width, height) {
	/** The WebGLTexture object that we'll return */
	this.texture = null;
	/** @deprecated */
	this.image	 = null;
	/** The local copy of the WebGLContext we'll use */
	this.gl		 = context;
	/** Local copy of the width of the texture */
	this.width   = width;
	/** Local copy of the height of the texture */
	this.height  = height;

	/** Initialize the randomized noise texture */
	this.initialize = function() {
		this.texture = this.gl.createTexture();
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);

		var pixels = new Float32Array(this.width * this.height * 4);
		var count = this.width * this.height * 4;
		//*
		for (var i = 0; i < count; i += 1) {
			pixels[i] = Math.random() * 3.0;
			//pixels[i] = 4.0 * i / count;
			//pixels[i] = 0.0;
		}
		//*/
		
		/*
		for (var i = count / 4; i < count / 2; i += 1) {
			pixels[i] = 1.0;
		}	
		*/	
		this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.width, this.height, 0, this.gl.RGBA, this.gl.FLOAT, pixels);
		
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
		this.gl.bindTexture(this.gl.TEXTURE_2D, null);
	}
	
	this.bind = function() {
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
	}
	
	this.initialize();
	
	//return this.texture;
}