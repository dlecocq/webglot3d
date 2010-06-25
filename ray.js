/** @class
 * This class is a simple encapsulation of some ray
 * functionality.  I use it for the trackball interface
 *
 * In all fairness, it is a ray implementation that assumes
 * that all rays begin at the origin.  A more appropriate
 * name for this class might have been vector.
 *
 * @param {Number} x the x component 
 * @param {Number} y the y component
 * @param {Number} z the z component
 */
function ray(x, y, z) {
	/** Local copy of the x coordinate */
	this.x = x;
	/** Local copy of the y coordinate */
	this.y = y;
	/** Local copy of the z coordinate */
	this.z = z;
	
	/** Cross product.  Returns a brand new instance of ray that
	 * is orthogonal to both this and other.
	 * 
	 * @param {ray} other
	 * @returns ray
	 */
	this.cross = function(other) {
		var x = this.y * other.z - this.z * other.y;
		var y = this.z * other.x - this.x * other.z;
		var z = this.x * other.y - this.y * other.x;
		return new ray(x, y, z);
	}
	
	/** Length of the ray
	 *
	 * @returns Number
	 */
	this.length = function() {
		return Math.sqrt(x * x + y * y + z * z);
	}
	
	/** Dot this ray with another, called other.
	 *
	 * @param {ray} other
	 * @returns Number
	 */
	this.dot = function(other) {
		return this.x * other.x + this.y * other.y + this.z * other.z;
	}
	
}