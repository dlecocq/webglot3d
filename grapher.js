// This class will encapsulate the grapher
function grapher() {

	this.scr = new screen();
	this.axes_dl = null;
	this.grid_dl = null;
	this.gl			 = null;
	this.wall		 = null;
	
	this.mouse_down = null;
	this.axis       = [0, 0, 0];
	this.angle      = 0;
	this.moving     = false;
	this.rotation   = null;
	
	// A framerate timer
	this.framerate	= null;
	this.framecount = 0;
	
	this.primitives = new Array();

	this.getContext = function() {
		// It would seem that all this context stuff is handled in this,
		// so no need to fuss with things like getting glutContext, etc.
		// At least, that's my understanding at this point.
		var canvas = document.getElementById("glot");
	
		var gl = null;
	
		/* It seems there's not a lot of uniformly-accepted strings for
		 * fetching the context, and so we will try severl likely ones,
		 * and bail out when we find one.
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
	
	/* This returns the 3D point clicked, on a unit glass ball
	 * centered at the origin.
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
		
		if (x < x_margin || x > (w + x_margin)) {
			i = 1.0;
		}
		
		if (y < y_margin || y > (h + y_margin)) {
			j = 1.0;
		}
		
		var l = Math.sqrt(i * i + j * j) + 0.000001;
		
		if (l > 1.0) {
			i /= l;
			j /= l;
		}
		
		var k = Math.sqrt(1 - i * i - j * j);
		
		return new ray(i, j, k);
	}

	this.mousedown = function(x, y) {
		this.mouse_down = this.coordinates(x, y);
		this.axis.x = this.axis.y = this.axis.z = 0;
		this.angle = 0;
		this.moving = true;
	}
	
	this.mousemove = function(x, y) {
		if (this.moving) {
			this.mouse_current = this.coordinates(x, y);
			this.axis = this.mouse_down.cross(this.mouse_current);
			this.angle = Math.acos(this.mouse_down.dot(this.mouse_current) / (this.mouse_current.length() * this.mouse_down.length()));
			this.angle *= (180 / 3.14159265);
		}
	}
	
	this.mouseup = function() {
		this.moving = false;
		this.rotation.rotate(this.angle, this.axis.x, this.axis.y, this.axis.z);
	}

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
		
		// This makes the mapping a little bit easier.
		var f = function(event) { this.glot.mousedown(event.clientX, event.clientY) };
		canvas.onmousedown = f;
		
		f = function(event) { this.glot.mouseup(event.clientX, event.clientY) };
		canvas.onmouseup = f;
		
		f = function(event) { this.glot.mousemove(event.clientX, event.clientY) };
		canvas.onmousemove = f;
		//*/
		
		this.rotation = new CanvasMatrix4();
	
		this.gl = this.getContext();
		var gl = this.gl;

		if (!gl) {
			alert("Can't find a WebGL context; is it enabled?");
			return null;
		}

		/* There is a slight, but unititive syntactic change between OpenGL
		 * and WebGL.	 glEnable becomes gl.enable, uncapitalizig the first
		 * character of the function call, and "gl." referes to the context
		 * provided by getContext()
		 */
		gl.enable(gl.LINE_SMOOTH);
		gl.enable(gl.POINT_SMOOTH);
		gl.enable(gl.BLEND);
		gl.enable(gl.VERTEX_ARRAY);
		gl.enable(gl.DEPTH_TEST);
	
		// Other smoothness and blending options
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.hint(gl.LINE_SMOOTH_HINT, gl.DONT_CARE);
	
		// Set the line width and point size
		gl.lineWidth(1.5);
		
		/* WebGL doesn't support this, it seems.  OpenGL ES 2.0 elliminated
		 * it to obviate the need for dedicated hardware for this task,
		 * which is a luxury in some sense.
		 *
		 * gl.pointSize(7);
		 */
	
		// Default color is black
		gl.clearColor(0.0, 0.0, 0.0, 1.0);

		// This was included in the webkit examples, but my JavaScript
		// is weak, and I'm not quite sure what exactly this means.
		// Add a console
		var canvas = document.getElementById("glot");
		gl.console = ("console" in window) ? window.console : { log: function() { } };
	
		/* The Provisional WebGL spec has something to say on maniuplating
		 * the view size programatically.	 It's tied to the canvas element
		 * size, and certain conditions and post-conditions must be satis-
		 * fied, so proceed with caution.
		 *
		 * WARNING! Some primitives depend on screen having the properly-
		 * filled values in screen for determination of vertex positions.
		 * Thus, it is CRITICAL that this be dynamically queried at run-
		 * time so that this data can be accurate.
		 */
		this.scr.width = this.scr.height = 500;

		/* Again, it would seem that all the initialization heavy lifting
		 * is handled by the WebGL canvas initialization, so I don't think
		 * this line is required.
		 */
		// Initialize OpenGL
		// init_open_gl();
	
		/* The callback registration for WebGL is either not intuitive,
		 * undocumented, or unavailable to me.	As such, this is provision-
		 * ally removed from the WebGL implementation.
		 */
		// Register callback functions with GLUT
		/*
		glutReshapeFunc(reshape);
		glutDisplayFunc(display);
		glutKeyboardFunc(keyboard);
		glutMouseFunc(mouse);
		glutMotionFunc(motion);
		glutIdleFunc(idle);
		*/

		this.framerate = new stopwatch();
		this.framerate.start();

		this.wall = new stopwatch();
		this.wall.start();

		// Determine the axes and grid
		//this.axes_dl = this.axes_dl_gen();
		//this.grid_dl = this.grid_dl_gen();
	
		// Shit.	Well, shit.
		/* I've not heard of / happened upon an extension wrangler for
		 * WebGL, and so I will have to figure out how to do this the 
		 * old-school, hardcore C way.	Consult Marcus for more details,
		 * though I think it is safe to assume for the time being that
		 * the required supported functions are available.
		 */
		/*
		glewInit();
	
		if (!(GLEW_ARB_vertex_shader && GLEW_ARB_fragment_shader && GLEW_EXT_geometry_shader4)) {
			printf("Not totally ready :( \n");
			exit(1);
		}
		*/
	
		this.framecount = 0;
	
		// Consult JavaScript timing documentation
		//wall.start();
	
		this.context = gl;
	
		// In the future, this ought to return some encoded value of success or failure.
		return 0;
	}
	
	this.axes_dl_gen = function() {
		
	}

	this.grid_dl_gen = function() {
		var gl = this.getContext();
		var dl = gl.genLists(1);
	
		glNewList(dl, GL_COMPILE);
	
			glColor4d(0.0, 0.0, 0.0, 0.14);
	
			glBegin(GL_LINES);
		
				// How does typecasting work in JavaScript?
				for( var i = this.scr.miny; i <= this.scr.maxy; ++i) {
					glVertex3d(this.scr.minx, i, 1);
					glVertex3d(this.scr.maxx, i, 1);
				}
	
				for( var i = this.scr.minx; i <= this.scr.maxx; ++i) {
					glVertex3d(i, this.scr.miny, 1);
					glVertex3d(i, this.scr.maxy, 1);
				}
		
			glEnd();
		
		glEndList();
	
		return dl;
	}

	this.display = function() {
		var gl = this.getContext();
		
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		var program				 = null;
		var mvMat_location = null;
		var prMat_location = null;
		var time_location	 = null;
		
		gl.modelviewMatrix = new CanvasMatrix4();
		gl.modelviewMatrix.multRight(this.rotation);
		if (this.moving) {
			gl.modelviewMatrix.rotate(this.angle, this.axis.x, this.axis.y, this.axis.z);
		}
		gl.modelviewMatrix.translate(0, 0, -30);

		for (var i in this.primitives) {
			program = this.primitives[i].program;
			
			gl.useProgram(program);
			
			mvMat_location = gl.getUniformLocation(program, "u_modelViewMatrix");
			prMat_location = gl.getUniformLocation(program, "u_projectionMatrix");
			time_location	 = gl.getUniformLocation(program, "t");
		
			gl.uniformMatrix4fv(mvMat_location, false, gl.modelviewMatrix.getAsWebGLFloatArray());
			gl.uniformMatrix4fv(prMat_location, false, gl.projectionMatrix.getAsWebGLFloatArray());
			gl.uniform1f(time_location, this.wall.time());
			
			this.primitives[i].draw();
		}
		
		gl.flush();
		
		this.framecount = this.framecount + 1;
		if (this.framecount == 150) {
			document.getElementById("framerate").innerHTML = "Framrate : " + 150 / this.framerate.time();
			this.framecount = 0;
			this.framerate = new stopwatch();
			this.framerate.start();
		}
		
		gl.finish();
	}

	this.refresh_dls = function() {
		for (var i = 0; i < this.primitives.length; ++i) {
			this.primitives[i].refresh(this.scr);
		}
		//this.axes_dl = this.axes_dl_gen();
		//this.grid_dl = grid_dl_gen(); 
	}

	this.run = function() {
		//var f = function() { this.reshape(); this.display() };
		setInterval(this.display(), 10);
		/* How does MainLoop work in WebGL? */
		return 0;
	}

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
    context.projectionMatrix.perspective(8, w / h, 10, 1000);

		//glutPostRedisplay();
	}
	
	this.add = function(primitive) {
		this.primitives.push(primitive);
		primitive.initialize(this.scr);
	}
}