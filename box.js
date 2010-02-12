/* This class encapsulates the isosurface primitive.
 * 
 * It requires the OpenGL context to be passed in, though 
 * this is an incredibly ugly interface, and hopefully I 
 * will find a clean way to work around it at some point.
 *
 * It also accepts a string version of the function to be
 * plotted.  It must be GLSL 1.0-compliant string version
 * of the function.  Parameters available are x, y, and t
 * representing the x and y coordinates, as well as a time
 * parameter.
 *
 * Currently options is not used, but eventually it will
 * include support for what coordinate space this function
 * is defined in, and so forth.
 */
function box(options, source) {
	
	this.gl   = null;
	
	/* This is one way in which the WebGL implementation of OpenGLot
	 * differs greatly from the C++ implementatiln.  WebGL (OpenGL 
	 * ES 2.0) does not support display lists, and instead I've moved
	 * the implementation to use vertex-buffer objects.  These are
	 * those.
	 */
	this.vertexVBO	= null;
	this.indexVBO		= null;
	
	this.index_ct   = 0;
	
	/* This will likely be depricated, but it currently is hidden from
	 * the end programmer.
	 */
	this.initialize = function(gl, scr) {
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
	}

	/* All primitives are responsible for knowing how to construct them-
	 * selves and so this is the function that constructs the VBO for
	 * the objects.
	 */
	this.gen_vbo = function(scr) {
		// Victory! It works!
		var vertices = [ scr.maxx, scr.maxy,  scr.minx,  //A 0
										 scr.minx, scr.miny, -scr.minx,  //B 1
										 scr.maxx, scr.miny,  scr.minx,  //C 2
										 scr.maxx, scr.miny, -scr.minx,  //D 3
										 scr.maxx, scr.maxy, -scr.minx,  //E 4
										 scr.minx, scr.miny,  scr.minx,  //F 5
										 scr.minx, scr.maxy,  scr.minx,  //G 6
										 scr.minx, scr.maxy, -scr.minx]; //H 7
		var indices  = [ 0, 6, 5, 2, 0, 4, 7, 2, 0, 4, 3, 6, 5, 1, 3, 1, 7]; // Deep magic

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
		
		this.indexVBO = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexVBO);
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new WebGLUnsignedShortArray(indices), this.gl.STATIC_DRAW);
		
		this.index_ct = indices.length;
	}
	
	/* Every primitive is also responsible for knowing how to draw itself,
	 * and that behavior is encapsulated in this function. It should be 
	 * completely self-contained, returning the context state to what it
	 * was before it's called.
	 */
	this.draw = function() {
		//scr.set_uniforms(this.gl, this.program);
		this.gl.uniform1i(this.gl.getUniformLocation(this.program, "sampler"), 0);
		
		this.gl.enableVertexAttribArray(0);
		
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexVBO);
		this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, this.gl.FALSE, 0, 0);
		
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexVBO);
		
		this.gl.drawElements(this.gl.LINE_STRIP, this.index_ct, this.gl.UNSIGNED_SHORT, 0);
		
		this.gl.disableVertexAttribArray(0);
	}
	
	/* Any class who inherits from the primitive class gets free access
	 * to shader compilation and program linking, but only must provide
	 * the fragment and vertex shader sources.  The primitive class also
	 * provides free access to functionality for reading files.
	 */
	this.gen_program = function() {
		var vertex_source = this.read("shaders/passthru.vert");
		var frag_source		= this.read("shaders/passthru.frag");
		
		vertex_source = vertex_source.replace("/* CYLINDRICAL", "//* Cylindrical")
		
		this.compile_program(vertex_source, frag_source);		
	}
}

box.prototype = new primitive();