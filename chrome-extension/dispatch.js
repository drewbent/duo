/**
 * @fileoverview Listen for both AJAX requests and DOM mutations, and then
 * trigger other functions as appropriate.
 */

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
				const data = DOMParser.getSkillScoreData(newHTML);
        DuoAPI.saveSkillScoreToDB(data, function(success) {
          if ("duo-help" in success) {
            UI.addHelpOfferToEndOfTask(success["duo-help"]);
          }
        });
      }
      
      const skillTaskTitle = newHTML.find("[data-test-id='modal-title']");
      if (skillTaskTitle.exists()) {
        ContentSession.masteryPointsStart = DOMParser.getSkillMasteryPoints();
      }
		}
  });
});
var observerConfig = {
  childList: true, 
  subtree: true
};
observer.observe(document.body, observerConfig); // Enable the observer.


/** 
 * Track AJAX requests, listening to messages sent by background.js.
 * 
 * Note: This is currently not being used as we're relying on parsing the DOM
 * instead of intercepting AJAX requests.
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

  sendResponse({ success: true });
});