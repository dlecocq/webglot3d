/* Copyright (c) 2009-2010 King Abdullah University of Science and Technology
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/*
varying vec2 vTextureCoord;

uniform sampler2D uSampler;

varying vec3 direction;
varying vec3 vposition;
varying vec3 vTexCoord;
varying vec3 light;
varying vec3 halfVector;

uniform float b_width;
uniform float b_height;
uniform float width;
uniform float height;

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
	//gl_FragColor = vec4(vTextureCoord.s, vTextureCoord.t, 0.0, 1.0);
	//gl_FragColor = vec4(value, value, value, 1.0);
	//gl_FragColor = tex;

	//gl_FragColor.r = (gl_FragColor.r + 1.0) / 2.0;
	//gl_FragColor.a = 1.0;
	//gl_FragColor = vec4(vTextureCoord.s, vTextureCoord.t, 0.0, 1.0);
}
//*/

//*

precision mediump float;

varying vec3 direction;
varying vec3 vposition;
varying vec3 vTexCoord;
varying vec3 light;
varying vec3 halfVector;

uniform float b_width;
uniform float b_height;
uniform float width;
uniform float height;

// USER_PARAMETERS

float depth    = b_width * b_height;

const float hw = 2.0;

const vec3 min = vec3(-hw, -hw, -hw);
const vec3 max = vec3( hw,  hw,  hw);

uniform sampler2D uSampler;

uniform float t;

float function(float x, float y, float z) {
	//return sin(x * x + y * y + z * z);
	//*
	// Eventually you should do linear interpolation.
	// Do this first with the low z, then the high z
	float zint = floor((z / 4.0 + 0.5) * depth);
	
	float alpha = (z / 4.0 + 0.5) * depth - zint;
	
	float row = floor(zint / b_width);
	float col = floor(mod(zint, b_width));
	
	float xcoord = ((x / 4.0 + 0.5) + col) / b_width;
	float ycoord = ((y / 4.0 + 0.5) + row) / b_height;

	vec4 lo = texture2D(uSampler, vec2(xcoord, 1.0 - ycoord));
	
	//return lo;
	
	zint += 1.0;
	row = floor(zint / b_width);
	col = floor(mod(zint, b_width));
	
	xcoord = ((x / 4.0 + 0.5) + col) / b_width;
	ycoord = ((y / 4.0 + 0.5) + row) / b_height;
	
	vec4 hi = texture2D(uSampler, vec2(xcoord, 1.0 - ycoord));
	hi = alpha * hi + (1.0 - alpha) * lo;
	return (hi.r + hi.g + hi.b + hi.a) * 0.25 - isovalue;
	//return (x + b_width) / 2.0;
	//return alpha * hi + (1.0 - alpha) * lo - isovalue;
}

vec3 f_normal(float x, float y, float z, float h) {
	float dx = (function(x + h, y, z) - function(x - h, y, z));
	float dy = (function(x, y + h, z) - function(x, y - h, z));
	float dz = (function(x, y, z + h) - function(x, y, z - h));
	return normalize((0.5 / h) * vec3(dx, dy, dz));
}

void main () {
	vec3 start = vTexCoord;
	
	vec3 point;
	gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);

	float s   = 0.0;
	float ds  = 0.1;

	float h = 4.0 / min(depth, min(height, width));

	float s_previous;
	float v_previous;
	float value;
	
	vec3 temp1;
	vec3 temp2;
	
	point = start + direction * s;
	v_previous = function(point.x, point.y, point.z);

	//gl_FragColor = vec4(v_previous, v_previous, v_previous, 1.0);
	
	//*
	for (s = ds; s < 6.93; s += ds) {
		// Determine the point you're sampling, and sample it
		point = start + direction * s;
		value = function(point.x, point.y, point.z);
		
		// If it's less than 0, then draw something
		if ((value * v_previous) < 0.0) {
			// Linearly interpolate where the value is 0
			s = (s_previous * value - s * v_previous) / (value - v_previous);
			point = start + direction * s;
			
			vec3 normal = f_normal(point.x, point.y, point.z, h);
			
			// Take the dot product, and gray-scale accordingly

			float dot = abs(dot(normal, direction));
			gl_FragColor = vec4(dot, dot, dot, 1.0);
			//gl_FragColor = vec4(point.x, point.y, point.z, 1.0);
			//gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
			break;
		} else {
			// If it's not less than 0, then save the current value and
			// step as the previous one.  This is used for lin. interp.
			s_previous = s;
			v_previous = value;
			
			// Check to see if you're still inside the box.  If not, then bail.
			temp1 = sign(point - min);
			temp2 = sign(max - point);
			if (dot(temp1, temp2) < 3.0) {
				break;
			}
		}
	}
	//*/

}
