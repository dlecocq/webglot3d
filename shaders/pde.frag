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

precision mediump float;

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
	//gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
	//gl_FragColor = vec4(value, value, value, 1.0);

	//gl_FragColor.r = (gl_FragColor.r + 1.0) / 2.0;
	//gl_FragColor.a = 1.0;
	//*/
	//gl_FragColor = vec4(vTextureCoord.s, vTextureCoord.t, 0.0, 1.0);
}