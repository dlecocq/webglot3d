uniform mat4 u_modelViewMatrix;
uniform mat4 u_projectionMatrix;

attribute vec4 vTexCoord;
attribute vec4 vPosition;

varying vec3 direction;
varying vec3 position;
varying vec3 v_texCoord;
varying vec3 light;
varying vec3 halfVector;

uniform float t;

void main() {
	position = (u_modelViewMatrix * vPosition).xyz;

	gl_Position = u_projectionMatrix * u_modelViewMatrix * vPosition;

	v_texCoord = (vPosition).xyz;

	direction = vPosition.xyz - vec3(0.0, 0.0, -100.0);
	direction = (u_modelViewMatrix * vec4(direction.x, direction.y, direction.z, 1.0)).xyz;
	direction = normalize(direction);
	
	light = vec3(10.0, 10.0, 10.0) - vec3(u_modelViewMatrix * vPosition);
	
	halfVector = normalize(vec3(5.0, 5.0, 5.0).xyz);
}