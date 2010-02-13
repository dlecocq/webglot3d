/* This class encapsulates the grapher.
 *
 * In the C++ implementation of OpenGLot, it's a singleton class,
 * but here it's a proper object.  This is mostly because I'm not
 * sure if JavaScript can describe the design pattern.
 */
function grapher() {

	/* About the view environment.
	 * Some of these are inherited from the 2d version, but do not
	 * map well to the 3d version and will be depricated in future
	 * releases
	 */
	this.scr     = new screen();
	this.axes_dl = null;
	this.grid_dl = null;
	this.gl			 = null;
	this.wall		 = null;
	
	// Trackball interface variables
	this.mouse_down = null;
	this.axis       = [0, 0, 0];
	this.angle      = 0;
	this.moving     = false;
	this.rotation   = null;

	// The view angle for the projection matric
	this.alpha = 8;
	
	// A framerate timer
	this.framerate	= null;
	this.framecount = 0;
	
	this.primitives = new Array();

	/* As the WebGL specification is still in flux, this is a wrapper
	 * for getting a WebGL context for drawing.  Specifically, the 
	 * string used to query for the context of the canvas is not only
	 * browser specific, but version specific as well.
	 */
	this.getContext = function() {
		/* Though the canvas name is hard-coded, it will likely be moved
		 * to a parameter if multiple view contexts are desired.
		 */
		var canvas = document.getElementById("glot");
	
		var gl = null;
	
		/* These seem to the be the context names for most current imp-
		 * lementations around now.
		 */
		var strings = ["experimental-webgl", "moz-webgl", "webkit-3d", "webgl"];
		
		for (var i = 0; i < strings.length; ++i) {
			try {
				if (!gl) {
					gl = canvas.getContext(strings[i]);
				} else {
					break;
				}
			} catch (e) { }
		}
	
		return gl;
	}
	
	/* This returns the 3D point clicked, on a unit glass ball centered
	 * at the origin.  This still has a couple of bugs, not the least of
	 * which is that event coordinates are not cross-browser compatible.
	 * Unhappiness about this fact ensues.
	 */
	this.coordinates = function(x, y) {
		var canvas = document.getElementById("glot");
		var w = canvas.clientWidth;
		var h = canvas.clientHeight;
		
		var min = h;
		var y_margin = 0;
		var x_margin = (w - h) / 2;
		if (h > w) {
			min = w;
			y_margin = 0;
			x_margin = (h - w) / 2;
		}
		
		var i =   (2 * (x - x_margin)) / min - 1;
		var j = - (2 * (y - y_margin)) / min + 1;
		
		if (x < x_margin) {
			i = -1.0;
		} else if ( x > (w + x_margin)) {
			i = 1.0;
		}
		
		if (y < y_margin) {
			j = -1.0;
		} else if (y > (h + y_margin)) {
			j = 1.0;
		}
		
		var l = Math.sqrt(i * i + j * j) + 0.000001;
		
		if (l > 1.0) {
			i /= l;
			j /= l;
		}
		
		var k = Math.sqrt(1 - i * i - j * j);
		
		//this.gl.console.log("(x, y, z) : (" + i + ", " + j + ", " + k + ")");
		
		return new ray(i, j, k);
	}

	/* The mouse-down handler. It's provided with the context's x and y
	 * coordinates, but these are not guaranteed to be cross-browser
	 * compatible.  Still, it's mostly an internal function.  Access to
	 * specifying one's own click functions may be added, though it's
	 * probably less valuable in the 3d version than the 2d.
	 */
	this.mousedown = function(x, y) {
		this.mouse_down = this.coordinates(x, y);
		this.axis.x = this.axis.y = this.axis.z = 0;
		this.angle = 0;
		this.moving = true;
	}
	
	/* The call-back handler for mouse movement.  Like mousedown, it's
	 * provided with the x and y coordinates of the event, though again
	 * they are not cross-browser apparently.  Still have test some other
	 * browsers.
	 */
	this.mousemove = function(x, y) {
		if (this.moving) {
			this.mouse_current = this.coordinates(x, y);
			this.axis = this.mouse_down.cross(this.mouse_current);
			this.angle = Math.acos(this.mouse_down.dot(this.mouse_current) / (this.mouse_current.length() * this.mouse_down.length()));
			this.angle *= (180 / 3.14159265);
			this.display();
		}
	}
	
	/* Mouse release handler
	 */
	this.mouseup = function() {
		this.moving = false;
		this.rotation.rotate(this.angle, this.axis.x, this.axis.y, this.axis.z);
	}
	
	/* The keyboard event handler.  Again, the browser wars make life
	 * difficult, as it seems (though I'm not a JavaScript expert) that
	 * this varies between browsers.  As I understood it, keyCode was
	 * supposed to be an ASCII character code, but it's not been my
	 * experience so far.  I would like to abstract this way so that a
	 * string version of the key is provided, but String.fromCharCode
	 * doesn't seems to be working as I expect.  Future versions will
	 * fix this.
	 */
	this.keyboard = function(key_event) {
		var key = Number(key_event.keyCode);
		//this.gl.console.log(key + " key pressed.");
		if (key == 189) {
			this.zoom_out();
			this.display();
		} else if (key == 187) {
			this.zoom_in();
			this.display();
		}
	}

	/* This function must be called after an instance of glot has been
	 * created and before it's used for drawing (read: primitives) added
	 * to it.  Future work will automatically call this at instantiation
	 * to avoid some headache.
	 */
	this.initialize = function() {
		/* This is some initialization that the OpenGL / GLUT version of
		 * openGLot did programatically after creating the context. But,
		 * in WebGL, they are passed in as parameters into the initial-
		 * ization phase, but I'm not yet sure as to the syntax.	Add this
		 * in for later versions.	 Provisionally disabled.
		 */
		/*
		// Set the color mode (double with alpha)
		glutInitDisplayMode(GLUT_DOUBLE | GLUT_RGBA);
		*/
		//*
		var canvas = document.getElementById("glot");
		canvas.glot = this;
		
		/* When callbacks are registered, they have an assortment of different
		 * owners (notably the canvas and the document).  To simplify the call,
		 * the registration sets it up so that in the context of the function, 
		 * "this" refers to the grapher instance.
		 */
		var f = function(event) { this.glot.mousedown(event.clientX, event.clientY) };
		canvas.onmousedown = f;
		
		f = function(event) { this.glot.mouseup(event.clientX, event.clientY) };
		canvas.onmouseup = f;
		
		f = function(event) { this.glot.mousemove(event.clientX, event.clientY) };
		canvas.onmousemove = f;
		
		f = function(event) { this.getElementById("glot").glot.keyboard(event) };
		document.onkeydown = f;
		
		this.rotation = new CanvasMatrix4();
	
		this.gl = this.getContext();
		var gl = this.gl;

		if (!gl) {
			alert("Can't find a WebGL context; is it enabled?");
			return null;
		}

		/* Enable some features I'd like to use.
		 */
		gl.enable(gl.POINT_SMOOTH);
		gl.enable(gl.VERTEX_ARRAY);
		gl.enable(gl.LINE_SMOOTH);
		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.BLEND);
	
		// Other smoothness and blending options
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.hint(gl.LINE_SMOOTH_HINT, gl.DONT_CARE);
	
		// Set the line width and point size
		gl.lineWidth(1.5);
		
		this.setDomain(-2, 2, -2, 2);
		
		/* WebGL doesn't support this, it seems.  OpenGL ES 2.0 elliminated
		 * it to obviate the need for dedicated hardware for this task,
		 * which is a luxury in some sense.
		 *
		 * gl.pointSize(7);
		 */
	
		// Default color is black
		gl.clearColor(0.0, 0.0, 0.0, 1.0);

		/* This was included in the webkit examples, but my JavaScript
		 * is weak, and I'm not quite sure what exactly this means.
		 * Add a console
		 */
		var canvas = document.getElementById("glot");
		gl.console = ("console" in window) ? window.console : { log: function() { } };
	
		/* The Provisional WebGL spec has something to say on maniuplating
		 * the view size programatically.	 It's tied to the canvas element
		 * size, and certain conditions and post-conditions must be satis-
		 * fied, so proceed with caution.
		 *
		 * The reshape function is called once for every time that display
		 * is called, and the screen's values are adjusted accordingly.
		 */
		this.scr.width = this.scr.height = 500;

		/* This is a timer for framerate calculation
		 */
		this.framerate = new stopwatch();
		this.framerate.start();

		/* This is a timer for function's attributes
		 */
		this.wall = new stopwatch();
		this.wall.start();

		// Determine the axes and grid
		//this.axes_dl = this.axes_dl_gen();
		//this.grid_dl = this.grid_dl_gen();
		
		/* Normally we'd run some checks about what capabilities are enabled
		 * (like fragment, vertex and geometry shaders), but for now it at
		 * least seems that all WebGL implementations are more or less OpenGL
		 * 2.0 ES, and have fragment and vertex shaders, and not geometry
		 * shaders
		 */
	
		this.framecount = 0;
		
		/* This is truly ugly as sin, but for the time being, it works.
		 *
		 * I can't figure out how to get grapher::display to work when called
		 * explicitly from glot.html, and the only way I've been able to figure
		 * out to display, is to use an interval function.  If I just want it
		 * to display once, then that means setTimeout.  Otherwise, that calls
		 * for animation.
		 *
		 * An unfortunate consequence of this is that it implies that there's a
		 * single grapher in the context of a webpage, but the roadmap would not
		 * like to limit grapher to this.
		 */
		window.glot = this;
		window.setTimeout(function() { this.glot.display(); }, 1);
	
		// In the future, this ought to return some encoded value of success or failure.
		return 0;
	}
	
	/* Yet to be written.  Really necessary in the 3D version?  Probably,
	 * I guess.
	 */
	this.axes_dl_gen = function() {
		
	}

	/* This function will draw a single frame to the canvas. It should in future
	 * versions be the extent of the request to redraw (and it looks like that
	 * will happen with a SetInterval call).  For now, it asks that reshape
	 * be called once for each time it's called, or at least after any reshaping
	 * takes place.  Perhaps it should be the end programmer's responsibility
	 * to worry about this?  Perhaps not.
	 */
	this.display = function() {
		this.reshape();
		
		var gl = this.getContext();
		
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		var program				 = null;
		var mvMat_location = null;
		var prMat_location = null;
		var mvinv_location = null;
		var time_location	 = null;
		
		gl.modelviewMatrix = new CanvasMatrix4();
		gl.modelviewMatrix.translate(-(this.scr.minx + this.scr.maxx) / 2.0, -(this.scr.miny + this.scr.maxy) / 2.0, 0.0);
		gl.modelviewMatrix.multRight(this.rotation);
		if (this.moving) {
			gl.modelviewMatrix.rotate(this.angle, this.axis.x, this.axis.y, this.axis.z);
		}
		gl.modelviewMatrix.translate(0, 0, -30);
		
		var inverseMV = new CanvasMatrix4(glot.gl.modelviewMatrix);
		inverseMV.invert();

		for (var i in this.primitives) {
			//*
			program = this.primitives[i].program;
			
			gl.useProgram(program);
			
			// Set all the uniforms for the program
			mvMat_location = gl.getUniformLocation(program, "u_modelViewMatrix");
			prMat_location = gl.getUniformLocation(program, "u_projectionMatrix");
			mvinv_location = gl.getUniformLocation(program, "u_modelViewInverse");
			time_location	 = gl.getUniformLocation(program, "t");
		
			gl.uniformMatrix4fv(mvMat_location, false, gl.modelviewMatrix.getAsWebGLFloatArray());
			gl.uniformMatrix4fv(prMat_location, false, gl.projectionMatrix.getAsWebGLFloatArray());
			gl.uniformMatrix4fv(mvinv_location, false, inverseMV.getAsWebGLFloatArray());
			gl.uniform1f(time_location, this.wall.time());
			//*/
			
			this.primitives[i].draw(this.scr);
		}
		
		gl.flush();
		
		/* The framerate printing asks for an html element with the id
		 * "framerate," though there ought to be a better way of handling
		 * it programatically.  Open to suggestions.
		 */
		this.framecount = this.framecount + 1;
		if (this.framecount == 150) {
			document.getElementById("framerate").innerHTML = "Framerate : " + 150 / this.framerate.time();
			this.framecount = 0;
			this.framerate = new stopwatch();
			this.framerate.start();
		}
		
		gl.finish();
	}

	/* Every time that VBOs need to be refreshed, this function can be 
	 * called, and all included primitives will re-instantiate their VBOs
	 * if necessary.  It's a primitive's responsibility to know if the
	 * change requires it, based on the given new screen.
	 */
	this.refresh = function() {
		for (var i = 0; i < this.primitives.length; ++i) {
			this.primitives[i].refresh(this.scr);
		}
	}
	
	/* It's all in the name
	 */
	this.zoom_in = function() {
		this.alpha /= 1.1;
	}
	
	/* It's all in the name
	 */
	this.zoom_out = function() {
		this.alpha *= 1.1;
	}

	/* Call this as often as you'd like, it will check to see if there
	 * have been any changes in the canvas' size, and if so, it performs
	 * all the necessary operations.
	 */
	this.reshape = function() {
		var canvas = document.getElementById("glot");
		var context = this.getContext();
	
		var w = canvas.clientWidth;
		var h = canvas.clientHeight
	
		/* If the width and height of the resized canvas are already
		 * the stored sizes, return and do nothing.
		 */
		if (w == this.scr.width && h == this.scr.height) {
			return;
		}
	
		context.viewport(0, 0, w, h);

		// Set the projection
		context.projectionMatrix = new CanvasMatrix4();
		//context.projectionMatrix.lookat(0, 0, 6, 0, 0, 0, 0, 1, 0);
    context.projectionMatrix.perspective(this.alpha, w / h, 10, 1000);

		//glutPostRedisplay();
	}
	
	/* Add a primitive to the container.
	 */
	this.add = function(primitive) {
		this.primitives.push(primitive);
		primitive.initialize(this.gl, this.scr);
	}
	
	/* This wraps all the code for animation to take place.
	 */
	this.run = function() {
		window.glot = this;
		window.setInterval(function() { this.glot.display(); }, 10);
	}
	
	this.setDomain = function(minx, maxx, miny, maxy) {
		this.scr.minx = minx;
		this.scr.maxx = maxx;
		this.scr.miny = miny;
		this.scr.maxy = maxy;
		this.refresh();
	}
	
	this.initialize();
}