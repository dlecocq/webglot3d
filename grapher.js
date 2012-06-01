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

/** This class is a container and administrator for all the
 * primitives the user would like to plot.
 *
 * It is with grapher that the user has most interaction, from
 * setting parameters, changing the view direction and so forth
 * to adding and removing primitives.
 *
 * @requires screen has a member reference to screen
 * @requires primitive it maintains a list of primitives to render
 * @requires stopwatch uses to keep track of framerates
 * @constructor
 */
function grapher() {
	/** The screen object manages all of the view matrices */
	this.scr     = new screen();
	/** @deprecated */
	this.axes_dl = null;
	/** @deprecated */
	this.grid_dl = null;
	/** The WebGLContext we'll be using throughout this */
	this.gl		 = null;
	/** The stopwatch to keep track of the time variable */
	this.wall	 = null;
	/** The {@link ray} object that keeps track of where
	 * the mouse was last clicked down.  This is used for
	 * the trackbacll interface.
	 */
	this.mouse_down = null;
	/** The axis about which the current rotation is happening */
	this.axis       = [0, 0, 0];
	/** The angle about axis that the current rotation is happening */
	this.angle      = 0;
	/** Whether or not we are actually moving the trackball */
	this.moving     = false;
	
	/** A {@link stopwatch} to keep track of framerates */
	this.framerate	= null;
	/** The number of frames we've rendered since we last reset 
	 * the framerate stopwatch */
	this.framecount = 0;
	/** An array of primitives that we should render */
	this.primitives = new Array();
	/** An array of strings, denoting the names of parameters 
	 * we should insert into newly-created shader programs. */
	this.parameters = new Array();
	/** A user-settable function that gets called when the mouse is clicked */
	this.userClickFunction    = null;
	/** A user-settable function that gets called when keys are pressed */
	this.userKeyboardFunction = null;

	/** As the WebGL specification is still in flux, this is a 
	 * wrapper for getting a WebGL context for drawing.  Specifically,
	 * the string used to query for the context of the canvas is not 
	 * only browser specific, but version specific as well.
	 */
	this.getContext = function() {
		if (this.gl)
			return this.gl;

		/* Though the canvas name is hard-coded, it will likely be moved
		 * to a parameter if multiple view contexts are desired.
		 */
		var canvas = document.getElementById("glot");
	
		/* These seem to the be the context names for most current imp-
		 * lementations around now.
		 */
		var strings = ["experimental-webgl", "moz-webgl", "webkit-3d", "webgl"];
		
		for (var i = 0; i < strings.length; ++i) {
			try {
				if (!this.gl) {
					this.gl = canvas.getContext(strings[i]);
				} else {
					break;
				}
			} catch (e) { }
		}
	
		// The vast majority of this library uses floating-point textures, so
		// require the availability of the OES_texture_float extension here.
		if (!this.gl.getExtension("OES_texture_float")) {
			this.gl = null;
			throw "Requires the OES_texture_float extension";
		}

		/*
		// Uncomment, and include webgl-debug.js in .html file (must copy from Khronos repository),
		// to debug WebGL errors.
		function throwOnGLError(err, funcName, args) {
			var errorString = WebGLDebugUtils.glEnumToString(err) +
				" was caused by call to " + funcName;
			throw errorString;
		};

		if (this.gl)
			this.gl = WebGLDebugUtils.makeDebugContext(this.gl, throwOnGLError);
		*/

		return this.gl;
	}
	
	/** This returns the 3D point clicked, on a unit glass ball
	 * centered at the origin.  This still has a couple of bugs, not the
	 * least of which is that event coordinates are not cross-browser
	 * compatible. This is an unpleasant fact of life.
	 *
	 * @param {int} x the x coordinate in the screen that was pressed
	 * @param {int} y the y coordinate in the screen that was pressed
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

	/** The mouse-down handler. It's provided with the context's x and y
	 * coordinates, but these are not guaranteed to be cross-browser
	 * compatible.  Still, it's mostly an internal function.  Access to
	 * specifying one's own click functions may be added, though it's
	 * probably less valuable in the 3d version than the 2d.
	 *
	 * This is only used internally, and is the callback handler we
	 * attach to the canvas
	 *
	 * @private
	 *
	 * @param {int} x the x coordinate where the mouse was clicked
	 * @param {int} y the y coordinate where the mouse was clicked
	 */
	this.mousedown = function(x, y) {
		this.mouse_down = this.coordinates(x, y);
		//this.axis.x = this.axis.y = this.axis.z = 0;
		this.scr.axis.x = this.scr.axis.y = this.scr.axis.z = 0;
		//this.angle = 0;
		this.scr.angle = 0;
		//this.moving = true;
		this.scr.moving = true;
	}
	
	/** The call-back handler for mouse movement.  Like mousedown, it's
	 * provided with the x and y coordinates of the event, though again
	 * they are not cross-browser apparently.  Still have test some other
	 * browsers.
	 * 
	 * This method is only used internally, and is the callback handler
	 * we attach to the window
	 *
	 * @private
	 *
	 * @param {int} x the x coordinate where the mouse was moved
	 * @param {int} y the y coordinate where the mouse was moved
	 */
	this.mousemove = function(x, y) {
		if (this.scr.moving) {
			this.mouse_current = this.coordinates(x, y);
			this.scr.axis = this.mouse_down.cross(this.mouse_current);
			this.scr.angle = Math.acos(this.mouse_down.dot(this.mouse_current) / (this.mouse_current.length() * this.mouse_down.length()));
			this.scr.angle *= (180 / 3.14159265);
			this.display();
		}
	}
	
	/** Mouse release handler;
	 * It records that the mouse is no longer moving, and then makes
	 * a call to rotate, which applies the current rotation into the
	 * stored rotation and reinitializes the current rotation matrix
	 * to identity
	 */
	this.mouseup = function() {
		this.scr.moving = false;
		this.scr.rotate();
	}
	
	/** The scroll event handler
	 *
	 * We found it to be a tremendous pain to continually click -/+
	 * to zoom in and out, and so we added a scroll event handler to
	 * allow users to scroll for zooming functionality.  Unfortunately
	 * it becomes a bit of a problem on pages that are themselves
	 * scrollable.  I'm sure the is probably an elegant soluction, but
	 * to date, we haven't found it.
	 * 
	 * @param {event} event the event object passed into us by the window
	 */
	this.scroll = function(event) {
		if (!event) event = window.event;
		
		if (event.wheelDelta) {
			delta = event.wheelDelta / 60;
		} else if (event.detail) {
			delta = -event.detail / 2;
		}
		
		//this.gl.console.log("delta: " + delta);
		//this.scr.alpha *= 1.1;
		this.scr.alpha *= (1.0 - delta * 0.1);
		this.display();
	}
	
	/** The keyboard event handler.  Again, the browser wars make life
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
		if (this.userKeyboardFunction) {
			try {
				this.userKeyboardFunction(key_event);
			} catch(e) {
				console.log("User keyboard function failed: " + e);
			}
		}
	}
	
	/** Although we provide generous click event handling (the
	 * trackball interface), for some applications it is important
	 * to be able to augment this functionality.
	 *
	 * This function is called IN ADDITION to the default behavior,
	 * but we're working on a convenient interface for turning off
	 * the default functionality completely at the user's request.
	 *
	 * @param {function(x, y)} myfunction is the callback handler to register
	 */
	this.setClickFunction = function(myfunction) {
		this.userClickFunction = myfunction;
	}
	
	/** This sets the user keyboard event callback handler.
	 *
	 * This function is executed (if set) IN ADDITION to the default 
	 * keyboard event handler.  It should take one argument, which is
	 * the key event object received by out handler.
	 *
	 * @param {function(key)} myfunction is the callback handler to register.
	 */
	this.setKeyboardFunction = function(myfunction) {
		this.userKeyboardFunction = myfunction;
	}

	/** This function must be called after an instance of glot has
	 * been created and before it's used for drawing primitives added
	 * to it.
	 *
	 * This is automatically called upon instantiation of a grapher object.
	 *
	 * It initializes all the required WebGL parameters, options, etc.,
	 * registers callback handlers and initializes timers for tracking
	 * framerates and for providing to primitives as the t parameter
	 */
	this.initialize = function() {
		/* This is some initialization that the OpenGL / GLUT version of
		 * openGLot did programatically after creating the context. But,
		 * in WebGL, they are passed in as parameters into the initial-
		 * ization phase, but I'm not yet sure as to the syntax.	Add this
		 * in for later versions.	 Provisionally disabled.
		 */
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
		
		f = function(event) { this.glot.scroll(event) };
		canvas.onmousewheel = f;
	
		this.gl = this.getContext();
		var gl = this.gl;

		if (!gl) {
			alert("Can't find a WebGL context; is it enabled?");
			return null;
		}

		/* Enable some features I'd like to use.
		 */
		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.BLEND);
	
		// Other smoothness and blending options
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	
		// Set the line width and point size
		gl.lineWidth(1.5);
		
		this.setDomain(-2, 2, -2, 2);
		
		// FIXME: must set the point size using gl_PointSize in the vertex shader.

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
		this.scr.width  = canvas.clientWidth;
		this.scr.height = canvas.clientHeight;

		/* This is a timer for framerate calculation
		 */
		this.framerate = new stopwatch();
		this.framerate.start();

		/* This is a timer for function's attributes
		 */
		this.wall = new stopwatch();
		this.wall.start();
		
		/* Normally we'd run some checks about what capabilities are enabled
		 * (like fragment, vertex and geometry shaders), but for now it at
		 * least seems that all WebGL implementations are more or less OpenGL
		 * 2.0 ES, and have fragment and vertex shaders, and not geometry
		 * shaders
		 */
	
		this.framecount = 0;
	
		// In the future, this ought to return some encoded value of success or failure.
		return 0;
	}
	
	/** Yet to be written.  Really necessary in the 3D version?  Probably,
	 * I guess.
	 * 
	 * @deprecated
	 */
	this.axes_dl_gen = function() {
		
	}

	/** Draw a single frame to the canvas.
	 *
	 * It is all that is necessary to call in order to request a redraw. For
	 * example, if you capture an event that adjusts a parameter and then
	 * changes what ought to be visualized.
	 *
	 * It is notably called elsewhere in the run() command.
	 */
	this.display = function() {
		this.reshape();
		
		var gl = this.gl;
		
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		this.scr.perspective();
		//this.scr.sfq();

		for (var i in this.primitives) {
			this.primitives[i].draw(this.scr);
		}
		
		gl.flush();
		
		/* The framerate printing asks for an html element with the id
		 * "framerate," though there ought to be a better way of handling
		 * it programatically.  Open to suggestions.
		 */
		this.framecount = this.framecount + 1;
		if (this.framecount == 150) {
			//document.getElementById("framerate").innerHTML = "Framerate : " + 150 / this.framerate.time();
			this.gl.console.log("Framerate : " + 150 / this.framerate.time());
			this.framecount = 0;
			this.framerate = new stopwatch();
			this.framerate.start();
		}
		
		gl.finish();
	}

	/** Every time that VBOs need to be refreshed, this function can be 
	 * called, and all included primitives will re-instantiate their VBOs
	 * if necessary.  It's a primitive's responsibility to know if the
	 * change requires it, based on the given new screen.
	 */
	this.refresh = function() {
		for (var i = 0; i < this.primitives.length; ++i) {
			this.primitives[i].refresh(this.scr);
		}
	}
	
	/** It's all in the name
	 */
	this.zoom_in = function() {
		this.scr.alpha /= 1.1;
	}
	
	/** It's all in the name
	 */
	this.zoom_out = function() {
		this.scr.alpha *= 1.1;
	}

	/** Call this as often as you'd like, it will check to see if there
	 * have been any changes in the canvas' size, and if so, it performs
	 * all the necessary operations.
	 */
	this.reshape = function() {
		var canvas = document.getElementById("glot");
		var context = this.getContext();
	
		var w = canvas.clientWidth;
		var h = canvas.clientHeight;
	
		/* If the width and height of the resized canvas are already
		 * the stored sizes, return and do nothing.
		 */
		/*
		if (w == this.scr.width && h == this.scr.height) {
			return;
		}
		*/
		
		canvas.width = w;
		canvas.height = h;
		
		this.gl.console.log("Setting viewport to be (" + w + " x " + h + ")");
		context.viewport(0, 0, w, h);
		
		this.scr.width = w;
		this.scr.height = h;
	}
	
	/** Add a primitive to the scene
	 *
	 * @param {primitive} primitive is the object to add
	 */
	this.add = function(primitive) {
		this.primitives.push(primitive);
		primitive.initialize(this.gl, this.scr, this.parameters);
	}
	
	/** Set a parameter to value for the scene
	 *
	 * @param {String} parameter is the name of the parameter whose value needs setting
	 * @param {Number} value is the value to set the new parameter to
	 */
	this.set = function(parameter, value) {
		this.parameters[parameter] = value;
	}
	
	/** Get a parameter's value in the simulation.
	 *
	 * @param {String} parameter is the name of the parameter
	 */
	this.get = function(parameter) {
		return this.parameters[parameter];
	}
	
	/** Set the scene animating
	 *
	 * It's not always a good assumption that the scene is dynamic.
	 * That is, not all functions or objects are time-dependent,
	 * but this can be called by the programmer to indicate that it
	 * is indeed the case.  Unfortunately with WebGL there is no
	 * idle function callback, but this seems to be the alternative.
	 */
	this.run = function() {
		window.glot = this;
		window.setInterval(function() { this.glot.display(); }, 10);
	}
	
	/** This seems to repeat the same functionality of run()
	 *
	 * @deprecated
	 */
	this.draw = function() {
		window.glot = this;
		window.setTimeout(function() { this.glot.display(); }, 10);
	}
	
	/** Set the domain of the scene
	 * 
	 * The default domain is the unit cube: [-1 1] in all directions
	 * but this call will change the dimensions.  It's a rough and
	 * not-oft used feature.
	 *
	 * @param {Number} minx the minimum x to see in the domain
	 * @param {Number} maxx the maximum x to see in the domain
	 * @param {Number} miny the minimum y to see in the domain
	 * @param {Number} maxy the maximum y to see in the domain
	 */
	this.setDomain = function(minx, maxx, miny, maxy) {
		this.scr.minx = minx;
		this.scr.maxx = maxx;
		this.scr.miny = miny;
		this.scr.maxy = maxy;
		this.refresh();
	}
	
	/** Reset the t parameter for the scene.
	 *
	 * This has the effect of bringing back the simulation to t = 0
	 */
	this.restart = function() {
		this.wall.start();
	}
	
	this.initialize();
}
