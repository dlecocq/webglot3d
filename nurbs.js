/* This class encapsulates the flow primitive.
 */
function nurbs(string, options) {
	
	this.gl   = null;
	this.f    = string;
	
	/* This is one way in which the WebGL implementation of OpenGLot
	 * differs greatly from the C++ implementatiln.  WebGL (OpenGL 
	 * ES 2.0) does not support display lists, and instead I've moved
	 * the implementation to use vertex-buffer objects.  These are
	 * those.
	 */
	this.vertexVBO	= null;
	this.textureVBO = null;
	this.indexVBO		= null;
	
	/* A more apt name might be "resolution," as count is the number
	 * of samples along each axis (x and y) samples are taken. Being
	 * set to 100 means that it will produce 2 * 100 * 100 triangles.
	 */
	this.count			= 150;
	this.index_ct   = 0;
	
	this.source = null;
	this.ping   = null;
	this.pong   = null;
	this.fbo    = null;
	this.p		= 1;
	
	this.texture = null;
	
	this.calc_program = null;

	/* This will likely be depricated, but it currently is hidden from
	 * the end programmer.
	 */
	this.initialize = function(gl, scr, parameters) {
		this.width  = scr.width ;
		this.height = scr.height;
		this.gl = gl;
		this.parameters = parameters;
		this.refresh(scr);
		this.gen_program();
	}
	
	/* Refresh is a way for the grapher instance to notify surface of
	 * changes to the viewing environment.  All the new information is
	 * contained in the screen object passed in, including the minimum
	 * and maximum x and y values for the surface. In the 3D implemen-
	 * tation, it's not commonly-used.
	 */
	this.refresh = function(scr) {
		this.gen_vbo(scr);
		
		if (this.ping) {
			// Delete texture
		}
		
		if (this.pong) {
			// Delete texture
		}
		
		/*
		if ((!this.source) || scr.width > (this.source.width * 2 + 100) || scr.height > (this.source.height * 2 + 100)) {
			console.log("Creating texture of size " + scr.width + " x " + scr.height);
			
			this.ping = new emptytexture(this.gl, scr.width, scr.height);
			//this.ping = new texture(this.gl, "textures/kaust.png").texture;
			this.pong = new emptytexture(this.gl, scr.width, scr.height);
			//this.pong = new texture(this.gl, "textures/kaust.png").texture;
			this.source = new noisetexture(this.gl, scr.width / 2, scr.height / 2);
			//this.source = new texture(this.gl, "textures/kaust.png").texture;
			
			this.gl.bindTexture(this.gl.TEXTURE_2D, null);
		}
		*/
		
		if (!this.fbo) {
			this.fbo = this.gl.createFramebuffer();
		}
		
		if (!this.source) {
			// Used for ping-pong rendering
			this.ping = new zerobasistexture(this.gl, 5, 100);
			this.pong = new zerobasistexture(this.gl, 5, 100);
			this.source = new nurbstexture(this.gl, 100);
			
			scr.sfq();
			this.gl.viewport(0, 0, 5, 100);
			this.calculate(scr);
			this.calculate(scr);
			this.calculate(scr);
			this.gl.viewport(0, 0, scr.width, scr.height);

			//this.source = this.ping;
		}
	}

	/* All primitives are responsible for knowing how to construct them-
	 * selves and so this is the function that constructs the VBO for
	 * the objects.
	 */
	this.gen_vbo = function(scr) {
		var vertices = [];
		var texture  = [];
		var indices  = [];
		
		var x = scr.minx;
		var y = scr.miny;
		var tx = 0.0;
		var ty = 0.0;
		
		var dx = (scr.maxx - scr.minx) / this.count;
		var dy = (scr.maxy - scr.miny) / this.count;
		var dt = 1.0 / this.count;
		
		var i = 0;
		var j = 0;
		
		/* This could probably still be optimized, but at least it's now
		 * using a single triangle strip to render the mesh.  Much better
		 * than the alternative.
		 */
		for (i = 0; i <= this.count; ++i) {
			y = scr.miny;
			ty = 0.0;
			for (j = 0; j <= this.count; ++j) {
				vertices.push(x);
				vertices.push(y);
				texture.push(tx);
				texture.push(ty);
				
				y += dy;
				ty += dt;
			}
			x += dx;
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

		/* One of the options (currently anticipated from this version) is
		 * to color the surface with a normal map or a regular texture and
		 * lighting information for the perception of depth on the object.
		 */
		this.textureVBO = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureVBO);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new WebGLFloatArray(texture), this.gl.STATIC_DRAW);
		
		this.indexVBO = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexVBO);
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new WebGLUnsignedShortArray(indices), this.gl.STATIC_DRAW);
		
		this.index_ct = indices.length;
	}
	
	this.calculate = function(scr) {
		this.setUniforms(scr, this.calc_program);
		
		//this.gl.viewport(0, 0, 5, 100);
		this.gl.uniform1f(this.gl.getUniformLocation(this.calc_program, "width") , 5  );
		this.gl.uniform1f(this.gl.getUniformLocation(this.calc_program, "height"), 100);
		this.gl.uniform1f(this.gl.getUniformLocation(this.calc_program, "knots"), 8);
		this.gl.uniform1i(this.gl.getUniformLocation(this.calc_program, "knots_vector"), 1);
		this.gl.uniform1i(this.gl.getUniformLocation(this.calc_program, "basis"), 0);
		this.gl.uniform1f(this.gl.getUniformLocation(this.calc_program, "p"), this.p);
		
		this.gl.enableVertexAttribArray(0);
		this.gl.enableVertexAttribArray(1);
		
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexVBO);
		this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, this.gl.FALSE, 0, 0);
		
		// More texture support
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureVBO);
		this.gl.vertexAttribPointer(1, 2, this.gl.FLOAT, this.gl.FALSE, 0, 0);
		
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexVBO);
		
		var tmp = this.ping;
		this.ping = this.pong;
		this.pong = tmp;
		
		// First, set up Framebuffer we'll render into
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo);
		this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.ping, 0);
		
		this.gl.enable(this.gl.TEXTURE_2D);
		this.gl.activeTexture(this.gl.TEXTURE0);
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.pong);
		this.gl.activeTexture(this.gl.TEXTURE1);
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.source);
		this.checkFramebuffer();
		
		// Then drawing the triangle strip using the calc program
		this.gl.drawElements(this.gl.TRIANGLE_STRIP, this.index_ct, this.gl.UNSIGNED_SHORT, 0);
		
		/*
		scr.set_uniforms(this.gl, this.program);
		// Then, on top of that, draw the current line set
		this.gl.useProgram(this.program);
		this.gl.drawElements(this.gl.LINE_STRIP, this.index_ct, this.gl.UNSIGNED_SHORT, 0);
		//*/
				
		this.gl.disableVertexAttribArray(0);
		this.gl.disableVertexAttribArray(1);
	}
	
	/* Every primitive is also responsible for knowing how to draw itself,
	 * and that behavior is encapsulated in this function. It should be 
	 * completely self-contained, returning the context state to what it
	 * was before it's called.
	 */
	this.draw = function(scr) {
		scr.perspective();
		//this.gl.viewport(0, 0, scr.width / 4, scr.height / 4);
		//this.setUniforms(scr, this.program);
		//this.gl.uniform1i(this.gl.getUniformLocation(this.program, "accumulation"), 0);
		
		//*
		this.setUniforms(scr, this.calc_program);
		
		this.gl.uniform1f(this.gl.getUniformLocation(this.calc_program, "width") , 5  );
		this.gl.uniform1f(this.gl.getUniformLocation(this.calc_program, "height"), 100);
		this.gl.uniform1f(this.gl.getUniformLocation(this.calc_program, "knots"), 8);
		this.gl.uniform1i(this.gl.getUniformLocation(this.calc_program, "knots_vector"), 1);
		this.gl.uniform1i(this.gl.getUniformLocation(this.calc_program, "basis"), 0);
		this.gl.uniform1f(this.gl.getUniformLocation(this.calc_program, "p"), this.p);
		//*/
		
		this.gl.enableVertexAttribArray(0);
		this.gl.enableVertexAttribArray(1);
		
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexVBO);
		this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, this.gl.FALSE, 0, 0);
		
		// More texture support
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureVBO);
		this.gl.vertexAttribPointer(1, 2, this.gl.FLOAT, this.gl.FALSE, 0, 0);
		
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexVBO);
		
		// Now, render into the normal render buffer, referencing
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
		
		// the recently-drawn texture
		this.gl.enable(this.gl.TEXTURE_2D);
		this.gl.activeTexture(this.gl.TEXTURE1);
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.source);
		this.gl.activeTexture(this.gl.TEXTURE0);
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.pong);
		this.checkFramebuffer();
		
		this.gl.drawElements(this.gl.TRIANGLE_STRIP, this.index_ct, this.gl.UNSIGNED_SHORT, 0);
		//*/
		
		this.gl.disableVertexAttribArray(0);
		this.gl.disableVertexAttribArray(1);
	}
	
	/* Any class who inherits from the primitive class gets free access
	 * to shader compilation and program linking, but only must provide
	 * the fragment and vertex shader sources.  The primitive class also
	 * provides free access to functionality for reading files.
	 */
	this.gen_program = function() {
		var vertex_source = this.read("shaders/nurbs.basis.vert").replace("USER_FUNCTION", this.f);
		var frag_source   = this.read("shaders/nurbs.basis.frag").replace("USER_FUNCTION", this.f);

		this.calc_program = this.compile_program(vertex_source, frag_source);		
		
		var vertex_source = this.read("shaders/nurbs.vert").replace("USER_FUNCTION", this.f);
		var frag_source   = this.read("shaders/nurbs.frag").replace("USER_FUNCTION", this.f);

		this.program      = this.compile_program(vertex_source, frag_source);
	}
}

nurbs.prototype = new primitive();