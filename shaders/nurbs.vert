uniform mat4 u_modelViewMatrix;
uniform mat4 u_projectionMatrix;

attribute vec4 position;
attribute vec2 ls;

uniform sampler2D usTex;
uniform sampler2D vsTex;
uniform sampler2D cpsTex;

uniform vec2 knotCounts;
uniform vec2 cpCounts;
uniform vec2 n;

vec2 cpEps = 1.0 / (cpCounts   + vec2(1, 1));
vec2 knEps = 1.0 / (knotCounts + vec2(1, 1));

uniform float t;

varying vec2 coord;
varying vec3 normal;
varying vec3 light;
varying vec3 halfVector;

vec4  ds[10];
// Basis function values (u direction)
float ns[10];
float us[10];

void main() {
	vec4 result = vec4(0.0, 0.0, 0.0, 1.0);
	
	float u = coord.x = position.x;
	float v = coord.y = position.y;
	
	int nx = int(n.x);
	int ny = int(n.y);
	
	int li = int(ls.x);
	
	// Grab all the control points early on
	for (int i = 0; i <= nx; ++i) {
		ds[i] = texture2D(cpsTex, vec2(float(li - nx + i) / (cpCounts.x + 1.0) + cpEps.x, 0));
	}
	
	// Grab all the u's early on
	for (int i = 0; i < 2 * nx; ++i) {
		us[i] = texture2D(usTex, vec2(float(li - nx + 1 + i) / (knotCounts.x + 1.0) + knEps.x, 0)).r;
	}
	
	// Initialize all to zero, except n(i)
	for (int i = 0; i < nx; ++i) {
		ns[i] = 0.0;
	}
	ns[nx    ] = 1.0;
	ns[nx + 1] = 0.0;
	
	// Calculate the basis functions
	// For every row, starting at bottom,
	for (int k = 1; k <= nx; ++k) {
		// For every non-zero column
		for (int i = nx - k; i <= nx; ++i) {
			ns[i] = (u - us[i]) / (us[i + k] - us[i]) * ns[i] + (us[i + k + 1] - u) / (us[i + k + 1] - us[i+1]) * ns[i + 1]; 
		}
	}
	
	result = vec4(0.0, 0.0, 0.0, 1.0);
	
	for (int i = 0; i <= nx; ++i) {
		result += ds[i] * ns[i];
	}
	
	vec4 knotsValue = texture2D(usTex, vec2(u, 0.0));
	vec4 cpsValue   = texture2D(cpsTex , vec2(u, 0.0));
	
	//result.xy = cpsValue.xy;
	//result.x = knotsValue.r;
	
	//result.xy = ds[nx].xy / ds[nx].w;
	//result.x = l;
	
	// COORDINATE_TRANSFORMATION

	result.x = ns[0];
	
	result.yzw = position.yzw;

	gl_Position = u_projectionMatrix * u_modelViewMatrix * result;
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	

	/*
	vec4 tex = texture2D(vsTex, position.xy);
	
	vec4 result = position;
	
	float x = position.x;
	float y = position.y;
	//result.z = function(x, y);
	result.z = ls.x;//(tex.x + tex.y);
	
	gl_Position = u_projectionMatrix * u_modelViewMatrix * result;
	
	coord = position.xy;
	//*/
	
	// Normal calculation
	/*
	// This is going to require some revamping.
	const float h = 0.001;
	float dx = (function(x + h, y    ) - function(x - h, y    )) / (2.0 * h);
	float dy = (function(x    , y + h) - function(x    , y - h)) / (2.0 * h);
	//*/
	
	/*
	float dx = 0.0;
	float dy = 0.0;
	
	normal = (u_modelViewMatrix * vec4(dx, dy, 1.0, 0.0)).xyz;
	
	light = vec3(10.0, 10.0, 10.0) - vec3(u_modelViewMatrix * result);
	
	halfVector = normalize(vec3(5.0, 5.0, 5.0).xyz);
	//*/
}