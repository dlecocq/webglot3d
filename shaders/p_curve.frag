#version 110

varying vec3 light;
varying vec3 normal;

void main()
{
	// Defining The Material Colors
	const vec4 AmbientColor = vec4(0.1, 0.0, 0.0, 1.0);
	const vec4 DiffuseColor = vec4(1.0, 0.0, 0.0, 1.0);

	// Scaling The Input Vector To Length 1
	vec3 norm_normal = normalize(normal);
	vec3 norm_light = normalize(light);

	// Calculating The Diffuse Term And Clamping It To [0;1]
	float DiffuseTerm = clamp(dot(norm_normal, norm_light), 0.0, 1.0);

	// Calculating The Final Color
	//gl_FragColor = AmbientColor + DiffuseColor * DiffuseTerm;
	float value = gl_FragCoord.z;
	
	float red;
	float blue;
	float green;
	
	if (value > 0.8) {
		red = (value - 0.8) * 5.0;
		green = 0.0;
		blue = 1.0;
	} else if (value > 0.6) {
		red = 0.0;
		green = (0.8 - value) * 5.0;
		blue = 1.0;
	} else if (value > 0.4) {
		red = (0.6 - value) * 5.0;
		green = 1.0;
		blue = (value - 0.4) * 5.0;
	} else if (value > 0.2) {
		red = 1.0;
		green = 0.5 + (value - 0.2) * 2.5;
	} else {
		red = 1.0;
		green = (value) * 2.5;
	}
	
	gl_FragColor = vec4(red, green, blue, 1.0);
}