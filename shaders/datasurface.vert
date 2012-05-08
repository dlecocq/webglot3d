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

uniform mat4 u_modelViewMatrix;
uniform mat4 u_projectionMatrix;
uniform mat4 u_modelViewInverse;

attribute vec4 aTextureCoord;
attribute vec4 position;

varying vec3 direction;
varying vec3 vposition;
varying vec3 v_texCoord;
varying vec3 light;
varying vec3 halfVector;

uniform float t;

void main() {
	vposition = (u_modelViewMatrix * position).xyz;

	gl_Position = u_projectionMatrix * u_modelViewMatrix * position;

	v_texCoord = (position).xyz;

	direction = normalize((u_modelViewInverse * vec4(0.0, 0.0, -300.0, 1.0)).xyz);
		
	light = vec3(10.0, 10.0, 10.0) - vec3(u_modelViewMatrix * position);
	
	halfVector = normalize(vec3(5.0, 5.0, 5.0).xyz);
}