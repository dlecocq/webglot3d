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

/** @class
 * This class encapsulates the surface primitive.
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
 *
 * @constructor
 * @param {String} string the function we should render
 * @param {int} options to specify the coordinate system to use
 * @param {String} source the path to an image to use as the texture
 * 
 * @requires primitive
 * @requires screen
 */
function surface(string, options, source) {
	/** The WebGLContext we'll be using throughout */
	this.gl   = null;
	/** The function we should be rendering */
	this.f    = string;
	
	/** The VBO that stores the coordinate information */
	this.vertexVBO	= null;
	/** The VBO that stores texture coordinate information */
	this.textureVBO = null;
	/** The VBO that stores indices */
	this.indexVBO	= null;
	/** The number of elements in indexVBO */
	this.index_ct   = 0;
	
	/** A more apt name might be "resolution," as count is the number
	 * of samples along each axis (x and y) samples are taken. Being
	 * set to 100 means that it will produce 2 * 100 * 100 triangles.
	 */
	this.count		= 250;
	
	/** The texture we should apply to the surface */
	this.texture    = null;
	/** The path to the image we should use as texture.  Defaults to kaust's logo */
	this.source     = source || "textures/kaust.png";

	/** This function is called by the grapher class so that the surface
	 * has access to relevant information, but it is only initialized
	 * when grapher deems appropriates
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
	 * just makes a call to generate the vertex buffer object to draw
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
	 * This class generates a dense triangular mesh, and evaluates the
	 * function at each of those points
	 *
	 * @param {screen} src information about the viewable screen
	 */
	this.gen_vbo = function(scr) {
		var vertices = [];
		var texture  = [];
		var indices  = [];
		
		var texrepeat = 3;
		
		var x = scr.minx;
		var y = scr.miny;
		var dx = (scr.maxx - scr.minx) / this.count;
		var dy = (scr.maxy - scr.miny) / this.count;
		
		var tx = 0.0;
		var ty = texrepeat;
		var dt = texrepeat / this.count;
		
		var i = 0;
		var j = 0;
		
		/* This could probably still be optimized, but at least it's now
		 * using a single triangle strip to render the mesh.  Much better
		 * than the alternative.
		 */
		for (i = 0; i <= this.count; ++i) {
			y = scr.miny;
			ty = texrepeat;
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
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);

		this.textureVBO = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureVBO);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(texture), this.gl.STATIC_DRAW);
		
		this.indexVBO = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexVBO);
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);
		
		this.index_ct = indices.length;
	}
	
	/** Every primitive is also responsible for knowing how to draw itself,
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
	
	/** Generates the shader programs necessary to render this
	 * primitive.  Generates the shader program, and replaces 
	 * the code blocks (if necessary) to do coordinate conversions
	 * in the shader.
	 */
	this.gen_program = function() {
		var vertex_source = this.read("shaders/surface.vert").replace("USER_FUNCTION", this.f);
		var frag_source		= this.read("shaders/surface.frag");
		
		vertex_source = vertex_source.replace("/* CYLINDRICAL", "//* Cylindrical")
		
		this.compile_program(vertex_source, frag_source, { "vPosition": 0, "vTexCoord": 1 });
	}
}

surface.prototype = new primitive();