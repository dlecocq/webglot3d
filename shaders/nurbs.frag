varying vec2 vTextureCoord;
varying vec3 normal;
varying vec3 light;
varying vec3 halfVector;

uniform sampler2D accumulation;

vec4 color(float value) {
	float red = 1.0;
	float green = 1.0;
	float blue = 0.0;
	
	//*
	if (value > 0.75) {
		red = 0.0;
		green = (1.0 - value) * 4.0;
		blue = 1.0;
	} else if (value > 0.5) {
		red = (0.75 - value) * 4.0;
		green = 1.0;
		blue = (value - 0.5) * 4.0;
	} else if (value > 0.25) {
		red = 1.0;
		green = 0.5 + (value - 0.25) * 2.0;
		/*
	} else if (value <= 0.0) {
		red = 1.0;
		green = 1.0;
		blue = 1.0;
		*/
	} else {
		red = 1.0;
		green = (value) * 2.0;
	}
	//*/
	
	return vec4(red, green, blue, 1.0);
}

void main() {
	vec4 texture = texture2D(accumulation, vTextureCoord.st);

	// Scaling The Input Vector To Length 1
	vec3 norm_normal = normalize(normal);
	vec3 norm_light = normalize(light);
	
	//gl_ModelViewMatrix * position;

	// Calculating The Diffuse Term And Clamping It To [0;1]
	float DiffuseTerm = clamp(dot(norm_normal, norm_light), 0.0, 1.0);

	// Calculating The Final Color
	/*
	gl_FragColor = 0.4 * texture + 0.6 * texture * DiffuseTerm;
	gl_FragColor.a = 1.0;
	*/
	
	gl_FragColor = color(texture.r);
	//gl_FragColor = texture;

	/* A normal map
	gl_FragColor = vec4(norm_normal.r, norm_normal.g, norm_normal.b, 1.0);
	//*/
}