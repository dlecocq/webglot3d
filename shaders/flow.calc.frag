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