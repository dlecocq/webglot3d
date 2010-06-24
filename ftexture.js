/** Creates a WebGLTexture based on any function that the 
 * programmer would like to use.  Include a function that
 * when given a WebGLFloatArray, sets all the appropriate
 * values.  It expects that the supplied data will be of
 * the format RGBA in successive elements, and is stored
 * internally in full 32-bit floats.  Thus, the array passed
 * to the user-provided function has size width * height * 4
 * 
 * @param {WebGLContext} context the context to use to create textures
 * @param {int} width the width to make the texture
 * @param {int} height the height to make the texture
 * @param {function(WebGLFloatArray)} a function that fills \
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
	 * @param {function(WebGLFloatArray)} f
	 */
	this.initialize = function(f) {
		this.texture = this.gl.createTexture();
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);

		var pixels = new WebGLFloatArray(this.width * this.height * 4);
		// Pass pixels into the user-provided function
		pixels = f(pixels);
		this.gl.texImage2D(this.gl.TEXTURE_2D, 0, 0x8814, this.width, this.height, 0, this.gl.RGBA, this.gl.FLOAT, pixels);
		
		this.gl.enable(this.gl.TEXTURE_2D);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_S_WRAP, this.gl.CLAMP);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_T_WRAP, this.gl.CLAMP);
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