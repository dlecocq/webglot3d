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

varying vec2 coord;
varying vec3 normal;
varying vec3 light;
varying vec3 halfVector;

uniform sampler2D usTex;
uniform sampler2D vsTex;
uniform sampler2D cpsTex;

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
	//vec4 texture = texture2D(usTex, coord);
	//vec4 texture = vec4(0.5, 0.0, 0.0, 1.0);

	/*
	// Scaling The Input Vector To Length 1
	vec3 norm_normal = normalize(normal);
	vec3 norm_light = normalize(light);
	
	//gl_ModelViewMatrix * position;

	// Calculating The Diffuse Term And Clamping It To [0;1]
	float DiffuseTerm = clamp(dot(norm_normal, norm_light), 0.0, 1.0);

	// Calculating The Final Color
	//*
	gl_FragColor = 0.8 * texture + 0.2 * texture * DiffuseTerm;
	gl_FragColor.a = 1.0;
	//*/
	
	//gl_FragColor = color(texture.r);
	//gl_FragColor = texture;

	/* A normal map
	gl_FragColor = vec4(norm_normal.r, norm_normal.g, norm_normal.b, 1.0);
	//*/
	
	//gl_FragColor = color(texture.r / 10.0);
	//gl_FragColor = texture;
	//gl_FragColor.a = 1.0;
	//gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
	gl_FragColor = vec4(coord.x, 0.2, 0.2, 1.0);
}