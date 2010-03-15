/* This class encapsulates the flow primitive.
 */
function pde3d(string, options) {
	
	this.gl   = null;
	this.f    = string;
	
	/* This is one way in which the WebGL implementation of OpenGLot
	 * differs greatly from the C++ implementatiln.  WebGL (OpenGL 
	 * ES 2.0) does not support display lists, and instead I've moved
	 * the implementation to use vertex-buffer objects.  These are
	 * those.
	 */
	this.vertexVBO	   = null;
	this.textureVBO    = null;
	this.inttexVBO     = null;
	this.real_coordVBO = null;
	this.indexVBO		   = null;
	
	/* A more apt name might be "resolution," as count is the number
	 * of samples along each axis (x and y) samples are taken. Being
	 * set to 100 means that it will produce 2 * 100 * 100 triangles.
	 */
	this.count			= 15;
	this.index_ct   = 0;
	
	this.tmp    = null;
	this.ping   = null;
	this.pong   = null;
	this.fbo    = null;
	this.rb     = null;
	
	this.parameters = null;
	
	this.width    = 64;
	this.height   = 64;
	this.b_width  = 8;
	this.b_height = 8;
	this.depth    = this.b_width * this.b_height;
	this.level    = 0;
	
	this.calc_program = null;

	/* This will likely be depricated, but it currently is hidden from
	 * the end programmer.
	 */
	this.initialize = function(gl, scr, parameters) {
		/*
		this.width  = scr.width ;
		this.height = scr.height;
		*/
		this.parameters = parameters;
		this.gl = gl;
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
		this.width    = scr.width;
		this.height   = scr.height;
		this.b_width  = 1;
		this.b_height = 1;
		//*/

		this.ping = new emptytexture(this.gl, this.width * this.b_width, this.height * this.b_height);
		this.pong = new emptytexture(this.gl, this.width * this.b_width, this.height * this.b_height);
		
		this.fbo = this.gl.createFramebuffer();
	}

	/* All primitives are responsible for knowing how to construct them-
	 * selves and so this is the function that constructs the VBO for
	 * the objects.
	 */
	this.gen_vbo = function(scr) {
		// Victory! It works!
		var vertices = [ scr.maxx, scr.maxy,  scr.minx, //A
										 scr.minx, scr.miny, -scr.minx, //B
										 scr.maxx, scr.miny,  scr.minx, //C
										 scr.maxx, scr.miny, -scr.minx, //D
										 scr.maxx, scr.maxy, -scr.minx, //E
										 scr.minx, scr.miny,  scr.minx, //F
										 scr.minx, scr.maxy,  scr.minx, //G
										 scr.minx, scr.maxy, -scr.minx]; //H
		var texture  = [ 1, 1, 1,  //A
										 0, 0, 0,  //B
										 1, 0, 1,  //C
										 1, 0, 0,  //D
										 1, 1, 0,  //E
										 0, 0, 1,  //F
										 0, 1, 1,  //G
										 0, 1, 0]; //H
		var indices  = [ 2, 5, 0, 6, 7, 7, 4, 0, 3, 2, 1, 5, 6, 6, 1, 7, 3, 4]; // Deep magic
		
		/*
		var vertices = [scr.minx, scr.miny,
		                scr.minx, scr.maxy,
		                scr.maxx, scr.miny,
		                scr.maxx, scr.maxy];
		var texture = [0, 0, 0, 1, 1, 0, 1, 1];
		var indices = [0, 1, 2, 3];
		*/
		//*/
		/*
		var vertices   = [];
		var texture    = [];
		var conceptual = [];
		var indices    = [];
		
		var texxscale = 1.0 / (this.b_width  + 1); 
		var texyscale = 1.0 / (this.b_height + 1);
		
		var minz = scr.minx;
		var maxz = scr.maxz;
		
		var xscale = (scr.maxx - scr.minx) * texxscale;
		var yscale = (scr.maxy - scr.miny) * texyscale;
		var zscale = (    maxz -     minz) / (this.depth + 1.0);
		
		var i = 0;
		var j = 0;
		var x = 0;
		var y = 0;
		var z = 0;
		
		var tx = 0.0;
		var ty = 0.0;
		var dt = 0.0;
		
		var zcounter = 0;
		for (i = 0; i <= this.b_height; ++i) {
			y  = i * yscale + scr.miny;
			ty = i * texyscale;
			z  = z * zscale +     minz;
			for (j = 0; j <= this.b_width; ++j) {
				x  = j * xscale + scr.minx;
				tx = j * texxscale;
				vertices.push(x, y);
				texture.push(tx, ty);
				zcounter = zcounter + 1;
			}
		}
		
		var c = 0;
		indices.push(c)
		
		var inc = this.b_width + 1;
		var dec = inc - 1;
		
		for (i = 0; i < this.b_height; ++i) {
			for (j = 0; j < this.b_width; ++j) {
				c += inc;
				indices.push(c);
				c -= dec;
				indices.push(c);
			}
			c += inc;
			indices.push(c, c);
			
			if (dec < inc) {
				dec = inc + 1;
			} else {
				dec = inc - 1;
			}
		}
		//*/
		
		/*
		var z = 0;
		for (i = 0; i < this.b_height; ++i) {
				
				inttex.push(0, 0, z, 0, this.height - 1, z, this.width - 1, this.height - 1, z, this.width - 1, 0, z);
				
				texture.push(mintx, minty, mintx, maxty, maxtx, maxty, maxtx, minty);
				
				real_coord.push(scr.minx, scr.miny, z * zscale - scr.minx, scr.minx, scr.maxy, z * zscale - scr.minx, scr.maxx, scr.maxy, z * zscale - scr.minx, scr.maxx, scr.miny, z * zscale - scr.minx);
				
				var base = j + i * this.b_width;
				indices.push(base, base + 1, base + 2, base + 2, base + 3, base);
				z += 1;
			}
		}
		*/

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
		
		//this.gl.console.log(vertices);
		this.vertexVBO = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexVBO);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new WebGLFloatArray(vertices), this.gl.STATIC_DRAW);

		//this.gl.console.log(texture);
		this.textureVBO = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureVBO);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new WebGLFloatArray(texture), this.gl.STATIC_DRAW);
		
		/*
		this.textureVBO = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.inttexVBO);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new WebGLFloatArray(inttex), this.gl.STATIC_DRAW);
		
		this.textureVBO = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.real_coordVBO);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new WebGLFloatArray(real_coord), this.gl.STATIC_DRAW);
		//*/
		
		//this.gl.console.log(indices);
		this.indexVBO = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexVBO);
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new WebGLUnsignedShortArray(indices), this.gl.STATIC_DRAW);
		
		this.index_ct = indices.length;
	}
	
	this.calculate = function(scr) {
		this.setUniforms(scr, this.calc_program);
		this.gl.viewport(0, 0, this.width * this.b_width, this.height * this.b_height);
		
    this.gl.uniform1i(this.gl.getUniformLocation(this.calc_program, "uSampler"), 0);
		this.gl.uniform1i(this.gl.getUniformLocation(this.calc_program, "width")   , this.width   );
		this.gl.uniform1i(this.gl.getUniformLocation(this.calc_program, "height")  , this.height  );
		this.gl.uniform1i(this.gl.getUniformLocation(this.calc_program, "b_width") , this.b_width );
		this.gl.uniform1i(this.gl.getUniformLocation(this.calc_program, "b_height"), this.b_height);
		
		this.gl.enableVertexAttribArray(0);
		this.gl.enableVertexAttribArray(1);
		/*
		this.gl.enableVertexAttribArray(2);
		this.gl.enableVertexAttribArray(3);
		*/
		
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexVBO);
		this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, this.gl.FALSE, 0, 0);
		
		// More texture support
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureVBO);
		this.gl.vertexAttribPointer(1, 3, this.gl.FLOAT, this.gl.FALSE, 0, 0);
		
		/*
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.inttexVBO);
		this.gl.vertexAttribPointer(2, 3, this.gl.FLOAT, this.gl.FALSE, 0, 0);
		
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.real_coordVBO);
		this.gl.vertexAttribPointer(3, 3, this.gl.FLOAT, this.gl.FALSE, 0, 0);
		//*/
		
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexVBO);
		
		this.tmp = this.ping;
		this.ping = this.pong;
		this.pong = this.tmp;
		
		// First, set up Framebuffer we'll render into
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo);
		this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.ping, 0);
		this.gl.enable(this.gl.TEXTURE_2D);
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.pong);
		this.checkFramebuffer();

		// Then drawing the triangle strip using the calc program
		this.gl.drawElements(this.gl.TRIANGLE_STRIP, this.index_ct, this.gl.UNSIGNED_SHORT, 0);
				
		this.gl.disableVertexAttribArray(0);
		this.gl.disableVertexAttribArray(1);
		/*
		this.gl.disableVertexAttribArray(2);
		this.gl.disableVertexAttribArray(3);
		*/
	}
	
	/* Every primitive is also responsible for knowing how to draw itself,
	 * and that behavior is encapsulated in this function. It should be 
	 * completely self-contained, returning the context state to what it
	 * was before it's called.
	 */
	this.draw = function(scr) {
		scr.sfq();
		this.calculate(scr);
		this.calculate(scr);
		/*
		this.calculate(scr);
		this.calculate(scr);
		*/
		
		scr.perspective();
		//scr.sfq();
		this.setUniforms(scr, this.program);
		this.gl.uniform1i(this.gl.getUniformLocation(this.program, "uSampler"), 0);
		this.gl.uniform1f(this.gl.getUniformLocation(this.program, "width")   , this.width   );
		this.gl.uniform1f(this.gl.getUniformLocation(this.program, "height")  , this.height  );
		this.gl.uniform1f(this.gl.getUniformLocation(this.program, "b_width") , this.b_width );
		this.gl.uniform1f(this.gl.getUniformLocation(this.program, "b_height"), this.b_height);
		this.gl.viewport(0, 0, scr.width, scr.height);
		
		this.gl.enableVertexAttribArray(0);
		this.gl.enableVertexAttribArray(1);
		
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexVBO);
		//this.gl.bindAttribLocation(this.program, 0, "position");
		this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, this.gl.FALSE, 0, 0);
		
		// More texture support
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureVBO);
		//GLint getAttribLocation(in WebGLProgram program, DOMString name)
		/*vertexAttribPointer(index, size, type, normalized, stride, offset) (OpenGL ES 2.0 man page)
		Assign the currently bound WebGLBuffer object to the passed vertex attrib index. Size is number of components per attribute. Stride and offset are in units of bytes. Passed stride and offset must be appropriate for the passed type and size or an INVALID_VALUE error will be raised.
		*/
		//this.gl.bindAttribLocation(this.program, 1, "aTextureCoord");
		//void glBindAttribLocation(	GLuint program,	GLuint index,	const GLchar *name);
		
		this.gl.vertexAttribPointer(1, 3, this.gl.FLOAT, this.gl.FALSE, 0, 0);
		
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexVBO);
		
		// Now, render into the normal render buffer, referencing
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
		
		// the recently-drawn texture
		this.gl.enable(this.gl.TEXTURE_2D);
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.ping);
		this.gl.drawElements(this.gl.TRIANGLE_STRIP, this.index_ct, this.gl.UNSIGNED_SHORT, 0);
		
		this.gl.disableVertexAttribArray(0);
		this.gl.disableVertexAttribArray(1);
		
	}
	
	/* Any class who inherits from the primitive class gets free access
	 * to shader compilation and program linking, but only must provide
	 * the fragment and vertex shader sources.  The primitive class also
	 * provides free access to functionality for reading files.
	 */
	this.gen_program = function() {
		//*
		var vertex_source = this.read("shaders/pde3d.calc.vert");//.replace("USER_FUNCTION", this.f);
		var frag_source   = this.read("shaders/pde3d.calc.frag");//.replace("USER_FUNCTION", this.f);
		//*/
		
		this.calc_program = this.compile_program(vertex_source, frag_source);

		var vertex_source = this.read("shaders/pde3d.vert");
		var frag_source	  = this.read("shaders/pde3d.frag");
		
		this.program = this.compile_program(vertex_source, frag_source);
	}
}

pde3d.prototype = new primitive();