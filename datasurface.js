/* \brief This class encapsulates the data-based isosurface 
 * primitive.
 *
 * It expects to get a string path to an image containing volumetric
 * data, stored in a tiled format.
 *
 * \param source a string path to the volumetric data image
 * \param width the width of each slice
 * \param height the height of each slice
 * \param b_width the number of tiles stored in each row
 * \param b_Height the number of tiles stored in each column
 *
 * Currently options is not used, but eventually it will
 * include support for what coordinate space this function
 * is defined in, and so forth.
 */
function datasurface(source, width, height, b_width, b_height) {
	
	this.gl   = null;
	
	/* This is one way in which the WebGL implementation of OpenGLot
	 * differs greatly from the C++ implementatiln.  WebGL (OpenGL 
	 * ES 2.0) does not support display lists, and instead I've moved
	 * the implementation to use vertex-buffer objects.  These are
	 * those.
	 */
	this.vertexVBO	= null;
	this.textureVBO = null;
	this.indexVBO		= null;
	
	this.index_ct   = 0;
	
	this.texture    = null;
	this.transfer	  = null;
	this.source     = source || "volumes/orange.png";
	
	this.width      = width;
	this.height     = height;
	this.b_width    = b_width;
	this.b_height   = b_height;
	
	this.parameters = null;

	/* \brief This function is called by the grapher class so that the box
	 * has access to relevant information, but it is only initialized
	 * when grapher deems appropriates
	 *
	 * \param gl is an WebGL context, provided by grapher
	 * \param scr is a reference to the screen object, provided by grapher
	 * \param parameters is an array of strings for parameters used
	 *
	 * \sa grapher
	 */
	this.initialize = function(gl, scr, parameters) {
		this.gl = gl;
		this.parameters = parameters;
		this.refresh(scr);
		this.gen_program();
		this.texture = new texture(this.gl, this.source);
		this.transfer = new noisetexture(this.gl, 256, 1);
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
	 * the objects.  In the case of the datasurface, it constructs the six
	 * faces of a cube, which is then used for the raycasting implementation
	 *
	 * This method is meant to be private
	 *
	 * \param src is information about the viewable screen
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
		this.setUniforms(scr);
		//scr.set_uniforms(this.gl, this.program);
		this.gl.uniform1i(this.gl.getUniformLocation(this.program, "sampler" ), 0);
		this.gl.uniform1i(this.gl.getUniformLocation(this.program, "transfer"), 1);
		
		this.gl.enableVertexAttribArray(0);
		this.gl.enableVertexAttribArray(1);
		
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexVBO);
		this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, this.gl.FALSE, 0, 0);
		
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureVBO);
		this.gl.vertexAttribPointer(1, 3, this.gl.FLOAT, this.gl.FALSE, 0, 0);
		
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexVBO);
		this.gl.activeTexture(this.gl.TEXTURE0);
		this.texture.bind();
		this.gl.activeTexture(this.gl.TEXTURE1);
		this.transfer.bind();
		
		this.gl.drawElements(this.gl.TRIANGLE_STRIP, this.index_ct, this.gl.UNSIGNED_SHORT, 0);
		
		this.gl.disableVertexAttribArray(0);
		this.gl.disableVertexAttribArray(1);
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
		var vertex_source = this.read("shaders/datasurface.vert");
		var frag_source		= this.read("shaders/datasurface.frag");
		
		this.compile_program(vertex_source, frag_source);		
	}
}

datasurface.prototype = new primitive();