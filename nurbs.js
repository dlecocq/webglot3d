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

/** This class encapsulates the NURBS surface primitive.
 *
 * Test class - everything is hard-coded right now, but it should
 * accept two knot-vectors, their degrees, and the associated
 * control points to represent a NURBS (non-uniform rational
 * B-spline) surface
 *
 * @param {String} string A carry-over form previously-written \
 *    classes, it doesn't make sense in the context of NURBS
 * @param {int} options is just a place-holder for future changes
 * @constructor
 * @requires primitive is a primitive
 * @requires screen has a reference to a screen
 */
function nurbs(string, options) {
	/** The WebGLContext we'll need to use and reference */
	this.gl   = null;
	/** The string representation of the function.  Again, this
	 * doesn't make sense in the context of NURBS
	 *
	 * @deprecated */
	this.f    = string;
	/** The VBO that stores vertex information */
	this.vertexVBO = null;
	/** The VBO that stores information about contol points */
	this.lVBO      = null;
	/** The VBO that store index information */
	this.indexVBO  = null;
	/** The number of indices in this.indexVBO to render */
	this.index_ct   = 0;
	/** A more apt name might be "resolution," as count is the number
	 * of samples along each axis (x and y) samples are taken. Being
	 * set to 100 means that it will produce 2 * 100 * 100 triangles.
	 */
	this.count      = 10;

	this.source   = null;
	// From the example at http://gul.sourceforge.net/viewdog-manual/node20.html
	/** The u-direction knot vector */
	this.us       = [0, 0, 1, 1];
	/** The texture to store basis functions for the u direction */
	this.usTex    = null;
	/** the v-direction knot vector */
	this.vs       = [0, 0, 1, 1];
	/** The texture to store basis functions for the v direction */
	this.vsTex    = null;
	/** The control points */
	this.cps      = [[[0, 0, 0, 1], [10, 0, 10, 1]],[[0, 10, 10, 1], [10, 10, 0, 1]]];
	/** The texture to use to store control points. */
	this.cpsTex   = null;
	//*/

	/*
	// Nathan Collier's example
	glot.add(new nurbs([0, 0, 0, 0.5, 1, 1, 1], [[0.0, 1.0, 0, 1], [3.3, 2.0, 0, 1], [6.7, 0.0, 0, 1], [10, 3, 0, 1]], 2, [0, 0, 1, 1]));
	//*/

	/*	
	this.us     = [0, 0, 0, 0.5, 1, 1, 1];
	this.usTex  = null;
	this.vs     = [0, 0, 1, 1];
	this.vsTex  = null;
	//this.cps    = [[[0, 1, 0, 1], [3.3, 2, 0, 1], [6.7, 0, 0, 1], [10, 3, 0, 1]], [[0, 1, 0, 1], [3.3, 2, 0, 1], [6.7, 0, 0, 1], [10, 3, 0, 1]]];
	//this.cps    = [[[0, 1, 0, 1], [0, 1, 0, 1]], [[3.3, 2, 0, 1], [3.3, 2, 0, 1]], [[6.7, 0, 0, 1], [6.7, 0, 0, 1]], [[10, 3, 0, 1], [10, 3, 0, 1]]];
	//this.cpsTex = null;
	this.cps    = [[0, 1, 0, 1], [3.3, 2, 0, 1], [6.7, 0, 0, 1], [10, 3, 0, 1]];
	this.cpsTex = null;
	//*/
	
	/** The degree of the NURBS surface in the u direction */
	this.nu		  = 2;
	/** The degree of the NURBS surface in the v direction */
	this.nv       = 1;
	
	this.texture = null;

	/** This function is called by the grapher class so that the box
	 * has access to relevant information, but it is only initialized
	 * when grapher deems appropriates
	 *
	 * In the particular case of nurbs, it copies the height and width of
	 * the screen and then it's business as usual.
	 *
	 * @param {WebGLContext} gl a WebGL context, provided by grapher
	 * @param {screen} scr a reference to the screen object, provided by grapher
	 * @param {Array(String)} parameters array of strings that will be used as parameters to the function
	 *
	 * @see grapher
	 */
	this.initialize = function(gl, scr, parameters) {
		this.width  = scr.width ;
		this.height = scr.height;
		this.gl = gl;
		this.parameters = parameters;
		this.gen_program();
		this.refresh(scr);
	}
	
	/** Refresh is a way for the grapher instance to notify surface
	 * of changes to the viewing environment.
	 *
	 * In the particular case of nurbs, it stores the control points of
	 * the NURBS surface as a texture, as well as the control points in
	 * both parameter directions.  It also makes a call to generate the
	 * VBO, which is just a dense triangular mesh, similar to flow, surface
	 * and p_surface.
	 *
	 * @param {screen} scr is required for information about the viewable screen
	 *
	 * @see flow
	 * @see surface
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
		
		/*
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
		//*/
		
		cps = this.cps;
		f = function(pixels) {
			for (var i = 0; i < cps.length; i += 1) {
				tmp = cps[i];
				for (var j = 0; j < tmp.length; j += 1) {
					pixels[i * 4 + j] = tmp[j];
				}
			}
			return pixels;
		}
		this.cpsTexture = ftexture(this.gl, this.cps.length, 1, f);
		
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
	 * @param {screen} scr is information about the viewable screen
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
	
	/** Every primitive is also responsible for knowing how to draw
	 * itself, and that behavior is encapsulated in this function.
	 *
	 * This method can be called at any time after initialization to draw
	 * the box to the screen.  Though, it is meant to be primarily called by
	 * grapher.
	 *
	 * In the particular case of nurbs, it sets pertinent parameters for
	 * the shader (the texture samplers, the number of knots, etc.) and 
	 * also binds the associated textures (control points, and knot vector)
	 *
	 * @param {screen} scr the current screen
	 */
	this.draw = function(scr) {
		scr.perspective();
		this.gl.viewport(0, 0, scr.width, scr.height);
		this.setUniforms(scr, this.program);
		this.gl.uniform1i(this.gl.getUniformLocation(this.program, "usTex" ), 0);
		this.gl.uniform1i(this.gl.getUniformLocation(this.program, "vsTex" ), 1);
		this.gl.uniform1i(this.gl.getUniformLocation(this.program, "cpsTex"), 2);
		
		this.gl.uniform2f(this.gl.getUniformLocation(this.program, "knotCounts"), this.us.length , this.vs.length);
		this.gl.uniform2f(this.gl.getUniformLocation(this.program, "cpCounts"  ), this.cps.length, this.cps[0].length);
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
	
	/** Generates the shader programs necessary to render this
	 * primitive
	 *
	 * This is the common case - one program, calling primitive's own
	 * compile_program method.
	 *
	 * NOTE: the calls to replace are a little misleading.  Remove them.
	 *
	 * @see primitive
	 */
	this.gen_program = function() {		
		var vertex_source = this.read("shaders/nurbs.vert").replace("USER_FUNCTION", this.f);
		var frag_source   = this.read("shaders/nurbs.frag").replace("USER_FUNCTION", this.f);

		this.program      = this.compile_program(vertex_source, frag_source);
	}
}

nurbs.prototype = new primitive();