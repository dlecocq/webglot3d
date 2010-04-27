#version 120

varying vec2 vTextureCoord;

uniform sampler2D basis;
uniform sampler2D knots_vector;

uniform float t;

uniform float width;
uniform float height;
// knots = 8
uniform float knots;
uniform float p;

// Abbreviations
float tx = vTextureCoord.x;
float ty = vTextureCoord.y;

// Stuff related to the basis functions
// This is the basis column we're in
float i   = floor(tx * width);
// This is the texture representation of that
float itx = i / (width - 1.0);
// Basis dx - gets one left or right
float bdx = 1.0 / (width - 1.0);

// Stuff related to the knots
// Knots dx - gets one left or right
float kdx = 1.0 / (knots);
float ktx = (i + 1.01) / (knots + 1.0);

// General stuff
float u     = ty;
float n_i   = texture2D(basis, vTextureCoord).r;
float n_i_1 = texture2D(basis, vec2(itx + bdx, u)).r;

// USER_PARAMETERS

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
	} else if (value < 0.0) {
		red = 1.0;
		green = 1.0;
		blue = 1.0;
	} else {
		red = 1.0;
		green = (value) * 2.0;
	}

	return vec4(red, green, blue, 1.0);
}

void main () {
	float u_i   = texture2D(knots_vector, vec2(ktx                  , u)).r;
	float u_i1  = texture2D(knots_vector, vec2(ktx + kdx            , u)).r;
	float u_ip  = texture2D(knots_vector, vec2(ktx + p * kdx        , u)).r;
	float u_ip1 = texture2D(knots_vector, vec2(ktx + (p + 1.0) * kdx, u)).r;
	
	float value = 0.0;
	
	if ((u_ip - u_i) != 0.0) {
		value += ((u - u_i) / (u_ip - u_i)) * n_i;
	}
	if ((u_ip1 - u_i1) != 0.0) {
		value += ((u_ip1 - u) / (u_ip1 - u_i1)) * n_i_1;
	}

	gl_FragColor = vec4(value, 0.0, 0.0, 1.0);
	//gl_FragColor = vec4(u, 0.0, 0.0, 1.0);
	//gl_FragColor = color((1.0 - value));
	//gl_FragColor = color(1.0 - n_i_1);//vec4(u_i, 0.0, 0.0, 1.0);
	//gl_FragColor = texture2D(control_points, vTextureCoord) * value;
	//gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
}