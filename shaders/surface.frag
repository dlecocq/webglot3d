varying vec2 v_texCoord;
varying vec3 normal;

void main () {
	normalize(normal);
	gl_FragColor = vec4(normal.x, normal.y, normal.z, 1.0);
}