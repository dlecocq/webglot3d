/** @class
 * This class encapsulates the sphere primitive.
 *
 * Currently options is not used, but eventually it will
 * include support for what coordinate space this function
 * is defined in, and so forth.
 *
 * @constructor
 * @param {Number} x the x coordinate of the center of the sphere
 * @param {Number} y the y coordinate of the center of the sphere
 * @param {Number} z the z coordinate of the center of the sphere
 * @param {Number} radius the radius of the sphere
 * @param {int} options WARNING - currently only a placeholder
 * @param {Array(r,g,b,a)} color the rgba components of the color
 *
 * @requires primitive
 * @requires screen
 */
function sphere(x, y, z, radius, options, color) {
	/** The WebGLContext we'll be using */
	this.gl   = null;
	/** The x coordinate */
	this.x    = x;
	/** The y coordinate */
	this.y    = y;
	/** The z coordinate */
	this.z    = z;
	/** The radius, defaulted to 1 */
	this.r    = radius || 1; 
	/** The VBO that holds coordinate information */
	this.vertexVBO	= null;
	/** The VBO that holds texture information */
	this.textureVBO = null;
	/** The VBO that holds indices of coordinates to render */
	this.indexVBO	= null;
	/** The number of entries in indexVBO */
	this.index_ct   = 0;
	
	/** A more apt name might be "resolution," as count is the number
	 * of samples along each axis (x and y) samples are taken. Being
	 * set to 100 means that it will produce 2 * 100 * 100 triangles.
	 */
	this.count		= 50;
	
	/** @deprecated The texture of to apply to the surface */
	this.texture    = null;
	/** The color of the sphere, defaulted to a reasonable random color */
	this.color      = color || [Math.random() * 0.8 + 0.2, Math.random() * 0.8 + 0.2, Math.random() * 0.8 + 0.2, 1];

	/** This function is called by the grapher class so that the sphere
	 * has access to relevant information, but it is only initialized
	 * when grapher deems appropriates
	 *
	 * @param {WebGLContext} gl a WebGL context, provided by grapher
	 * @param {screen} scr is a reference to the screen object, provided by grapher
	 * @param {Array(String)} parameters array of strings that will be used as parameters to the function
	 *
	 * @see grapher
	 */
	this.initialize = function(gl, scr) {
		this.gl = gl;
		this.refresh(scr);
		this.gen_program();
	}
	
	/** Refresh is a way for the grapher instance to notify surface
	 * of changes to the viewing environment.  This does not really
	 * apply to this, the sphere, but it is set up this way to adhere
	 * to the pattern of primitives that has developed.
	 *
	 * @param {screen} scr required for information about the viewable screen
	 */
	this.refresh = function(scr) {
		this.gen_vbo(scr);
		this.texture = new texture(this.gl, this.source);
	}

	/** Construct an "ok" mesh for the sphere.  A better triangulation
	 * is possible, but for these intents and purposes, ultimately
	 * unnecessary.
	 *
	 * @param {screen} scr the current screen
	 */
	this.gen_vbo = function(scr) {
		var vertices = [];
		var texture  = [];
		var indices  = [];
		
		var texrepeat = 3;
		
		var tx = 0.0;
		var ty = texrepeat;
		var dt = texrepeat / this.count;
		
		var i = 0;
		var j = 0;
		
		/* This could probably still be optimized, but at least it's now
		 * using a single triangle strip to render the mesh.  Much better
		 * than the alternative.
		 */
		for (i = 0; i <= this.count; ++i) {
			x = Math.sin(i / this.count * 2 * Math.PI);
			y = Math.cos(i / this.count * 2 * Math.PI);
			ty = texrepeat;
			for (j = 0; j <= this.count; ++j) {
				vertices.push(this.x + this.r * Math.sin(j / this.count * Math.PI) * x);
				vertices.push(this.y + this.r * Math.sin(j / this.count * Math.PI) * y);
				vertices.push(this.z + this.r * Math.cos(j / this.count * Math.PI));
				texture.push(tx);
				texture.push(ty);
				ty -= dt;
			}
			tx += dt;
		}
		
		var c = 0;
		indices.push(c)
		
		var inc = this.count + 1;
		var dec = inc - 1;
		
		for (i = 0; i < this.count; ++i) {
			for (j = 0; j < this.count; ++j) {
				c += inc;
				indices.push(c);
				c -= dec;
				indices.push(c);
			}
			c += inc;
			indices.push(c);
			indices.push(c);
			
			if (dec < inc) {
				dec = inc + 1;
			} else {
				dec = inc - 1;
			}
		}

		/* Again, I'm not an expert in JavaScript, and I'm currently not
		 * sure how exactly garbage collection works.  Either way, when 
		 * generating the VBO, it's a good idea to delete the previously-
		 * declared VBO so that it frees up some space on the GPU.  This
		 * will be added soon, when I can find a tool that helps me track
		 * and make sure that this memory is getting cleaned up.
		 */
		/*
		if (this.vertexVBO) {
			this.gl.console.log("deleting");
			this.gl.deleteBuffer(this.vertexVBO);
		}
		*/
		
		this.vertexVBO = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexVBO);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new WebGLFloatArray(vertices), this.gl.STATIC_DRAW);

		this.textureVBO = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureVBO);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new WebGLFloatArray(texture), this.gl.STATIC_DRAW);
		
		this.indexVBO = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexVBO);
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new WebGLUnsignedShortArray(indices), this.gl.STATIC_DRAW);
		
		this.index_ct = indices.length;
	}
	
	/** Every primitive is also responsible for knowing how to draw
	 * itself, and that behavior is encapsulated in this function.
	 *
	 * @param {screen} scr the current screen
	 */
	this.draw = function(scr) {
		this.setUniforms(scr);
		this.gl.uniform3f(this.gl.getUniformLocation(this.program, "center"), this.x, this.y, this.z);
		
		this.gl.enableVertexAttribArray(0);
		this.gl.enableVertexAttribArray(1);
		
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexVBO);
		this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, this.gl.FALSE, 0, 0);
		
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureVBO);
		this.gl.vertexAttribPointer(1, 2, this.gl.FLOAT, this.gl.FALSE, 0, 0);
		
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexVBO);
		this.texture.bind();
		
		this.gl.drawElements(this.gl.TRIANGLE_STRIP, this.index_ct, this.gl.UNSIGNED_SHORT, 0);
		
		this.gl.disableVertexAttribArray(0);
		this.gl.disableVertexAttribArray(1);
	}
	
	/** Generates the shader programs necessary to render this
	 * primitive.  Generates the shader program, and replaces 
	 * the code blocks (if necessary) to do coordinate conversions
	 * in the shader.
	 */
	this.gen_program = function() {
		var vertex_source = this.read("shaders/sphere.vert");
		var frag_source	  = this.read("shaders/sphere.frag");
		
		this.compile_program(vertex_source, frag_source);		
	}
}

sphere.prototype = new primitive();