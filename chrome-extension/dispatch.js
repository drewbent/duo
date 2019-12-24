/**
 * @fileoverview Listen for both AJAX requests and DOM mutations, and then
 * trigger other functions as appropriate.
 */

// Track AJAX requests, listening to messages sent by background.js.
chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
  // TODO(drew): Figure out how to use this listener given that response bodies
  // are not included.
  if (msg.action == "web_request") {		
		sendResponse({ success: true });
	}
});

// Create an observer instance to track DOM mutations.
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
				DomParser.checkScore(newHTML);
			}
		}
  });
});
var observerConfig = {
  childList: true, 
  subtree: true
};
observer.observe(document.body, observerConfig); // Enable the observer.