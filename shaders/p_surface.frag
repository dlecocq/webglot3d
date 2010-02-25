varying vec2 v_texCoord;
varying vec3 normal;
varying vec3 light;
varying vec3 halfVector;

uniform sampler2D sampler;

void main () {
	vec4 texture = texture2D(sampler, v_texCoord.st);

	// Scaling The Input Vector To Length 1
	vec3 norm_normal = normalize(normal);
	vec3 norm_light = normalize(light);

	// Calculating The Diffuse Term And Clamping It To [0;1]
	float DiffuseTerm = clamp(dot(norm_normal, norm_light), 0.0, 1.0);

	// Calculating The Final Color
	gl_FragColor = 0.4 * texture + 0.6 * texture * DiffuseTerm;
	// This tends to set the alpha to a non-1 value, so we correct this.
	gl_FragColor.a = 1.0;
	
	/* This colors the surface based on a normal map
	gl_FragColor = vec4(norm_normal.r, norm_normal.g, norm_normal.b, 1.0);
	//*/
}