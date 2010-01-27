uniform mat4 u_modelViewMatrix;
uniform mat4 u_projectionMatrix;

attribute vec4 vTexCoord;
attribute vec4 position;

varying vec2 v_texCoord;
varying vec3 normal;
varying vec3 light;
varying vec3 halfVector;

uniform float t;

void main() {

	gl_Position = u_projectionMatrix * u_modelViewMatrix * position;
	
	normal = position.xyz;
	//normal = vec3(result.z, 0.0, 0.0);
	v_texCoord = vTexCoord.st;
	
	light = vec3(10.0, 10.0, 10.0) - vec3(u_modelViewMatrix * position);
	
	halfVector = normalize(vec3(5.0, 5.0, 5.0).xyz);
}