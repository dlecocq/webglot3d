function screen() {
	this.height	= this.width 	= 10;
	this.minx		= this.miny		= 0;
	this.maxx		= this.maxy		= 1;
	
	this.moving = false;
	this.angle  = 0;
	this.axis   = [0, 0, 0];
	
	this.aspect = 1.0;
	this.alpha  = 8.0;
	
	this.dx     = 0.0;
	this.dy     = 0.0;
	
	this.wall   =  new stopwatch();
	
	this.rotation   = new CanvasMatrix4();
	this.projection = new CanvasMatrix4();
	this.modelview  = new CanvasMatrix4();
	this.inversemv  = new CanvasMatrix4();
	
	this.rotate = function() {
		this.rotation.rotate(this.angle, this.axis.x, this.axis.y, this.axis.z);
	}
	
	this.sfq = function() {
		this.projection = new CanvasMatrix4();
		this.modelview  = new CanvasMatrix4();
		
		this.modelview.translate(-this.dx, -this.dy, 0.0);
		
		// Set the projection
		this.projection.ortho(this.minx, this.maxx, this.miny, this.maxy, 0, 10);
	}
	
	this.perspective = function() {
		// Set the projection
		this.projection = new CanvasMatrix4();
		this.projection.perspective(this.alpha, this.width / this.height, 10, 1000);
		
		this.modelview = new CanvasMatrix4();
		// This gets everything centered, supposedly
		this.modelview.translate(-(this.minx + this.maxx) * 0.5, -(this.miny + this.maxy) * 0.5, 0.0);
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
