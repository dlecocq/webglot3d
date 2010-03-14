uniform mat4 u_modelViewMatrix;
uniform mat4 u_projectionMatrix;

uniform float dx;
uniform float dy;
uniform float scale;

// USER_PARAMETERS

attribute vec4 position;
attribute vec2 aTextureCoord;

varying float magnitude;

uniform float t;

varying vec2 vTextureCoord;

const float h = 0.001;
const float dt = 0.00001;

float function(float x, float y) {
	return USER_FUNCTION;
}

void main() {
	float x = (position.x + dx);
	float y = (position.y + dy);
	
	vec2 hi = vec2(function(x + dt, y), function(x, y + dt));
	vec2 lo = vec2(function(x - dt, y), function(x, y - dt));
	
	vec2 d = (hi - lo) / (2.0 * dt);
	
	magnitude = length(d);
	
	//*
	gl_Position = u_projectionMatrix * position;
	vTextureCoord = aTextureCoord - h * normalize(d);
	//*/
}