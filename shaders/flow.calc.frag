varying vec2 vTextureCoord;

uniform sampler2D accumulation;
uniform sampler2D source;

varying float magnitude;

uniform float t;

const float alpha = 0.05;

vec4 color(float value) {
	float red = 1.0;
	float green = 1.0;
	float blue = 0.0;

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
	} else {
		red = 1.0;
		green = (value) * 2.0;
	}

	return vec4(red, green, blue, 1.0);
}

void main() {
	vec4 result = texture2D(accumulation, vTextureCoord.st);
	
	result.a = 1.0;
	
	vec4 s = texture2D(source, vTextureCoord.st);
	s = color(magnitude / 1.0) * s.r;
	//s.r = s.g = s.b = mod(t / 20.0 + s.r, 1.0);
	//s.a = mod(t / 20.0 + s.a, 1.0);

	gl_FragColor = alpha * s + (1.0 - alpha) * result;
	//gl_FragColor = s;
}