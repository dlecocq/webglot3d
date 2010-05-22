/* This class encapsulates the parametric surface primitive.
 * 
 * It requires the OpenGL context to be passed in, though 
 * this is an incredibly ugly interface, and hopefully I 
 * will find a clean way to work around it at some point.
 *
 * It also accepts a string version of the function to be
 * plotted.  It must be GLSL 1.0-compliant string version
 * of the function.  Parameters available are u, v, and t
 * representing the parametric coordinates u and v, and
 * a time variable t.  This string should provide three 
 * comma-separated expressions for the x, y and z coordinates.
 * For example, this would be a traditional surface:
 *    "u, v, f(u, v, t)"
 *
 * Currently options is not used, but eventually it will
 * include support for what coordinate space this function
 * is defined in, and so forth.
 */
function p_surface(string, umin, umax, vmin, vmax, options, source) {
	
	this.gl      = null;
	this.f       = string;
	this.options = options;
	
	// The buffer objects for displaying
	this.vertexVBO	= null;
	this.textureVBO = null;
	this.indexVBO	= null;
	
	this.umin = umin;
	this.umax = umax;
	this.vmin = vmin;
	this.vmax = vmax;
	
	/* A more apt name might be "resolution," as count is the number
	 * of samples along each axis (u and v) samples are taken. Being
	 * set to 100 means that it will produce 2 * 100 * 100 triangles.
	 * JavaScript (at least in WebKit) seems to only want up to 250x250
	 */
	this.count		= 250;
	this.index_ct   = 0;
	
	// Set a default texture source
	this.texture    = null;
	this.source     = source || "textures/kaust.png"
	this.parameters = null;

	/* This will likely be depricated, but it currently is hidden from
	 * the end programmer.
	 */
	this.initialize = function(gl, scr, parameters) {
		this.gl = gl;
		this.parameters = parameters;
		this.refresh(scr);
		this.gen_program();
	}
	
	/* Refresh is a way for the grapher instance to notify surface of
	 * changes to the viewing environment.
	 */
	this.refresh = function(scr) {
		this.gen_vbo(scr);
		this.texture = new texture(this.gl, this.source);
	}

	/* All primitives are responsible for knowing how to construct them-
	 * selves and so this is the function that constructs the VBO for
	 * the objects.
	 */
	this.gen_vbo = function(scr) {
		var vertices = [];
		var texture  = [];
		var indices  = [];
		
		var x = umin;
		var y = vmin;
		var dx = (umax - umin) / this.count;
		var dy = (vmax - vmin) / this.count;
		
		var xrepeat = 5;
		var yrepeat = 5;
		
		var tx = 0.0;
		var ty = yrepeat;
		var dtx = xrepeat / this.count;
		var dty = yrepeat / this.count;
		
		var i = 0;
		var j = 0;
		
		/* This calculates all the vertices and texture coordinates
		 * that will be used to represent the mesh.  The indices are
		 * calculated later.
		 */
		for (i = 0; i <= this.count; ++i) {
			y = vmin;
			ty = yrepeat;
			for (j = 0; j <= this.count; ++j) {
				vertices.push(x);
				vertices.push(y);
				
				texture.push(tx);
				texture.push(ty);
				
				y += dy;
				ty -= dty;
			}
			x += dx;
			tx += dtx;
		}
		
		var c = 0;
		indices.push(c)
		
		var inc = this.count + 1;
		var dec = inc - 1;
		
		/* Here we add all of the indices for the VBO.  This setup is
		 * non-trivial, but it can be derived.  I talk about this a little
		 * at http://dan.lecocq.us/wordpress/2009/12/25/triangle-strip-for-grids-a-construction/
		 */
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
		
		// If the VBO has already been declared, destroy it first
		if (this.vertexVBO) {
			this.gl.deleteBuffer(this.vertexVBO);
		}
		
		this.vertexVBO = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexVBO);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new WebGLFloatArray(vertices), this.gl.STATIC_DRAW);
		
		// If the VBO has already been declared, destroy it first
		if (this.textureVBO) {
			this.gl.deleteBuffer(this.textureVBO);
		}

		this.textureVBO = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureVBO);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new WebGLFloatArray(texture), this.gl.STATIC_DRAW);
		
		// If the VBO has already been declared, destroy it first
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
	this.draw = function(scr) {
		this.setUniforms(scr);
		
		this.gl.uniform1i(this.gl.getUniformLocation(this.program, "sampler"), 0);
		
		this.gl.enableVertexAttribArray(0);
		this.gl.enableVertexAttribArray(1);
		
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexVBO);
		this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, this.gl.FALSE, 0, 0);
		
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureVBO);
		this.gl.vertexAttribPointer(1, 2, this.gl.FLOAT, this.gl.FALSE, 0, 0);
		
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexVBO);
		
		this.texture.bind();
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
		// Prepare the vertex source
		var vertex_source = this.read("shaders/p_surface.vert").replace("USER_FUNCTION", this.f);
		
		if (this.options & CYLINDRICAL) {
			vertex_source = vertex_source.replace("/* CYLINDRICAL", "//* Cylindrical");	
		} else if (this.options & SPHERICAL) {
			vertex_source = vertex_source.replace("/* SPHERICAL", "//* Spherical");
		}
		
		var frag_source		= this.read("shaders/p_surface.frag");
		
		this.compile_program(vertex_source, frag_source);		
	}
}

p_surface.prototype = new primitive();