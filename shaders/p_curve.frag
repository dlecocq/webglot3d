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

varying vec2 v_texCoord;
varying vec3 normal;
varying vec3 light;
varying vec3 halfVector;

uniform sampler2D sampler;

void main () {
	vec4 texture = texture2D(sampler, v_texCoord.st);

	// Scaling The Input Vector To Length 1
	vec3 norm_normal = normalize(normal);
	vec3 norm_light = normalize(light);

	// Calculating The Diffuse Term And Clamping It To [0;1]
	float DiffuseTerm = clamp(abs(dot(norm_normal, norm_light)), 0.0, 1.0);

	// Calculating The Final Color
	gl_FragColor = 0.4 * texture + 0.6 * texture * DiffuseTerm;
	// This tends to set the alpha to a non-1 value, so we correct this.
	gl_FragColor.a = 1.0;
	
	/* This colors the surface based on a normal map
	gl_FragColor = vec4(norm_normal.r, norm_normal.g, norm_normal.b, 1.0);
	//*/
}