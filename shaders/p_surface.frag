varying vec2 v_texCoord;
varying vec3 normal;

void main () {
	vec3 norm_normal = normalize(normal);
	gl_FragColor = vec4(norm_normal.r, norm_normal.g, norm_normal.b, 1.0);
}