/*
uniform mat4 u_modelViewMatrix;
uniform mat4 u_projectionMatrix;

attribute vec4 position;
attribute vec2 aTextureCoord;

uniform sampler2D uSampler;

uniform float t;

varying vec2 vTextureCoord;

void main() {
	
	vec4 tex = texture2D(uSampler, aTextureCoord.st);
	
	vec4 result = position;
	//result.z = (tex.r + tex.g + tex.b + tex.a) * 0.25;
	
	gl_Position = u_projectionMatrix * u_modelViewMatrix * result;
	
	vTextureCoord = aTextureCoord;
}
//*/

//*
uniform mat4 u_modelViewMatrix;
uniform mat4 u_projectionMatrix;
uniform mat4 u_modelViewInverse;

attribute vec4 position;
attribute vec2 aTextureCoord;

varying vec3 direction;
varying vec3 vposition;
varying vec3 vTexCoord;
varying vec2 vTextureCoord;
varying vec3 light;
varying vec3 halfVector;

uniform float t;

void main() {
	vposition = (u_modelViewMatrix * position).xyz;

	gl_Position = u_projectionMatrix * u_modelViewMatrix * position;

	vTexCoord = (position).xyz;
	
	vTextureCoord = aTextureCoord.xy;

	direction = normalize((u_modelViewInverse * vec4(0.0, 0.0, -300.0, 1.0)).xyz);
		
	light = vec3(10.0, 10.0, 10.0) - vec3(u_modelViewMatrix * position);
	
	halfVector = normalize(vec3(5.0, 5.0, 5.0).xyz);
}
//*/