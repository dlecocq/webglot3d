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