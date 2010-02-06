varying vec3 position;
varying vec3 v_texCoord;
varying vec3 light;
varying vec3 halfVector;

const vec3 min = vec3(-2, -2, -2);
const vec3 max = vec3( 2,  2,  2);

uniform sampler2D sampler;

uniform float t;

float function(float x, float y, float z) {
	return USER_FUNCTION;
}

vec3 f_normal(float x, float y, float z, float h) {
	float dx = (function(x + h, y, z) - function(x - h, y, z));
	float dy = (function(x, y + h, z) - function(x, y - h, z));
	float dz = (function(x, y, z + h) - function(x, y, z - h));
	return (0.5 / h) * vec3(dx, dy, dz);
}

void main () {
	vec3 start = v_texCoord;
	vec3 direction = normalize(start - vec3(0.0, 0.0, -100.0));
	
	vec3 point;
	gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);

	float s   = 0.0;
	float ds  = 0.1;

	float h = 0.01;

	float s_previous;
	float v_previous;
	float value;
	
	vec3 temp1;
	vec3 temp2;
	
	point = start + vec3(0.0, 0.0, 30.0 - 3.4) + direction * s;
	v_previous = function(point.x, point.y, point.z);

	for (s = 0.0; s < 6.92; s += ds) {
		// Determine the point you're sampling, and sample it
		point = start + vec3(0.0, 0.0, 30.0 - 3.4) + direction * s;
		value = function(point.x, point.y, point.z);
		
		// If it's less than 0, then draw something
		if ((value * v_previous) < 0.0) {
			// Linearly interpolate where the value is 0
			s = (s_previous * value - s * v_previous) / (value - v_previous);
			point = start + vec3(0.0, 0.0, 30.0 - 3.4) + direction * s;
			
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
	
	/*
	vec4 texture = texture2D(sampler, v_texCoord.st);

	// Scaling The Input Vector To Length 1
	vec3 norm_normal = normalize(normal);
	vec3 norm_light = normalize(light);
	
	//gl_ModelViewMatrix * position;

	// Calculating The Diffuse Term And Clamping It To [0;1]
	float DiffuseTerm = clamp(dot(norm_normal, norm_light), 0.0, 1.0);

	// Calculating The Final Color
	gl_FragColor = 0.4 * texture + 0.6 * texture * DiffuseTerm;
	gl_FragColor.a = 1.0;

	//gl_FragColor = vec4(norm_normal.r, norm_normal.g, norm_normal.b, 1.0);
	*/
}