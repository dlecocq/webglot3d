/* http://learningwebgl.com/blog/?p=507
 */
function cptexture(context, height) {
	
	this.knots = new Array(0.1, 0.1, 0.5, 1.0, 1.0, 1.0, 1.0);
	// Need 7 control points
	this.cps   = new Array([0, 0, 0, 1], [0, 1, 0, 1], [1, 1, 0, 1], 
		[2, 1, 2, 1], [3, 5, 7, 1], [3, 6, 7, 1], [3, 8, 8, 1]);
	
	this.texture = null;
	this.image	 = null;
	
	this.gl			 = context;
	
	this.width  = 4;
	this.height = 0;

	this.initialize = function(width, height) {
		this.width  = width;
		this.height = height;
		
		this.texture = this.gl.createTexture();
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);

		var pixels = new WebGLFloatArray(width * height * 4);
		
		this.gl.console.log("Height : " + this.height);
		this.gl.console.log("Width  : " + this.width );
		
		var numcp = 4;
		
		var mid = 0;
		while (this.knots[mid] <= 0) {
			mid += 1;
		}
		
		//*
		for (var i = 0; i < height; ++i) {
			// Set the first column as the parameter value
			var u = i / height;
						
			// Figure out which knots to use
			while (this.knots[mid] <= u && u != 1) {
				mid += 1;
			}
			
			// Assign the rest of the columns
			for (var j = 0; j < width; ++j) {
				pixels[(width * i + j) * 4    ] = this.cps[mid + j][0];
				pixels[(width * i + j) * 4 + 1] = this.cps[mid + j][1];
				pixels[(width * i + j) * 4 + 2] = this.cps[mid + j][2];
				pixels[(width * i + j) * 4 + 3] = this.cps[mid + j][3];
			}
		}
		//*/
		
		/*
		for (var i = 0; i < width * height; ++i) {
			pixels[i * 4    ] = 1.0;
			pixels[i * 4 + 3] = 1.0;
		}
		*/

		this.gl.texImage2D(this.gl.TEXTURE_2D, 0, 0x8814, width, height, 0, this.gl.RGBA, this.gl.FLOAT, pixels);
		
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
	
	this.initialize(this.width, height);
	
	return this.texture;
}