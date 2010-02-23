/* This class encapsulates the box primitive.  It is mostly
 * meant for use with isosurface rendering to give the user
 * an impression of the orientation of an object
 */
function box(options, source) {
	
	// The WebGL context
	this.gl         = null;
	
	// The VBOs used for drawing it
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
	 * changes to the viewing environment.  This just updates the VBO
	 * to draw a box around the whole screen
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
		var indices  = [ 0, 2, 0, 4, 0, 6, 6, 7, 6, 5, 5, 1, 5, 2, 2, 3, 3, 4, 3, 1, 1, 7, 7, 4];

		if (this.vertexVBO) {
			this.gl.deleteBuffer(this.vertexVBO);
		}
		
		this.vertexVBO = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexVBO);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new WebGLFloatArray(vertices), this.gl.STATIC_DRAW);
		
		if (this.indexVBO) {
			this.gl.deleteBuffer(this.indexVBO);
		}
		
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
		this.gl.enableVertexAttribArray(0);
		
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexVBO);
		this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, this.gl.FALSE, 0, 0);
		
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexVBO);
		
		this.gl.drawElements(this.gl.LINES, this.index_ct, this.gl.UNSIGNED_SHORT, 0);
		
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