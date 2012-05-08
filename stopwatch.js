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

/** Encapsulates timing routines.  All times are returned in 
 * seconds.
 *
 * @constructor
 */
function stopwatch() {
	/** The start Time object */
	this.s	 = null;
	/** A temporary Time object for retrieving the difference
	 * between the start and the current time */
	this.tmp = null;
	/** The stopped Time object */
	this.t	 = 0;

	/** Start the stopwatch, recording the current time. */
	this.start = function() {
		this.s = new Date().getTime();
	}

	/** Get the current time of the stopwatch WITHOUT stopping it */
	this.time = function() {
		this.tmp = new Date().getTime();
		this.t = (this.tmp - this.s) / 1000;
		return this.t;
	}

	/** Stop the stopwatch, and return the time in seconds */
	this.stop = function() {
		this.tmp = new Date().getTime();
		this.t = (this.tmp - this.s) / 1000;
		return this.t;
	}	
}