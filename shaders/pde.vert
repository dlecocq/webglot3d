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

attribute vec4 position;
attribute vec2 aTextureCoord;

uniform sampler2D uSampler;

uniform float t;

varying vec2 vTextureCoord;

void main() {
	
	vec4 tex = texture2D(uSampler, aTextureCoord.st);
	
	vec4 result = position;
	result.z = (tex.r + tex.g + tex.b + tex.a) * 0.25;
	result.x = result.x * 4.0 - 2.0;
	result.y = result.y * 4.0 - 2.0;
	
	gl_Position = u_projectionMatrix * u_modelViewMatrix * result;
	
	vTextureCoord = aTextureCoord;
}