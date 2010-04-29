uniform mat4 u_modelViewMatrix;
uniform mat4 u_projectionMatrix;

attribute vec4 position;
attribute vec2 aTextureCoord;

uniform sampler2D accumulation;

uniform float t;

varying vec2 vTextureCoord;
varying vec3 normal;
varying vec3 light;
varying vec3 halfVector;

float function(float x, float y) {
	/* CYLINDRICAL
	// Here is a transformation for cylindrical coordinates.
	float r = sqrt(x * x + y * y);
	y = atan(y, x);
	x = r;
	//*/
	
	return texture2D(accumulation, vec2(x, y)).r;
}

void main() {
	
	vec4 result = position;
	
	float x = aTextureCoord.x;
	float y = aTextureCoord.y;
	result.z = function(x, y);
	
	gl_Position = u_projectionMatrix * u_modelViewMatrix * result;
	
	vTextureCoord = aTextureCoord;
	
	// Normal calculation
	const float h = 0.001;
	float dx = (function(x + h, y    ) - function(x - h, y    )) / (2.0 * h);
	float dy = (function(x    , y + h) - function(x    , y - h)) / (2.0 * h);
	
	normal = (u_modelViewMatrix * vec4(dx, dy, 1.0, 0.0)).xyz;
	
	light = vec3(10.0, 10.0, 10.0) - vec3(u_modelViewMatrix * result);
	
	halfVector = normalize(vec3(5.0, 5.0, 5.0).xyz);
}