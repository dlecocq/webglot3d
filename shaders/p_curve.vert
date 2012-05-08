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

attribute vec4 aTextureCoord;
attribute vec4 position;

varying vec2 v_texCoord;
varying vec3 normal;
varying vec3 light;
varying vec3 halfVector;

// USER_PARAMETERS

uniform float t;

vec4 function(float u) {
	vec4 result = vec4(USER_FUNCTION, 1.0);
	
	/* Here are some transformations for coordinate systems.  To make
	 * this more transparent when it's used.  This way, any time you
	 * call ``function'' in this shader, you can be certain it has had
	 * the coordinate transformation performed on it.
	 */
	
	/* CYLINDRICAL
	result = vec4(result.y * cos(result.x), result.y * sin(result.x), result.z, 1.0);
	//*/
	
	/* SPHERICAL
	result = vec4(result.x * sin(result.y) * cos(result.z), result.x * sin(result.y) * sin(result.z), result.x * cos(result.y), 1.0);
	//*/
	
	return result;
}

void main() {
	float x = position.x;
	float y = position.y;

	gl_Position = function(x);
	
	light = vec3(10.0, 10.0, 10.0) - vec3(u_modelViewMatrix * gl_Position);
	
	halfVector = normalize(vec3(5.0, 5.0, 5.0).xyz);

	float h = 0.01;
	/* There's actually no need to divide by 2h, because we're only looking
	 * for a direction, and it's going to be normalized anyway.
	 */
	vec4 fp  = normalize(function(x + h) - function(x - h));
	vec4 fpp = normalize(function(x + h) - 2 * function(x) + function(x - h));
	normal = normalize(cross(fp.xyz, fpp.xyz));
	
	normal = sin(y) * normal + cos(y) * fpp.xyz;
	
	gl_Position = gl_Position + 0.1 * vec4(normal, 0.0);
	
	normal = normalize((u_modelViewMatrix * vec4(normal, 1.0)).xyz);
	
	gl_Position = u_projectionMatrix * u_modelViewMatrix * gl_Position;

	v_texCoord = aTextureCoord.st;
}