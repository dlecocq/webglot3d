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