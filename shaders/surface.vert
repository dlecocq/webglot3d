uniform mat4 u_modelViewMatrix;
uniform mat4 u_projectionMatrix;

attribute vec4 vTexCoord;
attribute vec4 vPosition;

varying vec2 v_texCoord;
varying vec3 normal;
varying vec3 light;
varying vec3 halfVector;

// USER_PARAMETERS

uniform float t;

float function(float x, float y) {
	/* CYLINDRICAL
	// Here is a transformation for cylindrical coordinates.
	float r = sqrt(x * x + y * y);
	y = atan(y, x);
	x = r;
	//*/
	
	return USER_FUNCTION;
}

void main() {
	float x = vPosition.x;
	float y = vPosition.y;

	vec4 result = vec4(x, y, function(x, y), 1.0);

	gl_Position = u_projectionMatrix * u_modelViewMatrix * result;

	// Normal calculation
	const float h = 0.001;
	float dx = (function(x + h, y    ) - function(x - h, y    )) / (2.0 * h);
	float dy = (function(x		, y + h) - function(x    , y - h)) / (2.0 * h);
	
	normal = (u_modelViewMatrix * vec4(dx, dy, 1.0, 0.0)).xyz;
	v_texCoord = vTexCoord.st;
	
	light = vec3(10.0, 10.0, 10.0) - vec3(u_modelViewMatrix * result);
	
	halfVector = normalize(vec3(5.0, 5.0, 5.0).xyz);
}