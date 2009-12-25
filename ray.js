/* This class is a simple encapsulation of some ray
 * functionality.  I use it for the trackball interface
 */
function ray(x, y, z) {
	
	/* In all fairness, it is a ray implementation that assumes
	 * that all rays begin at the origin.  A more appropriate
	 * name for this class might have been vector.
	 */
	this.x = x;
	this.y = y;
	this.z = z;
	
	/* Cross product.  Returns a brand new instance of ray that
	 * is orthogonal to both this and other.
	 */
	this.cross = function(other) {
		var x = this.y * other.z - this.z * other.y;
		var y = this.z * other.x - this.x * other.z;
		var z = this.x * other.y - this.y * other.x;
		return new ray(x, y, z);
	}
	
	// Length of the ray
	this.length = function() {
		return Math.sqrt(x * x + y * y + z * z);
	}
	
	// Dot this ray with another, called other.
	this.dot = function(other) {
		return this.x * other.x + this.y * other.y + this.z * other.z;
	}
	
}