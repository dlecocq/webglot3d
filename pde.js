/* \brief This class encapsulates the 2D PDE surface primitive.
 *
 * Test class - everything is hard-coded in the shader at this
 * point, and works with the poisson equation.  It then visual-
 * izes this result as a color-coded surface.  Currently it is
 * having some problems with numerical stability.  Currently
 * the solver is a Jacobi kernel, but we'll be exploring other
 * algorithms to use in its place.
 *
 * \param string WARNING not used in this version
 * \param options WARNING not used in this version
 */
function pde(string, options) {
	
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
	
	this.tmp    = null;
	this.ping   = null;
	this.pong   = null;
	this.fbo    = null;
	this.rb     = null;
	
	this.parameters = null;
	
	this.width  = 0;
	this.height = 0;
	this.level  = 0;
	
	this.calc_program = null;

	/* \brief This function is called by the grapher class so that the 
	 * primitive has access to relevant information, but it is only 
	 * initialized when grapher deems appropriate
	 *
	 * In the particular case of pde, it copies the dimensions of the
	 * canvas screen, which it uses to determine the resolution at which
	 * to run the iterative solver.  This is the size of the ping and
	 * pong framebuffer objects.
	 *
	 * \param gl is an WebGL context, provided by grapher
	 * \param scr is a reference to the screen object, provided by grapher
	 * \param parameters is an array of strings that will be used as parameters to the function
	 *
	 * \sa grapher
	 */
	this.initialize = function(gl, scr, parameters) {
		this.width  = scr.width ;
		this.height = scr.height;
		this.parameters = parameters;
		this.gl = gl;
		this.refresh(scr);
		this.gen_program();
	}
	
	/* \brief Refresh is a way for the grapher instance to notify surface
	 * of changes to the viewing environment.
	 *
	 * This method is meant to only be called by the grapher class.  It 
	 * initializes the ping-pong textures (used for storing intermediate
	 * states in the Jacobi kernel).  Additionally, it ensures that a 
	 * framebuff object is instantiated.
	 *
	 * \param scr is required for information about the viewable screen
	 */
	this.refresh = function(scr) {
		this.gen_vbo(scr);
		
		if (this.ping) {
			// Delete texture
		}
		
		if (this.pong) {
			// Delete texture
		}

		this.ping = new emptytexture(this.gl, this.width, this.height);
		this.pong = new emptytexture(this.gl, this.width, this.height);
		
		this.fbo = this.gl.createFramebuffer();
	}

	/* \brief All primitives are responsible for knowing how to construct
	 * themselves and so this is the function that constructs the VBO for
	 * the objects.
	 *
	 * This method is meant to be private, and it generates a triangle 
	 * strip representation of a mesh of the resolucation this.count. For
	 * JavaScript in particular, it's important to use triangle strips 
	 * INSTEAD OF just triangles, because of the limits of array sizes.
	 * You can obtain a much-higher resolution mesh by using strips.
	 *
	 * In the 2D implementation, it's just a screen-filling quad, but
	 * as we are trying to visualize the result as a surface, it becomes
	 * important to have sufficient sampling.
	 *
	 * \param src is information about the viewable screen
	 */
	this.gen_vbo = function(scr) {
		/*
		var vertices = [scr.minx, scr.miny, 0,
		                scr.minx, scr.maxy, 0,
		                scr.maxx, scr.miny, 0,
		                scr.maxx, scr.maxy, 0];
		var texture = [0, 0, 0, 1, 1, 0, 1, 1];
		var indices = [0, 1, 2, 3];
		*/
		
		var vertices = [];
		var texture  = [];
		var indices  = [];
		
		var x = scr.minx;
		var y = scr.miny;
		var dx = (scr.maxx - scr.minx) / this.count;
		var dy = (scr.maxy - scr.miny) / this.count;
		
		var tx = 0.0;
		var ty = 1.0;
		var dt = 1.0 / this.count;
		
		var i = 0;
		var j = 0;
		
		/* This could probably still be optimized, but at least it's now
		 * using a single triangle strip to render the mesh.  Much better
		 * than the alternative.
		 */
		for (i = 0; i <= this.count; ++i) {
			y = scr.miny;
			ty = 1.0;
			for (j = 0; j <= this.count; ++j) {
				vertices.push(x);
				vertices.push(y);
				texture.push(tx);
				texture.push(ty);
				
				y += dy;
				ty -= dt;
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

		this.textureVBO = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureVBO);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new WebGLFloatArray(texture), this.gl.STATIC_DRAW);
		
		this.indexVBO = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexVBO);
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new WebGLUnsignedShortArray(indices), this.gl.STATIC_DRAW);
		
		this.index_ct = indices.length;
	}
	
	/* \brief Calculate the next iteration of the Jacobi kernel
	 *
	 * As this primitive involves a two-pass process, the first (or in
	 * some cases, the first few) are to calculate iterations of the Jacobi
	 * kernel.  The essential idea is that it uses a finite-difference
	 * approximation to adjust a texel's value based on the value of its
	 * neighbors.  The calculate method can be called any time after
	 * initialization.
	 *
	 * Another interesting feature about this arrangement is that it
	 * makes use of all four channels of the texture, in full 32-bit
	 * floating-point precision. The implicit cell topology is that 
	 * {r | g} are on top, and {b | a} are on bottom.  In this way,
	 * with the same number of texture fetches as the one-texel-per-cell
	 * method, we can evaluate a much higher-order stencil.
	 *
	 * It uses ping-pong rendering to accomplish the calculations.
	 *
	 * \param scr is the current screen object, passed in from draw
	 */
	this.calculate = function(scr) {
		this.setUniforms(scr, this.calc_program);
		//this.gl.viewport(0, 0, this.ping.width, this.ping.height);
		
    	this.gl.uniform1i(this.gl.getUniformLocation(this.calc_program, "uSampler"), 0);
		this.gl.uniform1f(this.gl.getUniformLocation(this.calc_program, "width") , this.width );
		this.gl.uniform1f(this.gl.getUniformLocation(this.calc_program, "height"), this.height);
		
		this.gl.enableVertexAttribArray(0);
		this.gl.enableVertexAttribArray(1);
		
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexVBO);
		this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, this.gl.FALSE, 0, 0);
		
		// More texture support
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureVBO);
		this.gl.vertexAttribPointer(1, 2, this.gl.FLOAT, this.gl.FALSE, 0, 0);
		
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
	}
	
	/* \brief Every primitive is also responsible for knowing how to draw
	 * itself, and that behavior is encapsulated in this function.
	 *
	 * This method can be called at any time after initialization to draw
	 * the box to the screen.  Though, it is meant to be primarily called by
	 * grapher.
	 *
	 * It makes four calls to the calculate function, which does ping-pong
	 * rendering to calculate an approximation to the PDE solution.  Then it
	 * interprets this result as a height-field surface.
	 *
	 * \param scr the current screen
	 */
	this.draw = function(scr) {
		scr.sfq();
		this.calculate(scr);
		this.calculate(scr);
		this.calculate(scr);
		this.calculate(scr);
		
		scr.perspective();
		this.setUniforms(scr, this.program);
		this.gl.uniform1i(this.gl.getUniformLocation(this.program, "uSampler"), 0);
		this.gl.viewport(0, 0, scr.width, scr.height);
		
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
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.ping);
		this.gl.drawElements(this.gl.TRIANGLE_STRIP, this.index_ct, this.gl.UNSIGNED_SHORT, 0);
		
		this.gl.disableVertexAttribArray(0);
		this.gl.disableVertexAttribArray(1);
		
	}
	
	/* \brief Generates the shader programs necessary to render this
	 * primitive
	 *
	 * This is a two-pass algorithm, and each pass requires a different
	 * shader program.  Most other primitives need only a single one,
	 * but this stores the calculate (calculation of the Jacobi kernel)
	 * program in this.calc_program, and the rendering shader in this.
	 * program.
	 */
	this.gen_program = function() {
		//*
		var vertex_source = this.read("shaders/pde.calc.vert");//.replace("USER_FUNCTION", this.f);
		var frag_source   = this.read("shaders/pde.calc.frag");//.replace("USER_FUNCTION", this.f);
		//*/
		
		this.calc_program = this.compile_program(vertex_source, frag_source);

		var vertex_source = this.read("shaders/pde.vert");
		var frag_source	  = this.read("shaders/pde.frag");
		
		this.program = this.compile_program(vertex_source, frag_source);
	}
}

pde.prototype = new primitive();