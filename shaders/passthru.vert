uniform mat4 u_modelViewMatrix;
uniform mat4 u_projectionMatrix;

attribute vec4 position;

void main() {
	gl_Position = u_projectionMatrix * u_modelViewMatrix * position;
}