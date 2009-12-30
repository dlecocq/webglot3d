/* This is a parent class for all primitives.  Inheriting from
 * it is not strictly necessary (as this is JavaScript), but it
 * provides access to some very valuable functions.
 *
 * For example, it encapsulates reading of filenames, and shader
 * program compilation and linking
 */
function primitive(context) {
	
	/* There is, I'm sure, a much more robust way of determining 
	 * the best path for use as a base.  However, I've not happened
	 * upon it yet.  Perhaps there is already a convention in place?
	 */
	this.BASE		 = "file:///Users/dlecocq/TTRG/webGLot3d/src/";
	//this.BASE			 = "http://dan.lecocq.us/wordpress/webGLot3d/"
	this.program = null;
	
	/* Encapsulates reading a file, usually for shader source inc-
	 * lusion. There may be a faster and/or more robust way of doing
	 * this, but the encapsulation makes for easy changes.
	 */
	this.read = function(filename) {
		var request = new XMLHttpRequest();
		var url = this.BASE + filename;
		
		request.open("GET", url, false);
		request.send();
		return request.responseText;
	}
	
	/* Compile AND link the shader program
	 *
	 * Give it vertex source and shader source, and it will populate
	 * this.program with a shader program.  It prints out errors to 
	 * the console, which can prove extremely helpful.
	 */
	this.compile_program = function(vertex_source, frag_source) {
		var vertex_shader = this.gl.createShader(this.gl.VERTEX_SHADER);
		var frag_shader		= this.gl.createShader(this.gl.FRAGMENT_SHADER);
		
		this.gl.shaderSource(vertex_shader, vertex_source);
		this.gl.shaderSource(	 frag_shader, frag_source);

		this.gl.compileShader(vertex_shader);
		this.gl.compileShader(frag_shader);
		
		/* You can handle the compile status with the code provided by 
		 * Khronos or every WebGL demo anywhere.  In fact, that's where
		 * this code came from.
		 */
		var compiled = this.gl.getShaderParameter(vertex_shader, this.gl.COMPILE_STATUS);
		if (!compiled) {
				// Something went wrong during compilation; get the error
				var error = this.gl.getShaderInfoLog(vertex_shader);
				this.gl.console.log("Error in compiling vertex shader: " + error);
				return null;
		}
		
		compiled = this.gl.getShaderParameter(frag_shader, this.gl.COMPILE_STATUS);
		if (!compiled) {
				// Something went wrong during compilation; get the error
				var error = this.gl.getShaderInfoLog(frag_shader);
				this.gl.console.log("Error in compiling fragment shader: " + error);
				return null;
		}

		// Create the program object
		this.program = this.gl.createProgram();

		// Attach our two shaders to the program
		this.gl.attachShader(this.program, vertex_shader);
		this.gl.attachShader(this.program, frag_shader);

		// Link the program
		this.gl.linkProgram(this.program);

		/* You can check link status with this code, found at Khronos
		 * and every WebGL demo everywhere
		 */
		var linked = this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS);
		if (!linked) {
				// something went wrong with the link
				var error = this.gl.getProgramInfoLog (this.program);
				this.gl.console.log("Error in program linking:"+error);
				/* It's probably a best practice to delete the compiled
				 * shaders in this case.  You should implement that.
				 */
				return null;
		}
	}
	
}