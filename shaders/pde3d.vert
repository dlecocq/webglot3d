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