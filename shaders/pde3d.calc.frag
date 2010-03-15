#version 120

varying vec2 vTextureCoord;

uniform sampler2D uSampler;

uniform float t;

// USER_PARAMETERS

uniform int width;
uniform int height;
uniform int b_width;
uniform int b_height;

int depth = b_width * b_height;

float texdy = 1.0 / float(height * b_height);
float texdx = 1.0 / float(width  * b_width );
float texdz = 1.0 / float(depth );

float dy = 2.0 / (float(height) - 1.0);
float dx = 2.0 / (float(width ) - 1.0);
float dz = 2.0 / (float(depth ) - 1.0);

const float alpha = 1.0;

const float omega = 20.0;

int mod(int a, int b) {
	return a - (a / b) * b;
}

float mod(float a, float b) {
	return a - floor(a / b) * b;
}

float uxx(float x, float y, float z, float t) {
	//return -2.0 * (1.0 + y) * (1.0 - y);
	return -omega * omega * sin(omega * x);
	//return 1.0 + y + 2.0 * x * y + y * y + 7.0 * x;
}

float uyy(float x, float y, float z, float t) {
	//return -2.0 * (1.0 + x) * (1.0 - x);
	return -omega * omega * cos(omega * y);
	//return x + x * x + x * 2.0 * y + 1.0 + 7.0 * y;
}

float uzz(float x, float y, float z, float t) {
	return -omega * omega * cos(omega * z);
}

float f(float x, float y, float z, float t) {
	return uxx(x, y, z, t) + uyy(x, y, z, t) + uzz(x, y, z, t);
}

float u_f(float x, float y, float z, float t) {
	//return sin(omega * x) + cos(omega * y);
	return 0.0;
}

