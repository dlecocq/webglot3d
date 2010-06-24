/** The screen object is responsible for keeping track of 
 * the modelview and projection matrices, rotations, etc.
 *
 * @constructor
 */
function screen() {
	/** Keep track of the current height of the canvas */
	this.height	= 10;
	/** Keep track of the curren width of the canvas */
	this.width 	= 10;
	/** Keep track of the minimum x value we should render */
	this.minx	= 0;
	/** Keep track of the minimum y value we should render */
	this.miny	= 0;
	/** Keep track of the maximum x value we should render */
	this.maxx	= 1;
	/** Keep track of the maximum y value we should render */
	this.maxy	= 1;
	/** Whether or not the trackball interface is currently moving */
	this.moving = false;
	/** The angle by which the trackball interface has currently moved */
	this.angle  = 0;
	/** The axis about which this rotation is occurring */
	this.axis   = [0, 0, 0];
	/** The aspect ratio of the canvas */
	this.aspect = 1.0;
	/** The viewing angle */
	this.alpha  = 8.0;
	/** The amount of shift in the x direction of the world.
	 * For instance, if we would like to pan around the domain,
	 * we ought to keep track of by how much we've moved */
	this.dx     = 0.0;
	/** The amount of shift in the y direction of the world.
	 * For instance, if we would like to pan around the domain,
	 * we ought to keep track of by how much we've moved */
	this.dy     = 0.0;
	/** A stopwatch used to keep track of the time parameter
	 * made available to all primitives for time-dependence. In
	 * the context of a shader program / primitive, it is available
	 * through the uniform variable t */
	this.wall   =  new stopwatch();
	/** Keep track of the rotation that has been aggregated thus
	 * far.  When the trackball interface is active, first this
	 * rotation is performed, and then the current movement.  Once
	 * the trackball comes to rest, that is aggregated into this
	 * matrix */
	this.rotation   = new CanvasMatrix4();
	/** The projection matrix */
	this.projection = new CanvasMatrix4();
	/** The modelview matrix */
	this.modelview  = new CanvasMatrix4();
	/** Some primitives need access to the inverse modelview matrix
	 * and so we provide it as a convenience */
	this.inversemv  = new CanvasMatrix4();
	
	/** Aggregate the current trackball rotation into the cumulative
	 * rotations we store. */
	this.rotate = function() {
		this.rotation.rotate(this.angle, this.axis.x, this.axis.y, this.axis.z);
	}
	
	/** Provide quick access to make a screen-filling quad for anything
	 * with coordinates (minx, miny) x (maxx, maxy) */
	this.sfq = function() {
		this.projection = new CanvasMatrix4();
		this.modelview  = new CanvasMatrix4();
		
		this.modelview.translate(-this.dx, -this.dy, 0.0);
		
		// Set the projection
		this.projection.ortho(this.minx, this.maxx, this.miny, this.maxy, 0, 10);
	}
	
	/** Provide quick access to get a perspective projection */
	this.perspective = function() {
		// Set the projection
		this.projection = new CanvasMatrix4();
		this.projection.perspective(this.alpha, this.width / this.height, 10, 1000);
		
		this.modelview = new CanvasMatrix4();
		// This gets everything centered, supposedly
		// I don't think this is actually necessary?
		//this.modelview.translate(-(this.minx + this.maxx) * 0.5, -(this.miny + this.maxy) * 0.5, 0.0);
		// Apply rotations that have occurred up to this point
		this.modelview.multRight(this.rotation);
		if (this.moving) {
		  // It the object is still moving, then rotate it by the current rotation
		  this.modelview.rotate(this.angle, this.axis.x, this.axis.y, this.axis.z);
		}
		// Move the model away so that it can be viewed
		this.modelview.translate(0, 0, -30);
		
		this.inversemv = new CanvasMatrix4(this.modelview);
		this.inversemv.invert();
	}
	
	this.wall.start();
}
