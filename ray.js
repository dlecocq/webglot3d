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