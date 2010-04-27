#version 120

varying vec2 vTextureCoord;

uniform sampler2D basis;
uniform sampler2D control_points;

uniform float t;

uniform float width;
uniform float height;
// knots = 8
uniform float knots;
uniform float p;

// Abbreviations
float ty = vTextureCoord.y;

// Basis dx - gets one left or right
float bdx = 1.0 / (width);
// control point dx - get one left or right
float cpdx = 1.0 / (width - 1.0);

// General stuff
float u     = ty;

// USER_PARAMETERS

void main () {
	vec4 cumulative = vec4(0.0, 0.0, 0.0, 0.0);
	
	for (float i = 0.0; i < width - 1.0; ++i) {
		cumulative += texture2D(basis, vec2(i * bdx, u)).r * texture2D(control_points, vec2(i * cpdx, u));
	}

	//gl_FragColor = texture2D(control_points, vTextureCoord) * texture2D(basis, vec2(tx * (width - 1.0) / width, u));
	//cumulative = cumulative.w * cumulative;
	gl_FragColor = cumulative;
	//gl_FragColor.a = 1.0;
	//gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
	//gl_FragColor = texture2D(basis, vTextureCoord);
}