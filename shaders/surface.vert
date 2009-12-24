uniform mat4 u_modelViewMatrix;
uniform mat4 u_projectionMatrix;

attribute vec4 vTexCoord;
attribute vec4 vPosition;

varying vec2 v_texCoord;
varying vec3 normal;

uniform float t;

float function(float x, float y) {
	//return sin(sqrt(x * x + y * y) - t);
	return sin(3.0 * sqrt(x * x + y * y) - 2.0 * t) * cos(5.0 * sqrt((x - 1.5) * (x - 1.5) + (y - 0.75) * (y - 0.75)) - t);
}

void main() {
	float x = vPosition.x;
	float y = vPosition.y;

	vec4 result = vec4(x, y, 0.0, 1.0);
	
	result.z = function(x, y);

	gl_Position = u_projectionMatrix * u_modelViewMatrix * result;

	//*
	float h = 0.001;

	float dx = (function(x + h, y    ) - function(x - h, y    )) / (2.0 * h);
	float dy = (function(x		, y + h) - function(x    , y - h)) / (2.0 * h);
	//*/
	
	normal = (u_modelViewMatrix * vec4(dx, dy, 1.0, 0.0)).xyz;
	//normal = vec3(result.z, 0.0, 0.0);
	v_texCoord = vTexCoord.st;
}