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

		var pixels = new WebGLFloatArray(this.width * this.height * 4);
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
		
		this.gl.enable(this.gl.TEXTURE_2D);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_S_WRAP, this.gl.CLAMP);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_T_WRAP, this.gl.CLAMP);
		this.gl.bindTexture(this.gl.TEXTURE_2D, null);
	}
	
	this.bind = function() {
		this.gl.enable(this.gl.TEXTURE_2D);
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
	}
	
	this.initialize();
	
	//return this.texture;
}