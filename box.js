/* \brief This class encapsulates the box primitive.  It is mostly
 * meant for use with isosurface rendering to give the user
 * an impression of the orientation of an object.
 *
 * \param options is just a place-holder for future changes
 */
function box(options, source) {
	
	// The WebGL context
	this.gl         = null;
	
	// The VBOs used for drawing it
	this.vertexVBO	= null;
	this.indexVBO		= null;
	
	this.index_ct   = 0;
	
	/* \brief This function is called by the grapher class so that the box
	 * has access to relevant information, but it is only initialized
	 * when grapher deems appropriates
	 *
	 * \param gl is an WebGL context, provided by grapher
	 * \param scr is a reference to the screen object, provided by grapher
	 *
	 * \sa grapher
	 */
	this.initialize = function(gl, scr) {
		this.gl = gl;
		this.refresh(scr);
		this.gen_program();
	}
	
	/* \brief Refresh is a way for the grapher instance to notify surface
	 * of changes to the viewing environment.  This just updates the VBO
	 * to draw a box around the whole screen
	 *
	 * This method is meant to only be called by the grapher class.
	 *
	 * \param scr is required for information about the viewable screen
	 */
	this.refresh = function(scr) {
		this.gen_vbo(scr);
	}

	/* \brief All primitives are responsible for knowing how to construct
	 * themselves and so this is the function that constructs the VBO for
	 * the objects.
	 *
	 * This method is meant to be private
	 *
	 * \param src is information about the viewable screen
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
	
	/* \brief Every primitive is also responsible for knowing how to draw
	 * itself, and that behavior is encapsulated in this function. It should
	 * be completely self-contained, returning the context state to what it
	 * was before it's called.
	 *
	 * This method can be called at any time after initialization to draw
	 * the box to the screen.  Though, it is meant to be primarily called by
	 * grapher.
	 *
	 * \param scr the current screen
	 */
	this.draw = function(scr) {
		scr.perspective();
		this.setUniforms(scr);
		this.gl.enableVertexAttribArray(0);
		
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexVBO);
		this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, this.gl.FALSE, 0, 0);
		
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexVBO);
		
		this.gl.drawElements(this.gl.LINES, this.index_ct, this.gl.UNSIGNED_SHORT, 0);
		
		this.gl.disableVertexAttribArray(0);
	}
	
	/* \brief Any class who inherits from the primitive class gets free
	 * access to shader compilation and program linking, but only must 
	 * provide the fragment and vertex shader sources.  The primitive class
	 * also provides free access to functionality for reading files.
	 * 
	 * This function generates its program, and stores it back in
	 * this.program (this is done impliciatly through the call to
	 * primitive.compile_program).
	 */
	this.gen_program = function() {
		var vertex_source = this.read("shaders/passthru.vert");
		var frag_source		= this.read("shaders/passthru.frag");
		
		vertex_source = vertex_source.replace("/* CYLINDRICAL", "//* Cylindrical")
		
		this.compile_program(vertex_source, frag_source);		
	}
}

box.prototype = new primitive();