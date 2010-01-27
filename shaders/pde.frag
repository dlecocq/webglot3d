varying vec2 vTextureCoord;

uniform sampler2D uSampler;

void main() {
	//float value = texture2D(uSampler, vTextureCoord.st).r / 20.0 + 0.5;
	vec4 tex = texture2D(uSampler, vTextureCoord.st);
	
	float value = 0.25 * (tex.r + tex.g + tex.b + tex.a) / 2.0 + 0.5;
	
	float red = 1.0;
	float green = 1.0;
	float blue = 0.0;
	
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
	//gl_FragColor = vec4(value, value, value, 1.0);
	//gl_FragColor = texture2D(uSampler, vTextureCoord.st);

	//gl_FragColor.r = (gl_FragColor.r + 1.0) / 2.0;
	//gl_FragColor.a = 1.0;
	//*/
	//gl_FragColor = vec4(vTextureCoord.s, vTextureCoord.t, 0.0, 1.0);
}