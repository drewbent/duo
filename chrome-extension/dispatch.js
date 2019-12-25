/**
 * @fileoverview Listen for both AJAX requests and DOM mutations, and then
 * trigger other functions as appropriate.
 */

/** 
 * Track AJAX requests, listening to messages sent by background.js.
 * 
 * Note: Why do we usually have to repeat the AJAX ourselves? Given the nature
 * of Chrome extensions, intercepted web requests never include response
 * bodies. Thus, we recreate the calls in order to get the necessary data from
 * the response bodies.
 */
chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
  /**
   * Keep track of all data associated a given web request in
   * ContentSession.dataMappedToRequestIds. This allows us to accumulate data
   * over the lifecycle of the web request.
   */
  if (msg.action == "web_request_headers_sent") {
    const requestId = msg.payload.requestId;
    ContentSession.dataMappedToRequestIds[requestId] = msg.payload;
  }
  if (msg.action == "web_request_completed") {
    const requestId = msg.payload.requestId;
    if (requestId in ContentSession.dataMappedToRequestIds){
      // If the requestId already exists (which it should), extend the current
      // data to include the latest request data.
      var currentData = ContentSession.dataMappedToRequestIds[requestId];
      $.extend(currentData, msg.payload);
      ContentSession.dataMappedToRequestIds[requestId] = currentData
    } else {
      ContentSession.dataMappedToRequestIds[requestId] = msg.payload;
    }
  }

  /**
   * When a task is first loaded, we intercept an API call and then replicate
   * it ourselves in order to obtain the KA task ID, which we save as we'll
   * need it later.
   * Note: We need header data to do this, so we do it at the
   * 'web_request_headers_sent' part of the request's lifecycle.
   * Note: We need !'calledByChrome=true' in order to make sure we don't create
   * an infinite loop of these API calls triggering more calls.
   */
  if (msg.action == "web_request_headers_sent"
      && msg.payload.url.includes("api/internal/user/task/practice/")
      && !msg.payload.url.includes("calledByChrome=true")) {
    
    KhanAPI.getTaskId(msg.payload, function(currentKATaskId) {
      ContentSession.currentKATaskId = currentKATaskId;
      console.log("yay");
      console.log(ContentSession.currentKATaskId);
    });
  }

  /**
   * When a task is completed, we intercept the API call and then replicate it
   * ourselves in order to obtain task completion data (i.e. score).
   * Note: We need header data to do this, so we do it at the
   * 'web_request_headers_sent' part of the request's lifecycle.
   */
  if (msg.action == "web_request_headers_sent"
      && msg.payload.url.includes("opname=getEotCardDetails")
      && !msg.payload.url.includes("calledByChrome=true")) {
    
    KhanAPI.getEotCardDetails(msg.payload, function(data) {
      console.log(data);
      //DuoAPI.saveSkillScoreToDB(data);
    });
  }


  sendResponse({ success: true });
});

/**
 * Create an observer instance to track DOM mutations.
 */
var observer = new MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
    const addedNodes = mutation.addedNodes
    // Look to see if the mutation included any new DOM nodes. 
		if (addedNodes.length > 0) {
			const newHTML = $(addedNodes[0].outerHTML);
      
      // If subjectProgressSidebar exists, then it's time to add the Duo logo
      // to the page in the sidebar.
      const subjectProgressSidebar = newHTML.find(
        "nav[data-test-id='subject-progress-sidebar']");
			if (subjectProgressSidebar.exists()) {
				UI.addDuoLogoToCoursePage(subjectProgressSidebar);
      }
      
      // If correctAriaLabel exists, then a skill has been completed. 
			const correctAriaLabel = newHTML.find("span[aria-label*='correct']");
			if (correctAriaLabel.exists()) {
				// TODO(drew): clean up this function and what calls what.
				// DOMParser.checkScore(newHTML);
			}
		}
  });
});
var observerConfig = {
  childList: true, 
  subtree: true
};
observer.observe(document.body, observerConfig); // Enable the observer.