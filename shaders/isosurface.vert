uniform mat4 u_modelViewMatrix;
uniform mat4 u_projectionMatrix;

attribute vec4 vTexCoord;
attribute vec4 vPosition;

varying vec3 position;
varying vec3 v_texCoord;
varying vec3 light;
varying vec3 halfVector;

uniform float t;

void main() {
	position = (u_modelViewMatrix * vPosition).xyz;

	gl_Position = u_projectionMatrix * u_modelViewMatrix * vPosition;

	//normal = vec3(result.z, 0.0, 0.0);
	v_texCoord = (u_modelViewMatrix * vTexCoord).xyz;
	
	light = vec3(10.0, 10.0, 10.0) - vec3(u_modelViewMatrix * vPosition);
	
	halfVector = normalize(vec3(5.0, 5.0, 5.0).xyz);
}