#version 120

uniform mat4 u_modelViewMatrix;

varying vec3 direction;
varying vec3 position;
varying vec3 v_texCoord;
varying vec3 light;
varying vec3 halfVector;

// USER_PARAMETERS

float depth    = b_width * b_height;

const float hw = 2.0;

const vec3 min = vec3(-hw, -hw, -hw);
const vec3 max = vec3( hw,  hw,  hw);

uniform sampler2D sampler;
uniform sampler2D transfer;

uniform float t;

float function(float x, float y, float z) {
	// Eventually you should do linear interpolation.
	// Do this first with the low z, then the high z
	float zint = floor((z / 4.0 + 0.5) * depth);
	
	float alpha = (z / 4.0 + 0.5) * depth - zint;
	
	float row = floor(zint / b_width);
	float col = floor(mod(zint, b_width));
	
	float xcoord = ((x / 4.0 + 0.5) + col) / b_width;
	float ycoord = ((y / 4.0 + 0.5) + row) / b_height;

	float lo = texture2D(sampler, vec2(xcoord, ycoord)).r;
	
	//return lo;
	
	zint += 1.0;
	row = floor(zint / b_width);
	col = floor(mod(zint, b_width));
	
	xcoord = ((x / 4.0 + 0.5) + col) / b_width;
	ycoord = ((y / 4.0 + 0.5) + row) / b_height;
	
	float hi = texture2D(sampler, vec2(xcoord, ycoord)).r;
	
	return alpha * hi + (1.0 - alpha) * lo;
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
	float ds  = 0.02;

	float h = 4.0 / min(depth, min(height, width));

	float value;
	vec4 color;
	vec4 accumulation = vec4(0.0, 0.0, 0.0, 1.0);
	
	vec3 temp1;
	vec3 temp2;
	
	float alpha = 0.0;

	for (s = ds; s < 6.93 && alpha < 0.99; s += ds) {
		// Determine the point you're sampling, and sample it
		point = start + direction * s;
		value = function(point.x, point.y, point.z);
			
		vec3 normal = f_normal(point.x, point.y, point.z, h);
		
		// Take the dot product, and gray-scale accordingly

		float dot = abs(dot(normal, direction));
		//gl_FragColor = vec4(dot, dot, dot, 1.0);
		//gl_FragColor = vec4(point.x, point.y, point.z, 1.0);
		//*
		color = texture2D(transfer, vec2(value, 0.5)) * dot;
		alpha = alpha + (1.0 - alpha) * color.a;
		accumulation.r = accumulation.r + (1.0 - alpha) * color.r;
		accumulation.g = accumulation.g + (1.0 - alpha) * color.g;
		accumulation.b = accumulation.b + (1.0 - alpha) * color.b;
		accumulation.a = 1.0;
		//*/
		/*
		if (value >= 0.4) {
			//accumulation = vec4(1.0, 0.0, 0.0, value);
			accumulation = texture2D(transfer, vec2(value, 0.5));
		}
		//*/

		temp1 = sign(point - min);
		temp2 = sign(max - point);
		if (dot(temp1, temp2) < 3.0) {
			break;
		}
	}
	
	gl_FragColor = accumulation;

}