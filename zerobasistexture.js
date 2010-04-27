/* http://learningwebgl.com/blog/?p=507
 */
function zerobasistexture(context, width, height) {
	
	this.texture = null;
	this.image	 = null;
	
	this.gl			 = context;
	
	this.width  = 0;
	this.height = 0;

	this.initialize = function(width, height) {
		this.width  = width;
		this.height = height;
		
		this.texture = this.gl.createTexture();
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);

		var pixels = new WebGLFloatArray(width * height * 4);
		
		for (var i = 0; i < height; ++i) {
			for (var j = 0; j < width; ++j) {
				pixels[(width * i + j) * 4    ] = 0;
				pixels[(width * i + j) * 4 + 3] = 1;
			}
		}
		
		for (var i = 0; i < height; ++i) {
			pixels[(width * (i + 1) - 2) * 4    ] = 1;
		}

		/* Well, this is certainly interesting.  I can't seem to figure out the code
		 * to get extensions' constants, but if you supply the constant value of 
		 * RGBA32F_ARB = 0x8814, then you can access full 32-bit floating-point
		 * texture stuff.  Still, should probably figure out the right way to do it,
		 * but in the mean time, this will work.
		 */
		this.gl.texImage2D(this.gl.TEXTURE_2D, 0, 0x8814, width, height, 0, this.gl.RGBA, this.gl.FLOAT, pixels);
		//this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, width, height, 0, this.gl.RGBA, this.gl.FLOAT, pixels);
		
		this.gl.enable(this.gl.TEXTURE_2D);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_S_WRAP    , this.gl.CLAMP );
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_T_WRAP    , this.gl.CLAMP );
		this.gl.bindTexture(this.gl.TEXTURE_2D, null);
	}
	
	this.bind = function() {
		this.gl.enable(this.gl.TEXTURE_2D);
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
	}
	
	this.initialize(width, height);
	
	return this.texture;
}