void main () {
	vec2 coord = vTextureCoord.xy;
	
	float texx = mod(coord.x * float(b_width) , 1.0);
	float texy = mod(coord.y * float(b_height), 1.0);
	
	int xint = int(coord.x * float(width  * b_width ));
	int yint = int(coord.y * float(height * b_height));
	
	float x = texx * 2.0 - 1.0;
	float y = texy * 2.0 - 1.0;
	
	float col = floor(coord.x * float(b_width ));
	float row = floor(coord.y * float(b_height));
	
	float z = float(col + b_width * row) * 2.0 / float(depth) - 1.0;
	
	if (mod(xint, width) == 0) {
		x = u_f(x, y, z, t);
		gl_FragColor = vec4(x, x, x, x);
		//gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
	} else if (mod(xint + 1, width) == 0) {
		// If a pixel is on the x boundary
		x = u_f(x, y, z, t);
		gl_FragColor = vec4(x, x, x, x);
		//gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
	} else if (mod(yint, height) == 0) {
		x = u_f(x, y, z, t);
		gl_FragColor = vec4(x, x, x, x);
		//gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
	} else if (mod(yint + 1, height) == 0) {
		// If a pixel is on the y boundary
		x = u_f(x, y, z, t);
		gl_FragColor = vec4(x, x, x, x);
		//gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
	} else {
		// Change this to do tests beforehand, when calculating where to search
		if (coord.x < (1.0 / float(b_width)) && coord.y < (1.0 / float(b_height))) {
			gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
		} else if (coord.x > (1.0 - 1.0 / float(b_width)) && coord.y > (1.0 - 1.0 / float(b_height))) {
			gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
		} else {
			/* God, there has to be a simpler way */
			int abovecol = int(mod(int(col + 1.0), b_width));
			int belowcol = int(mod(int(col) + b_width - 1, b_width));
			int aboverow = int(row + int(col + 1.0) / b_width);
			int belowrow = int(row + (floor((col - 1.0) / float(b_width))) - 1.0);
			
			float abovetexx = float(abovecol) / float(b_width );
			float abovetexy = float(aboverow) / float(b_height);
			float belowtexx = float(belowcol) / float(b_width );
			float belowtexy = float(belowrow) / float(b_height);
			
			vec4 above = texture2D(uSampler, vec2(abovetexx + texx, abovetexy + texy));
			vec4 below = texture2D(uSampler, vec2(belowtexx + texx, belowtexy + texy));
			
			vec4 left  = texture2D(uSampler, vec2(coord.x - texdx, coord.y        ));
			vec4 right = texture2D(uSampler, vec2(coord.x + texdx, coord.y        ));
			vec4 down  = texture2D(uSampler, vec2(coord.x        , coord.y - texdy));
			vec4 up    = texture2D(uSampler, vec2(coord.x        , coord.y + texdy));
			vec4 self  = texture2D(uSampler, vec2(coord.x        , coord.y        ));

			//* Blur kernel
			//gl_FragColor = 0.2 * (left + right + down + up + self);
			//*/

			float dx2 = dx * dx;
			float dy2 = dy * dy;
			float dz2 = dz * dz;

			/*
			// Forget this tiny, pathetic kernel.
			float r = (dy2 * (self.g +  left.g) + dx2 * (self.b +   up.b) - 2.0 * dx2 * dy2 * f(x - 0.5 * dx, y + 0.5 * dy, z, t)) / (2.0 * (dx2 + dy2));
			float g = (dy2 * (self.r + right.r) + dx2 * (self.a +   up.a) - 2.0 * dx2 * dy2 * f(x + 0.5 * dx, y + 0.5 * dy, z, t)) / (2.0 * (dx2 + dy2));
			float b = (dy2 * (self.a +  left.a) + dx2 * (self.r + down.r) - 2.0 * dx2 * dy2 * f(x - 0.5 * dx, y - 0.5 * dy, z, t)) / (2.0 * (dx2 + dy2));
			float a = (dy2 * (self.b + right.b) + dx2 * (self.g + down.g) - 2.0 * dx2 * dy2 * f(x + 0.5 * dx, y - 0.5 * dy, z, t)) / (2.0 * (dx2 + dy2));
			//*/

			//*
			// Feast your eyes upon a 9-point stencil!
			float r = (dy2 * dz2 * (left.r - 16.0 * left.g - 16.0 * self.g  + right.r) + dx2 * dz2 * (up.r - 16.0 * up.b   - 16.0 * self.b + down.r) + dx2 * dy2 * 12.0 * (above.r + below.r) + 12.0 * dx2 * dy2 * dz2 * f(x - 0.5 * dx, y + 0.5 * dy, z, t)) / (-30.0 * dz2 * (dx2 + dy2) - 24.0 * dx2 * dy2);
			float g = (dy2 * dz2 * (left.g - 16.0 * self.r - 16.0 * right.r + right.g) + dx2 * dz2 * (up.g - 16.0 * up.a   - 16.0 * self.a + down.g) + dx2 * dy2 * 12.0 * (above.g + below.g) + 12.0 * dx2 * dy2 * dz2 * f(x + 0.5 * dx, y + 0.5 * dy, z, t)) / (-30.0 * dz2 * (dx2 + dy2) - 24.0 * dx2 * dy2);
			float b = (dy2 * dz2 * (left.b - 16.0 * left.a - 16.0 * self.a  + right.b) + dx2 * dz2 * (up.b - 16.0 * self.r - 16.0 * down.r + down.b) + dx2 * dy2 * 12.0 * (above.b + below.b) + 12.0 * dx2 * dy2 * dz2 * f(x - 0.5 * dx, y - 0.5 * dy, z, t)) / (-30.0 * dz2 * (dx2 + dy2) - 24.0 * dx2 * dy2);
			float a = (dy2 * dz2 * (left.a - 16.0 * self.b - 16.0 * right.b + right.a) + dx2 * dz2 * (up.a - 16.0 * self.g - 16.0 * down.g + down.a) + dx2 * dy2 * 12.0 * (above.a + below.a) + 12.0 * dx2 * dy2 * dz2 * f(x + 0.5 * dx, y - 0.5 * dy, z, t)) / (-30.0 * dz2 * (dx2 + dy2) - 24.0 * dx2 * dy2);
			//*/

			gl_FragColor = vec4(r, g, b, a);
		}

	}
	//gl_FragColor = vec4(float(xint) / float(width * b_width), 0.0, 0.0, 1.0);
	//gl_FragColor = vec4(z, z, z, 1.0);

}