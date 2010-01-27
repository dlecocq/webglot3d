uniform mat4 modelviewMatrix;
uniform mat4 projectionMatrix;

attribute vec4 position;
attribute vec2 aTextureCoord;

uniform float t;

varying vec2 vTextureCoord;

void main() {
	
	gl_Position = projectionMatrix * position;
	
	vTextureCoord = aTextureCoord;
}