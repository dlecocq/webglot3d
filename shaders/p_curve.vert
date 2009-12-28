uniform mat4 u_modelViewMatrix;
uniform mat4 u_projectionMatrix;

attribute vec4 vPosition;

uniform float t;

void main() {
	float s = vPosition.x;
	gl_Position = u_projectionMatrix * vec4(USER_FUNCTION, 0, 1);
}