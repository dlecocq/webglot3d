/* \brief This class encapsulates the isosurface primitive.
 *
 * It accepts a string representation of a function in x, y,
 * z and t, that should be visualized by isosurface rendering
 * changing the isovalue parameter
 *
 * \param string is the function
 * \param options is a bitwise and'ing of options.  Currently
 *    the only options are CYLINDRICAL and SPHERICAL for changing
 *    the coordinate system
 * \param source DEPRECATION WARNING is not used.
 */
function isosurface(string, options, source) {
	
	this.gl      = null;
	this.f       = string;
	this.options = options;
	
	/* This is one way in which the WebGL implementation of OpenGLot
	 * differs greatly from the C++ implementation.  WebGL (OpenGL 
	 * ES 2.0) does not support display lists, and instead I've moved
	 * the implementation to use vertex-buffer objects.  These are
	 * those.
	 */
	this.vertexVBO	= null;
	this.textureVBO = null;
	this.indexVBO		= null;
	
	this.parameters = null;
	
	/* A more apt name might be "resolution," as count is the number
	 * of samples along each axis (x and y) samples are taken. Being
	 * set to 100 means that it will produce 2 * 100 * 100 triangles.
	 */
	this.count			= 2;
	this.index_ct   = 0;
	
	this.texture    = null;
	this.source     = source || "textures/deisa.jpg";
	//"textures/saudi-flag.gif"
	//"textures/dan.jpg"

	/* \brief This function is called by the grapher class so that the box
	 * has access to relevant information, but it is only initialized
	 * when grapher deems appropriates
	 *
	 * In the particular case of isosurface, it's business as usual
	 *
	 * \param gl is an WebGL context, provided by grapher
	 * \param scr is a reference to the screen object, provided by grapher
	 * \param parameters is an array of strings that will be used as parameters to the function
	 *
	 * \sa grapher
	 */
	this.initialize = function(gl, scr, parameters) {
		this.gl = gl;
		this.parameters = parameters;
		this.refresh(scr);
		this.gen_program();
	}
	
	/* \brief Refresh is a way for the grapher instance to notify surface
	 * of changes to the viewing environment.
	 *
	 * This method is meant to only be called by the grapher class. It
	 * just makes a call to generate the vertex buffer object to draw
	 *
	 * \param scr is required for information about the viewable screen
	 */
	this.refresh = function(scr) {
		this.gen_vbo(scr);
		this.texture = new texture(this.gl, this.source);
	}

	/* \brief All primitives are responsible for knowing how to construct
	 * themselves and so this is the function that constructs the VBO for
	 * the objects.
	 *
	 * This method is meant to be private, and it generates a VBO for the
	 * six faces of a cube in the same fashion as datasurface.
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
		var texture  = vertices;
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
	 * itself, and that behavior is encapsulated in this function.
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
		this.gl.uniform1i(this.gl.getUniformLocation(this.program, "sampler"), 0);
		
		this.gl.enableVertexAttribArray(0);
		this.gl.enableVertexAttribArray(1);
		
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexVBO);
		this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, this.gl.FALSE, 0, 0);
		
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureVBO);
		this.gl.vertexAttribPointer(1, 3, this.gl.FLOAT, this.gl.FALSE, 0, 0);
		
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexVBO);
		this.texture.bind();
		
		this.gl.drawElements(this.gl.TRIANGLE_STRIP, this.index_ct, this.gl.UNSIGNED_SHORT, 0);
		
		this.gl.disableVertexAttribArray(0);
		this.gl.disableVertexAttribArray(1);
	}
	
	/* \brief Generates the shader programs necessary to render this
	 * primitive
	 *
	 * Generates the shader program, and replaces the code blocks (if
	 * necessary) to do coordinate conversions in the shader.
	 */
	this.gen_program = function() {
		var vertex_source = this.read("shaders/isosurface.vert").replace("USER_FUNCTION", this.f);
		var frag_source		= this.read("shaders/isosurface.frag").replace("USER_FUNCTION", this.f);
		
		if (this.options & CYLINDRICAL) {
			vertex_source = vertex_source.replace("/* CYLINDRICAL", "//* Cylindrical");
			frag_source   = frag_source.replace("/* CYLINDRICAL", "//* Cylindrical");
		} else if (this.options & SPHERICAL) {
			vertex_source = vertex_source.replace("/* SPHERICAL", "//* Spherical");
			frag_source   = frag_source.replace("/* SPHERICAL", "//* Spherical");
		}
		
		this.compile_program(vertex_source, frag_source);		
	}
}

isosurface.prototype = new primitive();