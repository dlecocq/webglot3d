uniform mat4 u_modelViewMatrix;
uniform mat4 u_projectionMatrix;

attribute vec4 vTexCoord;
attribute vec4 vPosition;

varying vec2 v_texCoord;
varying vec3 normal;
varying vec3 light;
varying vec3 halfVector;

uniform float t;

vec4 function(float u, float v) {
	return vec4(USER_FUNCTION, 1.0);
	
	// These are some fun test functions.
	//return sin(sqrt(x * x + y * y) - t);
	//sin(3.0 * sqrt(x * x + y * y) - 2.0 * t) * cos(5.0 * sqrt((x - 1.5) * (x - 1.5) + (y - 0.75) * (y - 0.75)) - t);
	//return sin(3.0 * sqrt(x * x + y * y)) * cos(5.0 * sqrt((x - 1.5) * (x - 1.5) + (y - 0.75) * (y - 0.75)));
}

void main() {
	float x = vPosition.x;
	float y = vPosition.y;

	gl_Position = function(x, y);
	
	/* CYLINDRICAL
	gl_Position = vec4(gl_Position.y * cos(gl_Position.x), gl_Position.y * sin(gl_Position.x), gl_Position.z, 1.0);
	//*/
	
	/* SPHERICAL
	gl_Position = vec4(gl_Position.x * sin(gl_Position.y) * cos(gl_Position.z), gl_Position.x * sin(gl_Position.y) * sin(gl_Position.z), gl_Position.x * cos(gl_Position.y), 1.0);
	//*/
	
	light = vec3(10.0, 10.0, 10.0) - vec3(u_modelViewMatrix * gl_Position);
	
	halfVector = normalize(vec3(5.0, 5.0, 5.0).xyz);
	
	gl_Position = u_projectionMatrix * u_modelViewMatrix * gl_Position;

	//*
	float h = 0.001;
	vec4 xp = (function(x + h, y    ) - function(x - h, y    )) / (2.0 * h);
	vec4 yp = (function(x    , y + h) - function(x    , y - h)) / (2.0 * h);

	normal = cross(xp.xyz, yp.xyz);
	
	normal = (u_modelViewMatrix * vec4(normal.x, normal.y, normal.z, 0.0)).xyz;
	//normal = vec3(result.z, 0.0, 0.0);
	v_texCoord = vTexCoord.st;
}