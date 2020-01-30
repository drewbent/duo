// Extend jQuery
$.fn.exists = function () {
	return this.length !== 0;
}

/** 
 * A class for storing variables associated with the current page load.
 * These variables span across multiple events called by dispatch.js.
 * Note that since the Khan Academy dynamically updates URLs, the
 * ContentSession variables can last a long time. However, the variables inside
 * it will often be overwritten.
 */
class ContentSession {
	/**
	 * Keep track of mastery points on a skill right before the skill was most
	 * recently completed.
	 * 
	 * This is set when the skill task window is first opened. It is then used
	 * when the task is completed and the DuoAPI is called.
	 */
	static masteryPointsStart;

	/**
	 * For AJAX web requests, we need to keep track of the data collected
	 * throughout their life cycle. This object has requestIds as its keys,
	 * and the web request details as its objects. We continually add to the
	 * web request details as more details come in. Used by dispatch.js.
	 * 
	 * Note: While having persistent data like this in a content script may seem
	 * like a bad idea, ideally all relevant data will be collected, updated, and
	 * used within the span of a few seconds as the request goes through its
	 * lifecycle.
	 * 
	 * Note: This is currently not being used as we're relying on parsing the
	 * DOM instead of intercepting AJAX requests.
	 */
	static dataMappedToRequestIds = {};
}