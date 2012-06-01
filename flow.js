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

/** This class encapsulates the flow surface primitive.
 *
 * It takes a string function of x, y, and t, renders it as
 * surface and simultaneously does image-based flow visualization
 * with the gradient of the function.  This gradient is approx-
 * imated numerically in the shader.
 *
 * @param {String} string is a function of x, y, and t for the surface
 * @param {int} options is just a place-holder for future changes
 * @requires primitive inherits from primitive
 * @requires screen  has a member reference to screen
 * @constructor
 */
function flow(string, options) {
	/** The WebGLContext we'll be using */
	this.gl   = null;
	/** The function we would like to render */
	this.f    = string;
	
	/** The VBO that holds vertex information */
	this.vertexVBO	= null;
	/** The VBO that holds texture information */
	this.textureVBO = null;
	/** The VBO that hold indices for rendering */
	this.indexVBO	= null;
	/** The number of indices in indexVBO to render */
	this.index_ct   = 0;
	
	/** A more apt name might be "resolution," as count is the number
	 * of samples along each axis (x and y) samples are taken. Being
	 * set to 100 means that it will produce 2 * 100 * 100 triangles.
	 */
	this.count		= 250;
	
	/** The source texture to distort and composite with
	 * to get the flow effect.  Typically, this will be a
	 * random noise texture */
	this.source = null;
	/** An empty texture we'll use for ping-pong rendering */
	this.ping   = null;
	/** A second empty texture for ping-pong rendering */
	this.pong   = null;
	/** The framebuffer object that we'll render into for the
	 * texture-advection calculations. */
	this.fbo    = null;
	
	/** @deprecated */
	this.texture = null;
	
	/** The shader program we'll use for calculating the
	 * advected texture stuff. */
	this.calc_program = null;

	/** This function is called by the grapher class so that the box
	 * has access to relevant information, but it is only initialized
	 * when grapher deems appropriates
	 *
	 * In the particular case of flow, it copies the height and width of
	 * the screen so that it knows how large of a random noise texture to
	 * generate, and then it's business as usual.
	 *
	 * @param {WebGLContext} gl a WebGL context, provided by grapher
	 * @param {screen} scr a reference to the screen object, provided by grapher
	 * @param {Array(String)} parameters an array of strings that will be used as parameters to the function
	 *
	 * @see grapher
	 */
	this.initialize = function(gl, scr, parameters) {
		this.width  = scr.width ;
		this.height = scr.height;
		this.gl = gl;
		this.parameters = parameters;
		this.refresh(scr);
		this.gen_program();
	}
	
	/** Refresh is a way for the grapher instance to notify surface
	 * of changes to the viewing environment.
	 *
	 * This method is meant to only be called by the grapher class.  It 
	 * initializes the ping-pong textures (used for storing intermediate
	 * states in the IBFV method), as well as a random noise texture, all
	 * to the appropriate sizes.  Additionally, it ensures that a frame-
	 * buffer object is available for use.
	 *
	 * @param {screen} scr required for information about the viewable screen
	 */
	this.refresh = function(scr) {
		this.gen_vbo(scr);
		
		if (this.ping) {
			// Delete texture
		}
		
		if (this.pong) {
			// Delete texture
		}
		
		if ((!this.source) || scr.width > (this.source.width * 2 + 100) || scr.height > (this.source.height * 2 + 100)) {
			console.log("Creating texture of size " + scr.width + " x " + scr.height);
			
			this.ping = new emptytexture(this.gl, scr.width, scr.height);
			//this.ping = new texture(this.gl, "textures/kaust.png").texture;
			this.pong = new emptytexture(this.gl, scr.width, scr.height);
			//this.pong = new texture(this.gl, "textures/kaust.png").texture;
			this.source = new noisetexture(this.gl, scr.width / 2, scr.height / 2);
			//this.source = new texture(this.gl, "textures/kaust.png").texture;
			
			this.gl.bindTexture(this.gl.TEXTURE_2D, null);
		}
		
		if (!this.fbo) {
			this.fbo = this.gl.createFramebuffer();
		}
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
	 * @param {screen} src is information about the viewable screen
	 */
	this.gen_vbo = function(scr) {
		var vertices = [];
		var texture  = [];
		var indices  = [];
		
		var x = scr.minx;
		var y = scr.miny;
		var tx = 0.0;
		var ty = 0.0;
		
		var dx = (scr.maxx - scr.minx) / this.count;
		var dy = (scr.maxy - scr.miny) / this.count;
		var dt = 1.0 / this.count;
		
		var i = 0;
		var j = 0;
		
		/* This could probably still be optimized, but at least it's now
		 * using a single triangle strip to render the mesh.  Much better
		 * than the alternative.
		 */
		for (i = 0; i <= this.count; ++i) {
			y = scr.miny;
			ty = 0.0;
			for (j = 0; j <= this.count; ++j) {
				vertices.push(x);
				vertices.push(y);
				texture.push(tx);
				texture.push(ty);
				
				y += dy;
				ty += dt;
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

		/* One of the options (currently anticipated from this version) is
		 * to color the surface with a normal map or a regular texture and
		 * lighting information for the perception of depth on the object.
		 */
		this.textureVBO = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureVBO);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(texture), this.gl.STATIC_DRAW);
		
		this.indexVBO = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexVBO);
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);
		
		this.index_ct = indices.length;
	}
	
	/** Calculate the next iteration of the IBFV algorithm
	 *
	 * As this primitive involves a two-pass process, the first (texture
	 * calculation) pass is contained in the calculate function.  Is is
	 * meant to only be called by draw.  Draw can make one (or more)
	 * calls to calculate before rendering the actual surface.
	 *
	 * @param {screen} scr the current screen object, passed in from draw
	 */
	this.calculate = function(scr) {
		this.setUniforms(scr, this.calc_program);
		this.gl.uniform1i(this.gl.getUniformLocation(this.calc_program, "accumulation"), 0);
		this.gl.uniform1i(this.gl.getUniformLocation(this.calc_program, "source"), 1);
		this.gl.viewport(0, 0, scr.width, scr.height);
		
		this.gl.enableVertexAttribArray(0);
		this.gl.enableVertexAttribArray(1);
		
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexVBO);
		this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, this.gl.FALSE, 0, 0);
		
		// More texture support
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureVBO);
		this.gl.vertexAttribPointer(1, 2, this.gl.FLOAT, this.gl.FALSE, 0, 0);
		
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexVBO);
		
		var tmp = this.ping;
		this.ping = this.pong;
		this.pong = tmp;
		
		// First, set up Framebuffer we'll render into
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo);
		this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.ping, 0);
		
		this.gl.activeTexture(this.gl.TEXTURE0);
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.pong);
		this.gl.activeTexture(this.gl.TEXTURE1);
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.source.texture);
		this.checkFramebuffer();
		
		// Then drawing the triangle strip using the calc program
		this.gl.drawElements(this.gl.TRIANGLE_STRIP, this.index_ct, this.gl.UNSIGNED_SHORT, 0);
		
		/*
		scr.set_uniforms(this.gl, this.program);
		// Then, on top of that, draw the current line set
		this.gl.useProgram(this.program);
		this.gl.drawElements(this.gl.LINE_STRIP, this.index_ct, this.gl.UNSIGNED_SHORT, 0);
		//*/
				
		this.gl.disableVertexAttribArray(0);
		this.gl.disableVertexAttribArray(1);
	}
	
	/** Every primitive is also responsible for knowing how to draw
	 * itself, and that behavior is encapsulated in this function.
	 *
	 * This method can be called at any time after initialization to draw
	 * the box to the screen.  Though, it is meant to be primarily called by
	 * grapher.
	 *
	 * It makes two calls to the calculate function, which does ping-pong
	 * rendering to calculate the IBFV texture (based again on the gradient
	 * of the supplied function).  Then, it renders the surface itself, with
	 * that texture applied.
	 *
	 * @param {screen} scr the current screen
	 */
	this.draw = function(scr) {
		scr.sfq();
		this.calculate(scr);
		this.calculate(scr);
		this.gl.viewport(0, 0, scr.width, scr.height);		

		scr.perspective();
		this.setUniforms(scr, this.program);
		this.gl.uniform1i(this.gl.getUniformLocation(this.program, "accumulation"), 0);
		
		this.gl.enableVertexAttribArray(0);
		this.gl.enableVertexAttribArray(1);
		
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexVBO);
		this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, this.gl.FALSE, 0, 0);
		
		// More texture support
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureVBO);
		this.gl.vertexAttribPointer(1, 2, this.gl.FLOAT, this.gl.FALSE, 0, 0);
		
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexVBO);
		
		// Now, render into the normal render buffer, referencing
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
		
		// the recently-drawn texture
		this.gl.activeTexture(this.gl.TEXTURE0);
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.ping);
		this.gl.drawElements(this.gl.TRIANGLE_STRIP, this.index_ct, this.gl.UNSIGNED_SHORT, 0);
		//*/
		
		this.gl.disableVertexAttribArray(0);
		this.gl.disableVertexAttribArray(1);
		
	}
	
	/** Generates the shader programs necessary to render this
	 * primitive
	 *
	 * This is a two-pass algorithm, and each pass requires a different
	 * shader program.  Most other primitives need only a single one,
	 * but this stores the calculate (calculation of the IBFV texture)
	 * program in this.calc_program, and the rendering shader in this.
	 * program.
	 */
	this.gen_program = function() {
		var vertex_source = this.read("shaders/flow.calc.vert").replace("USER_FUNCTION", this.f);
		var frag_source   = this.read("shaders/flow.calc.frag").replace("USER_FUNCTION", this.f);

                this.calc_program = this.compile_program(vertex_source, frag_source, { "position": 0, "aTextureCoord": 1 });
		
		var vertex_source = this.read("shaders/flow.vert").replace("USER_FUNCTION", this.f);
		var frag_source   = this.read("shaders/flow.frag").replace("USER_FUNCTION", this.f);

		this.program      = this.compile_program(vertex_source, frag_source, { "position": 0, "aTextureCoord": 1 });
	}
}

flow.prototype = new primitive();