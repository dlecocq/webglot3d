varying vec2 vTextureCoord;

uniform sampler2D uSampler;

uniform float t;

uniform float width;
uniform float height;

float texdy = 1.0 / (height);
float texdx = 1.0 / (width );

float dy = 2.0 / (height - 1.0);
float dx = 2.0 / (width  - 1.0);

const float alpha = 1.0;

//const float omega = 120.0;

// USER_PARAMETERS

float uxx(float x, float y, float t) {
	return -2.0 * (1.0 + y) * (1.0 - y);
	//return -omega * omega * sin(omega * x);
	//return 1.0 + y + 2.0 * x * y + y * y + 7.0 * x;
}

float uyy(float x, float y, float t) {
	return -2.0 * (1.0 + x) * (1.0 - x);
	//return -omega * omega * cos(omega * y);
	//return x + x * x + x * 2.0 * y + 1.0 + 7.0 * y;
}

float f(float x, float y, float t) {
	return uxx(x, y, t) + uyy(x, y, t);
}

float u_f(float x, float y, float t) {
	//return sin(omega * x) + cos(omega * y);
	return 0.0;
}

void main () {
	vec2 coord = vTextureCoord.xy;
	
	float texx = coord.x;
	float texy = coord.y;
	
	float x = coord.x * 2.0 - 1.0;
	float y = coord.y * 2.0 - 1.0;
	
	if (texx <= texdx) {
		x = u_f(x, y, t);
		gl_FragColor = vec4(x, x, x, x);	
	} else if (texx >= (1.0 - texdx)) {
		// If a pixel is on the x boundary
		x = u_f(x, y, t);
		gl_FragColor = vec4(x, x, x, x);
	} else if (texy <= texdy) {
		x = u_f(x, y, t);
		gl_FragColor = vec4(x, x, x, x);
	} else if (texy >= (1.0 - texdy)) {
		// If a pixel is on the y boundary
		x = u_f(x, y, t);
		gl_FragColor = vec4(x, x, x, x);
	} else {
		vec4 left  = texture2D(uSampler, vec2(texx - texdx, texy        ));
		vec4 right = texture2D(uSampler, vec2(texx + texdx, texy        ));
		vec4 down  = texture2D(uSampler, vec2(texx        , texy - texdy));
		vec4 up    = texture2D(uSampler, vec2(texx        , texy + texdy));
		vec4 self  = texture2D(uSampler, vec2(texx        , texy        ));
		
		//* Blur kernel
		//gl_FragColor = 0.2 * (left + right + down + up + self);
		//*/
		
		float dx2 = dx * dx;
		float dy2 = dy * dy;
		
		//*
		// Forget this tiny, pathetic kernel.
		float r = (dy2 * (self.g +  left.g) + dx2 * (self.b +   up.b) - 2.0 * dx2 * dy2 * f(x - 0.5 * dx, y + 0.5 * dy, t)) / (2.0 * (dx2 + dy2));
		float g = (dy2 * (self.r + right.r) + dx2 * (self.a +   up.a) - 2.0 * dx2 * dy2 * f(x + 0.5 * dx, y + 0.5 * dy, t)) / (2.0 * (dx2 + dy2));
		float b = (dy2 * (self.a +  left.a) + dx2 * (self.r + down.r) - 2.0 * dx2 * dy2 * f(x - 0.5 * dx, y - 0.5 * dy, t)) / (2.0 * (dx2 + dy2));
		float a = (dy2 * (self.b + right.b) + dx2 * (self.g + down.g) - 2.0 * dx2 * dy2 * f(x + 0.5 * dx, y - 0.5 * dy, t)) / (2.0 * (dx2 + dy2));
		//*/
		
		/*
		// Feast your eyes upon a 9-point stencil!
		float r = (dy2 * (left.r - 16.0 * left.g - 16.0 * self.g  + right.r) + dx2 * (up.r - 16.0 * up.b   - 16.0 * self.b + down.r) + 12.0 * dx2 * dy2 * f(x - 0.5 * dx, y + 0.5 * dy, t)) / (-30.0 * (dx2 + dy2));
		float g = (dy2 * (left.g - 16.0 * self.r - 16.0 * right.r + right.g) + dx2 * (up.g - 16.0 * up.a   - 16.0 * self.a + down.g) + 12.0 * dx2 * dy2 * f(x + 0.5 * dx, y + 0.5 * dy, t)) / (-30.0 * (dx2 + dy2));
		float b = (dy2 * (left.b - 16.0 * left.a - 16.0 * self.a  + right.b) + dx2 * (up.b - 16.0 * self.r - 16.0 * down.r + down.b) + 12.0 * dx2 * dy2 * f(x - 0.5 * dx, y - 0.5 * dy, t)) / (-30.0 * (dx2 + dy2));
		float a = (dy2 * (left.a - 16.0 * self.b - 16.0 * right.b + right.a) + dx2 * (up.a - 16.0 * self.g - 16.0 * down.g + down.a) + 12.0 * dx2 * dy2 * f(x + 0.5 * dx, y - 0.5 * dy, t)) / (-30.0 * (dx2 + dy2));
		//*/
		
		gl_FragColor = vec4(r, g, b, a);
	}
}