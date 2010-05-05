/* http://learningwebgl.com/blog/?p=507
 */
function ftexture(context, width, height, f) {
	
	this.texture = null;
	this.image	 = null;
	
	this.gl			 = context;
	
	this.width   = width;
	this.height  = height;

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
	
	this.bind = function() {
		this.gl.enable(this.gl.TEXTURE_2D);
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
	}
	
	this.initialize(f);
	
	return this.texture;
}