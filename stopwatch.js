/** \brief stopwatch : encapsulates timing routines
	*
	* This class encapsulates the system's timing functions.
	* I've found that Mac and Linux use very different
	* versions of time.h, and with different clock resolutions.
	* Rather than deal with it in the silly C-style (this 
	* is C++ after all), I created a simple stopwatch class.
	*/

function stopwatch() {
	
	this.s	 = null;
	this.tmp = null;
	this.t	 = 0;

	/** \brief Start the stopwatch
		*
		* Start the timing of the stopwatch, just records the
		* current WALL TIME.	This does not measure anything
		* but the wall time.	Not system time, not clock cycles
		* just the wall time.
		*/
	this.start = function() {
		this.s = new Date().getTime();
	}

	/** \brief Get the current time of the stopwatch
		*
		* This returns the stopwatch's current time without
		* stopping it.	Returns the time in seconds as a double
		*/
	this.time = function() {
		this.tmp = new Date().getTime();
		this.t = (this.tmp - this.s) / 1000;
		return this.t;
	}

	/** \brief Stop the stopwatch, get the time
		*
		* This returns the stopwatch's current time and
		* does stop it.	 Returns the time in seconds as a double
		*/
	this.stop = function() {
		this.tmp = new Date().getTime();
		this.t = (this.tmp - this.s) / 1000;
		return this.t;
	}
	
}