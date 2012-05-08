/* Copyright (c) 2009-2010 King Abdullah University of Science and Technology
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/** This class encapsulates the parametric surface primitive.
 *
 * @class
 * Parameters available are u, v, and t representing the 
 * parametric coordinates u and v, and a time variable t.  This 
 * string should provide three comma-separated expressions for
 * the x, y and z coordinates (or r, theta, phi for spherical
 * coordinates and r, theta, z for cylindrical coordinates)
 * 
 * For example, this would be a traditional surface:
 *    "u, v, f(u, v, t)"
 *
 * The default is to use cartesian coordinates, but the programmer
 * can use cylindrical or spherical coordinates by passing in
 * SPHERICAL or CYLINDRICAL as the options parameter.  These constants
 * are defined elsewhere in the primitive class.
 *
 * @constructor
 * @param {String} string is a function of u, v, and t for the surface
 * @param {Number} umin is the u-parameter minimum
 * @param {Number} umax is the u-parameter maximum
 * @param {Number} vmin is the v-parameter minimum
 * @param {Number} vmax is the v-parameter maximum
 * @param {int} options is for the user to specify coordinate system
 * @param {String} source is a path to an image to be used as the texture.
 *
 * @depends primitive
 * @depends screen
 */
function p_surface(string, umin, umax, vmin, vmax, options, source) {
	/** The WebGLContext we'll be using */
	this.gl      = null;
	/** The local copy of the function we'd like to render */
	this.f       = string;
	/** The coordinate transformation options */
	this.options = options;
	/** The VBO that stores the vertex information */
	this.vertexVBO	= null;
	/** The VBO that store texture information */
	this.textureVBO = null;
	/** The VBO that stores the indices to render */
	this.indexVBO	= null;
	/** The number of elements in indexVBO */
	this.index_ct   = 0;
	
	/** The minimum value the u parameter should take on */
	this.umin = umin;
	/** The maximum value the u parameter should take on */
	this.umax = umax;
	/** The minimum value the v parameter should take on */
	this.vmin = vmin;
	/** The maximum value the v parameter should take on */
	this.vmax = vmax;
	
	/** A more apt name might be "resolution," as count is the number
	 * of samples along each axis (u and v) samples are taken. Being
	 * set to 100 means that it will produce 2 * 100 * 100 triangles.
	 * JavaScript (at least in WebKit) seems to only want up to 250x250
	 */
	this.count		= 250;
	
	/** The WebGLTexture we'll apply to the surface */
	this.texture    = null;
	/** The path to the image we'll store as the texture */
	this.source     = source || "textures/kaust.png"
	/** The parameters that should be added to the shader source */
	this.parameters = null;

	/** This function is called by the grapher class so that the box
	 * has access to relevant information, but it is only initialized
	 * when grapher deems appropriates
	 *
	 * This is a very typical initialize function - just copies the supplied
	 * objects to member variables for later access, and then generates the
	 * shader program.
	 *
	 * @param {WebGLContext} gl is an WebGL context, provided by grapher
	 * @param {screen} scr is a reference to the screen object, provided by grapher
	 * @param {Array(String)} parameters is an array of strings that will be used as parameters to the function
	 *
	 * @see grapher
	 */
	this.initialize = function(gl, scr, parameters) {
		this.gl = gl;
		this.parameters = parameters;
		this.refresh(scr);
		this.gen_program();
	}
	
	/** Refresh is a way for the grapher instance to notify surface
	 * of changes to the viewing environment.
	 *
	 * In the particular case of p_surface, it makes a call to generate the
	 * vertex buffer object, and then grabs the image in this.source to 
	 * use as a texture.
	 *
	 * @param {screen} scr is required for information about the viewable screen
	 */
	this.refresh = function(scr) {
		this.gen_vbo(scr);
		this.texture = new texture(this.gl, this.source);
	}

	/** All primitives are responsible for knowing how to construct
	 * themselves and so this is the function that constructs the VBO for
	 * the objects.
	 *
	 * This method is meant to be private, and it generates a triangle 
	 * strip representation of a mesh of the resolucation this.count. For
	 * JavaScript in particular, it's important to use triangle strips 
	 * INSTEAD OF just triangles, because of the limits of array sizes.
	 * You can obtain a much-higher resolution mesh by using strips.
	 *
	 * It's very similar to the mesh used in flow and surface, but with
	 * the distinction that the coordinates are in [umin, vmin] x [umax
	 * vmax].
	 *
	 * @param {screen} src is information about the viewable screen
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
	
	/** Every primitive is also responsible for knowing how to draw
	 * itself, and that behavior is encapsulated in this function.
	 *
	 * This method can be called at any time after initialization to draw
	 * the box to the screen.  Though, it is meant to be primarily called by
	 * grapher.
	 *
	 * @param {screen} scr the current screen
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
	
	/** Generates the shader programs necessary to render this
	 * primitive
	 *
	 * This injects the string representation of the function into the
	 * shader source at the appropriate location.  It also activates
	 * the embedded (in the shader source) coordinate transformation 
	 * blocks if necessary.
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