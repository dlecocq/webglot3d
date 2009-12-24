function ray(x, y, z) {
	
	this.x = x;
	this.y = y;
	this.z = z;
	
	this.cross = function(other) {
		var x = this.y * other.z - this.z * other.y;
		var y = this.z * other.x - this.x * other.z;
		var z = this.x * other.y - this.y * other.x;
		return new ray(x, y, z);
	}
	
	this.length = function() {
		return Math.sqrt(x * x + y * y + z * z);
	}
	
	this.dot = function(other) {
		return this.x * other.x + this.y * other.y + this.z * other.z;
	}
	
}