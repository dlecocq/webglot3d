// This class will encapsulate scalar fields
function surface(context, string, options) {
	
	this.gl   = context;
	this.f    = string;
	
	this.vertexVBO	= null;
	this.textureVBO = null;
	this.indexVBO		= null;
	
	this.count			= 100;

	this.initialize = function(scr) {
		this.refresh(scr);
		this.gen_program();
	}
	
	this.refresh = function(scr) {
		this.gen_vbo(scr);
	}

	this.gen_vbo = function(scr) {
		var vertices = [];
		var indices  = [];
		
		var x = -2;
		var y = -2;
		var dx = 4.0 / this.count;
		var dy = 4.0 / this.count;
		
		var i = 0;
		var j = 0;
		
		/* This could be heavily optimized.  Only count * count
		 * vertices are needed, but yet we store twice that. I
		 * don't think the forumla is trivial, but it will require
		 * further examination.
		 */
		for (i = 0; i < this.count; ++i) {
			y = -2;
			for (j = 0; j < this.count; ++j) {
				vertices.push(x);
				vertices.push(y);
				vertices.push(x);
				vertices.push(y + dy);
				vertices.push(x + dx);
				vertices.push(y + dy);
				vertices.push(x + dx);
				vertices.push(y);
				
				indices.push((i * this.count + j) * 4);
				indices.push((i * this.count + j) * 4 + 1);
				indices.push((i * this.count + j) * 4 + 2);
				indices.push((i * this.count + j) * 4);
				indices.push((i * this.count + j) * 4 + 2);
				indices.push((i * this.count + j) * 4 + 3);
	
				y += dy;
			}
			x += dx;
		}

		/* Add this soon */
		/*
		if (this.vertexVBO) {
			this.gl.console.log("deleting");
			this.gl.deleteBuffer(this.vertexVBO);
		}
		*/
		
		this.vertexVBO = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexVBO);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new WebGLFloatArray(vertices), this.gl.STATIC_DRAW);

		/* Support this later
		this.textureVBO = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureVBO);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new WebGLFloatArray(texture), this.gl.STATIC_DRAW);
		*/
		
		this.indexVBO = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexVBO);
		
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new WebGLUnsignedShortArray(indices), this.gl.STATIC_DRAW);
	}
	
	this.draw = function() {
		this.gl.enableVertexAttribArray(0);
		//this.gl.enableVertexAttribArray(1);
		
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexVBO);
		this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, this.gl.FALSE, 0, 0);
		
		/*
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureVBO);
		this.gl.vertexAttribPointer(1, 2, this.gl.FLOAT, this.gl.FALSE, 0, 0);
		*/
		
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexVBO);
		
		this.gl.drawElements(this.gl.TRIANGLES, this.count * this.count * 6, this.gl.UNSIGNED_SHORT, 0);
		
		this.gl.disableVertexAttribArray(0);
		//this.gl.disableVertexAttribArray(1);
	}
	
	this.gen_program = function() {
		var vertex_source = this.read("shaders/surface.vert").replace("USER_FUNCTION", this.f);
		var frag_source		= this.read("shaders/surface.frag");
		
		this.compile_program(vertex_source, frag_source);		
	}
}

surface.prototype = new primitive();