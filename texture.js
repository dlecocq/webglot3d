/* http://learningwebgl.com/blog/?p=507
 */
function texture(context, src) {
	
	this.texture = null;
	this.image	 = null;
	
	this.gl			 = context;
	this.src		 = src;
	
	this.width   = 0;
	this.height  = 0;

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

	this.initialize = function() {
		this.texture = this.gl.createTexture();
		this.image = new Image();
		this.image.texture = this;
		this.image.onload = function() {
			this.texture.handler();
		}
		this.image.src = this.src;
	}
	
	this.bind = function() {
		this.gl.enable(this.gl.TEXTURE_2D);
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
	}
	
	this.initialize();
}