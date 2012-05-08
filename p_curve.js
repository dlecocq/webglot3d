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

/** This class encapsulates the parametric curve primitive.
 *
 * @class 
 * It also accepts a string version of the function to be
 * plotted.  It must be GLSL 1.0-compliant string version
 * of the function.  Parameters available are s, and t
 * representing the parametric coordinate s, and a time
 * variable t.  This string should provide three  comma-
 * separated expressions for the x, y and z coordinates.
 *
 * This primitive actually renders a sweep volume (of a
 * circle) for the space curve.  Basically, this give it 
 * the appearance of being a noodle or string in space.
 * This is accomplished by apprximating the first and second
 * derivatives of the function.  The second derivative is
 * perpendicular to the tangent (first derivative), and 
 * then we take the cross product of the two.  These form
 * a basis for the plan normal to the tangent, and by taking
 * linear combinations of these two unit vectors, we create
 * a circle perpendicular to the curve.  By connecting
 * these, we get a sweep volume.
 *
 * @constructor
 * @param {String} string a the 3-component space curve to plot
 * @param {Number} umin the minimum s value to take on
 * @param {Number} umax the maximum s value to take on
 * @param {int} options the coordinate system to use
 * @param {String} source the path to the texture to be applied
 *
 * @depends primitive is a primitive
 * @depends screen has a member reference
 */
function p_curve(string, umin, umax, options, source) {
	/** The WebGLContext we'll be using */
	this.gl      = null;
	/** The function we'd like to plot */
	this.f       = string;
	/** The local copy of the coordinate options */
	this.options = options;
	/** The VBO that holds vertex information */
	this.vertexVBO	= null;
	/** The VBO that hold the texture coordinate information */
	this.textureVBO = null;
	/** The VBO that holds the indices to render */
	this.indexVBO	= null;
	/** The number of indices stored in indexVBO */
	this.index_ct   = 0;
	/** Local copy of umin, the minimum s parameter */
	this.umin = umin;
	/** Local copy of umax, the maximum s parameter */
	this.umax = umax;
	
	/** A more apt name might be "resolution," as count is the number
	 * of samples along each axis (u and v) samples are taken. Being
	 * set to 100 means that it will produce 2 * 100 * 100 triangles.
	 * JavaScript (at least in WebKit) seems to only want up to 250x250
	 */
	this.count		= 250;
	
	/** The WebGLTexture applied to the surface */
	this.texture    = null;
	/** The path of an image that we'll use for the texture */
	this.source     = source || "textures/kaust.png"
	/** The parameters used in the shader */
	this.parameters = null;

	/** This function is called by the grapher class so that the p_curve
	 * has access to relevant information, but it is only initialized
	 * when grapher deems appropriates
	 *
	 * In the particular case of p_curve, it's business as usual, simply
	 * copying variable to local attributes
	 *
	 * @param {WebGLContext} gl a WebGL context, provided by grapher
	 * @param {screen} scr is a reference to the screen object, provided by grapher
	 * @param {Array(String)} parameters array of strings that will be used as parameters to the function
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
	 * This method is meant to only be called by the grapher class. It
	 * just makes a call to generate the vertex buffer object to draw,
	 * and makes sure that we have the texture we're planning to apply
	 * to the noodle
	 *
	 * @param {screen} scr required for information about the viewable screen
	 */
	this.refresh = function(scr) {
		this.gen_vbo(scr);
		this.texture = new texture(this.gl, this.source);
	}

	/** All primitives are responsible for knowing how to construct
	 * themselves and so this is the function that constructs the VBO for
	 * the objects.
	 *
	 * This method is meant to be private, and it generates a VBO for the
	 * six faces of a cube in the same fashion as datasurface.
	 *
	 * @param {screen} src information about the viewable screen
	 * @private
	 */
	this.gen_vbo = function(scr) {
		var vertices = [];
		var texture  = [];
		var indices  = [];
		
		var x = umin;
		var y = 0;
		var dx = (umax - umin) / this.count;
		var dy = 2 * Math.PI / this.count;
		
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
			y = 0;
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
	 * the p_curve to the screen.  Though, it is meant to be primarily 
	 * called by grapher.
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
	 * primitive.  Generates the shader program, and replaces 
	 * the code blocks (if necessary) to do coordinate conversions
	 * in the shader.
	 */
	this.gen_program = function() {
		// Prepare the vertex source
		var vertex_source = this.read("shaders/p_curve.vert").replace("USER_FUNCTION", this.f);
		
		if (this.options & CYLINDRICAL) {
			vertex_source = vertex_source.replace("/* CYLINDRICAL", "//* Cylindrical");	
		} else if (this.options & SPHERICAL) {
			vertex_source = vertex_source.replace("/* SPHERICAL", "//* Spherical");
		}
		
		var frag_source		= this.read("shaders/p_curve.frag");
		
		this.compile_program(vertex_source, frag_source);		
	}
}

p_curve.prototype = new primitive();