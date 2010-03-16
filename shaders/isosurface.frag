uniform mat4 u_modelViewMatrix;

varying vec3 direction;
varying vec3 vposition;
varying vec3 v_texCoord;
varying vec3 light;
varying vec3 halfVector;

// The bounding box
const vec3 min = vec3(-2, -2, -2);
const vec3 max = vec3( 2,  2,  2);

// USER_PARAMETERS

uniform sampler2D sampler;

uniform float t;

float function(float x, float y, float z) {
	
	/* Here are some transformations for coordinate systems.  To make
	 * this more transparent when it's used.  This way, any time you
	 * call ``function'' in this shader, you can be certain it has had
	 * the coordinate transformation performed on it.
	 */
	
	/* CYLINDRICAL
	float r = sqrt(x * x + y * y);
	y = atan(y, x);
	x = r;
	//*/
	
	/* SPHERICAL
	float rho = sqrt(x * x + y * y + z * z);
	z = acos(z / rho);
	y = atan(y, x);
	x = rho;
	//*/
	
	return USER_FUNCTION - alpha;
}

vec3 f_normal(float x, float y, float z, float h) {
	float dx = (function(x + h, y, z) - function(x - h, y, z));
	float dy = (function(x, y + h, z) - function(x, y - h, z));
	float dz = (function(x, y, z + h) - function(x, y, z - h));
	return normalize((0.5 / h) * vec3(dx, dy, dz));
}

void main () {
	vec3 start = v_texCoord;
	
	vec3 point;
	gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);

	float s   = 0.0;
	float ds  = 0.05;

	float h = 0.01;

	float s_previous;
	float v_previous;
	float value;
	
	vec3 temp1;
	vec3 temp2;
	
	point = start + direction * s;
	v_previous = function(point.x, point.y, point.z);

	for (s = 0.01; s < 6.92; s += ds) {
		// Determine the point you're sampling, and sample it
		point = start + direction * s;
		value = function(point.x, point.y, point.z);
		
		// If it's less than 0, then draw something
		if ((value * v_previous) < 0.0) {
			// Linearly interpolate where the value is 0
			s = (s_previous * value - s * v_previous) / (value - v_previous);
			point = start + direction * s;
			
			// And at that point, estimate the gradient
			vec3 normal = f_normal(point.x, point.y, point.z, h);
			
			// Take the dot product, and gray-scale accordingly

			float dot = abs(dot(normal, direction));
			gl_FragColor = vec4(dot, dot, dot, 1.0);
			break;
		} else {
			// If it's not less than 0, then save the current value and
			// step as the previous one.  This is used for lin. interp.
			s_previous = s;
			v_previous = value;
			
			// Check to see if you're still inside the box.  If not, then bail.
			temp1 = sign(point - min);
			temp2 = sign(max - point);
			if (dot(temp1, temp2) < 3.0) {
				break;
			}
		}
	}
}