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

attribute vec4 vTexCoord;
attribute vec4 vPosition;

varying vec2 v_texCoord;
varying vec3 normal;
varying vec3 light;
varying vec3 halfVector;

// USER_PARAMETERS

uniform float t;

float cosh(float val) {
    float tmp = exp(val);
    float cosH = (tmp + 1.0 / tmp) / 2.0;
    return cosH;
}

float function(float x, float y) {
	/* CYLINDRICAL
	// Here is a transformation for cylindrical coordinates.
	float r = sqrt(x * x + y * y);
	y = atan(y, x);
	x = r;
	//*/
	
	return USER_FUNCTION;
}

void main() {
	float x = vPosition.x;
	float y = vPosition.y;

	vec4 result = vec4(x, y, function(x, y), 1.0);

	gl_Position = u_projectionMatrix * u_modelViewMatrix * result;

	// Normal calculation
	const float h = 0.001;
	float dx = (function(x + h, y    ) - function(x - h, y    )) / (2.0 * h);
	float dy = (function(x		, y + h) - function(x    , y - h)) / (2.0 * h);
	
	normal = (u_modelViewMatrix * vec4(dx, dy, 1.0, 0.0)).xyz;
	v_texCoord = vTexCoord.st;
	
	light = vec3(10.0, 10.0, 10.0) - vec3(u_modelViewMatrix * result);
	
	halfVector = normalize(vec3(5.0, 5.0, 5.0).xyz);
}