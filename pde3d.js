/** This class encapsulates the 3D PDE primitive.
 *
 * @class
 * Test class - This class approximates a 3D PDE through successive
 * Jacobi iterations.  It uses the same tilling / packing technique
 * as the datasurface class, but instead of merely interpreting the
 * data stored in a texture, it also uses it for calculation.
 *
 * Every few iterations, it then visualizes the results as an
 * isosurface, in the exact same fashion as the datasurface. At this
 * point in development, everything is hard-coded in the shader.
 *
 * @constructor
 * @param {String} string NOT USED in this version
 * @param {int} options NOT USED in this version
 * @requires primitive
 * @requires texture
 * @requires screen
 */
function pde3d(string, options) {
	/** The WebGLContext we'll be using */
	this.gl   = null;
	/** @deprecated */
	this.f    = string;
	/** The VBO that holds coordinate information */
	this.vertexVBO	   = null;
	/** The VBO that holds texture information */
	this.textureVBO    = null;
	this.inttexVBO     = null;
	this.real_coordVBO = null;
	/** The VBO that holds the indices to render */
	this.indexVBO	   = null;
	/** The number of elements in indexVBO */
	this.index_ct   = 0;
	
	/** @deprecated */
	this.count		= 15;
	
	/** Used for swapping ping and pong textures */
	this.tmp    = null;
	/** One of the textures used for ping-pong rendering */
	this.ping   = null;
	/** The other texture used for ping-pong rendering */
	this.pong   = null;
	/** The FBO into which we'll be rendering in the calculation */
	this.fbo    = null;
	/** @deprecated The renderbuffer */
	this.rb     = null;
	/** The parameters that should be added to the shader source */
	this.parameters = null;
	/** The width of the domain */
	this.width    = 64;
	/** The height of the domain */
	this.height   = 64;
	/** The number of columns to use in the tiling of the volume data */
	this.b_width  = 8;
	/** The number of rows to use in the tiling of the volume data */
	this.b_height = 8;
	/** The depth of the domain */
	this.depth    = this.b_width * this.b_height;
	/** @private */
	this.level    = 0;
	/** The shader program used to perform the calculations */
	this.calc_program = null;

	/** This function is called by the grapher class so that the box
	 * has access to relevant information, but it is only initialized
	 * when grapher deems appropriates
	 *
	 * This initialize function is pretty typical of all primitives.  It
	 * simply copies all the parameters passed into it as local objects,
	 * and then generates the shader programs.
	 *
	 * @param {WebGLContext} gl is an WebGL context, provided by grapher
	 * @param {screen} scr is a reference to the screen object, provided by grapher
	 * @param {Array(String)} parameters is an array of strings that will be used as parameters to the function
	 *
	 * @see grapher
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
	
	/** Refresh is a way for the grapher instance to notify surface
	 * of changes to the viewing environment.
	 *
	 * This method is meant to only be called by the grapher class.  It 
	 * initializes the ping-pong textures used for storing itermediate
	 * approximations from the Jacobi kernel.
	 *
	 * @param {screen} scr is required for information about the viewable screen
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

	/** All primitives are responsible for knowing how to construct
	 * themselves and so this is the function that constructs the VBO for
	 * the objects.
	 *
	 * This method is meant to be private, and it generates the six faces
	 * of a cube for the isosurface rendering.  It also uses one of the 
	 * faces as the screen-filling quad for calculating the Jacobi iterates
	 *
	 * @param {screen} src is information about the viewable screen
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
	
	/** Calculate the next iteration of the IBFV algorithm
	 *
	 * As this primitive involves a two-pass process, the first pass
	 * is to advance the PDE solver.  This functionality is contained
	 * in the calculate function, which may be called any time after
	 * initialization, but it's intended to mostly be called by its
	 * own draw method.
	 *
	 * While the 2D PDE surface can exploit four channels to do high-
	 * order approximations, the efficiency of memory lookups is not 
	 * as great in this case.  This is because we must also make
	 * references to layers above and below it.  Thus, it uses two
	 * different approximation schemes - a five-point stencil in
	 * both the x and y directions, but only a three-point stencil
	 * in the z direciton.  I'm investigating possible implicit 
	 * topologies (how the cells are laid out in texture) to potent-
	 * ially enable the same order accuracy in all directions, but
	 * this seems non-trivial upon initial inspection.
	 *
	 * @param {screen} scr is the current screen object, passed in from draw
	 */
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
	
	/** Every primitive is also responsible for knowing how to draw
	 * itself, and that behavior is encapsulated in this function.
	 *
	 * This method can be called at any time after initialization to draw
	 * the primitive to the screen.  Though, it is meant to be primarily 
	 * called by grapher.
	 *
	 * It makes two calls to the calculate function, which does ping-pong
	 * rendering to calculate the iterations, and then performs isosurface
	 * rendering in exactly the same way as the datasurface.
	 *
	 * @param {screen} scr the current screen
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
	
	/** Generates the shader programs necessary to render this
	 * primitive
	 *
	 * This is a two-pass algorithm, and each pass requires a different
	 * shader program.  Most other primitives need only a single one,
	 * but this stores the calculate (calculation of the PDE approx.)
	 * program in this.calc_program, and the rendering shader in this.
	 * program.
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