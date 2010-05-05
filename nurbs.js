/* This class encapsulates the flow primitive.
 */
function nurbs(string, options) {
	
	this.gl   = null;
	this.f    = string;
	
	/* This is one way in which the WebGL implementation of OpenGLot
	 * differs greatly from the C++ implementatiln.  WebGL (OpenGL 
	 * ES 2.0) does not support display lists, and instead I've moved
	 * the implementation to use vertex-buffer objects.  These are
	 * those.
	 */
	this.vertexVBO = null;
	this.lVBO      = null;
	this.indexVBO  = null;
	
	/* A more apt name might be "resolution," as count is the number
	 * of samples along each axis (x and y) samples are taken. Being
	 * set to 100 means that it will produce 2 * 100 * 100 triangles.
	 */
	this.count      = 150;
	this.index_ct   = 0;
	
	this.source   = null;
	// From the example at http://gul.sourceforge.net/viewdog-manual/node20.html
	this.us       = [0, 0, 0.5, 1];
	this.usTex    = null;
	this.vs       = [0, 0.25, 0.7, 1];
	this.vsTex    = null;
	this.cps      = [[[0, 0, 0, 1], [10, 0, 10, 1]],[[0, 10, 10, 1], [10, 10, 0, 1]]];
	this.cpsTex   = null;
	
	// This is the degree in the u direction, and v direction respectively
	this.nu		  = 1;
	this.nv       = 1;
	
	this.texture = null;

	/* This will likely be depricated, but it currently is hidden from
	 * the end programmer.
	 */
	this.initialize = function(gl, scr, parameters) {
		this.width  = scr.width ;
		this.height = scr.height;
		this.gl = gl;
		this.parameters = parameters;
		this.gen_program();
		this.refresh(scr);
	}
	
	/* Refresh is a way for the grapher instance to notify surface of
	 * changes to the viewing environment.  All the new information is
	 * contained in the screen object passed in, including the minimum
	 * and maximum x and y values for the surface. In the 3D implemen-
	 * tation, it's not commonly-used.
	 */
	this.refresh = function(scr) {
		this.gen_vbo(scr);
		
		us = this.us;
		f = function(pixels) {
			for (var i = 0; i < us.length; i += 1) {
				pixels[i * 4] = us[i];
			}
			return pixels;
		}
		this.usTex = ftexture(this.gl, us.length, 1, f);
		
		vs = this.vs;
		f = function(pixels) {
			for (var i = 0; i < vs.length; i += 1) {
				pixels[i * 4] = vs[i];
			}
			return pixels;
		}
		this.vsTex = ftexture(this.gl, vs.length, 1, f);
		
		cps = this.cps;
		f = function(pixels) {
			// For every column
			for (var i = 0; i < cps.length; i += 1) {
				// For every row
				row = cps[i];
				for (var j = 0; j < row.length; j += 1) {
					el = row[j];
					for (var k = 0; k < el.length; k += 1) {
						pixels[(i * row.length + j) * el.length + k] = el[k];
					}
				}
			}
			return pixels;
		}
		this.cpsTex = ftexture(this.gl, cps.length, cps[0].length, f);
		
		/*
		// For testing purposes, I wanted to make sure everything was there.
		for (var i = 0; i < cps.length; i += 1) {
			// For every row
			row = cps[i];
			str = "[";
			for (var j = 0; j < row.length; j += 1) {
				el = row[j];
				str += "[";
				for (var k = 0; k < el.length; k += 1) {
					if (k < el.length - 1) {
						str += el[k] + ", ";
					} else {
						str += el[k];
					}
				}
				str += "]";
			}
			str += "]";
			this.gl.console.log(str);
		}
		//*/
	}

	/* All primitives are responsible for knowing how to construct them-
	 * selves and so this is the function that constructs the VBO for
	 * the objects.
	 */
	this.gen_vbo = function(scr) {
		var vertices = [];
		var ls       = [];
		var indices  = [];
		
		var u = 0;
		var v = 0;
		var du = 1.0 / this.count;
		
		var i = 0;
		var j = 0;
		
		var lu = 0;
		var lv = 0;
		
		/* This could probably still be optimized, but at least it's now
		 * using a single triangle strip to render the mesh.  Much better
		 * than the alternative.
		 */
		for (i = 0; i <= this.count; ++i) {
			v = 0;
			while (this.us[lu + 1] <= u) {
				lu = lu + 1;
			}
			lv = 0;
			for (j = 0; j <= this.count; ++j) {
				vertices.push(u);
				vertices.push(v);
			
				while (this.vs[lv + 1] <= v) {
					lv = lv + 1;
				}	
				ls.push(lu);
				ls.push(lv);
				
				v += du;
			}
			u += du;
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
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new WebGLFloatArray(vertices), this.gl.STATIC_DRAW);
		
		this.lVBO = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.lVBO);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new WebGLFloatArray(ls), this.gl.STATIC_DRAW);
		
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
		scr.perspective();
		this.gl.viewport(0, 0, scr.width, scr.height);
		this.setUniforms(scr, this.program);
		this.gl.uniform1i(this.gl.getUniformLocation(this.program, "usTex" ), 0);
		this.gl.uniform1i(this.gl.getUniformLocation(this.program, "vsTex" ), 1);
		this.gl.uniform1i(this.gl.getUniformLocation(this.program, "cpsTex"), 2);
		
		this.gl.uniform2f(this.gl.getUniformLocation(this.program, "knotCounts"), this.us.length , this.vs.length);
		this.gl.uniform2f(this.gl.getUniformLocation(this.program, "cpDim"     ), this.cps.length, this.cps[0].length);
		this.gl.uniform2f(this.gl.getUniformLocation(this.program, "n"         ), this.nu, this.nv);
		
		this.gl.bindAttribLocation(this.program, 0, "position");
	    this.gl.bindAttribLocation(this.program, 1, "ls");
		
		this.gl.enableVertexAttribArray(0);
		this.gl.enableVertexAttribArray(1);
		
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexVBO);
		this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, this.gl.FALSE, 0, 0);
		
		// More texture support
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.lVBO);
		this.gl.vertexAttribPointer(1, 2, this.gl.FLOAT, this.gl.FALSE, 0, 0);
		
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexVBO);
		
		// Now, render into the normal render buffer, referencing
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
		
		// the recently-drawn texture
		this.gl.enable(this.gl.TEXTURE_2D);
		this.gl.activeTexture(this.gl.TEXTURE0);
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.usTex);
		this.gl.activeTexture(this.gl.TEXTURE1);
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.vsTex);
		this.gl.activeTexture(this.gl.TEXTURE2);
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.cpsTex);
		this.checkFramebuffer();
		
		this.gl.drawElements(this.gl.TRIANGLE_STRIP, this.index_ct, this.gl.UNSIGNED_SHORT, 0);
		//*/
		
		this.gl.disableVertexAttribArray(0);
		this.gl.disableVertexAttribArray(1);
	}
	
	/* Any class who inherits from the primitive class gets free access
	 * to shader compilation and program linking, but only must provide
	 * the fragment and vertex shader sources.  The primitive class also
	 * provides free access to functionality for reading files.
	 */
	this.gen_program = function() {		
		var vertex_source = this.read("shaders/nurbs.vert").replace("USER_FUNCTION", this.f);
		var frag_source   = this.read("shaders/nurbs.frag").replace("USER_FUNCTION", this.f);

		this.program      = this.compile_program(vertex_source, frag_source);
	}
}

nurbs.prototype = new primitive();