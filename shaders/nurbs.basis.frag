#version 120

varying vec2 vTextureCoord;

uniform sampler2D basis;
uniform sampler2D knots_vector;

uniform float t;

uniform float width;
uniform float height;
uniform float knots;
uniform float p;

float texdy    = 1.0 / (height     );
float texdx    = 1.0 / (width      );
float knots_dx = 1.0 / (knots + 1.0);

float tx = vTextureCoord.x;
float ty = vTextureCoord.y;

float u     = tx;
float n_i   = texture2D(basis, vTextureCoord).r;
float n_i_1 = texture2D(basis, vec2(knots_dx + tx, ty)).r;

float i = floor(tx * width);

float uof(float i) {
	// In a sane world, this would be it
	i = i / knots;
	return texture2D(knots_vector, vec2(tx, i * (1.0 - knots_dx) + knots_dx)).r;
}

// USER_PARAMETERS

void main () {
	float u_i     = uof(i);
	float u_i_p_1 = uof(i + p + 1.0);
	float value = ((u - u_i) / (uof(i + p) - u_i)) * n_i + ((u_i_p_1 - u) / (u_i_p_1 - uof(i + 1.0))) * n_i_1;
	
	gl_FragColor = vec4(value, 0, 0, 1.0);
	//gl_FragColor = texture2D(knots_vector, vTextureCoord);
	//gl_FragColor.a = 1.0;
	//gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
}