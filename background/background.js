/**
 * Add callback for completed AJAX requests; to be used by dispatch.js.
 */
chrome.webRequest.onCompleted.addListener(function(details) {
	// First, make sure it's a successful HTTP request.
	// TODO(drew): only consider current tab?
	if (details.type == "xmlhttprequest" && details.statusCode == 200) {
		// If it is, send a message that can be picked up by dispatch.js.
		chrome.tabs.sendMessage(details.tabId, {
			action: "web_request_completed",
			payload: details
		}, function(response) {});
	}
}, {urls: ["*://*.khanacademy.org/*"]}, []);

/**
 * Add callback for AJAX requests earlier on in their lifecycle.
 * This allows us to capture headers, including cookies, which are not
 * contained in the completed webRequest callback.
 * Once again, this is used by dispatch.js.
 */
chrome.webRequest.onSendHeaders.addListener(function(details) {
	if (details.type == "xmlhttprequest") {
		chrome.tabs.sendMessage(details.tabId, {
			action: "web_request_headers_sent",
			payload: details
		}, function(response) {});
	}
}, {urls: ["*://*.khanacademy.org/*"]}, ["requestHeaders", "extraHeaders"]);

// Enable the Duo popup (i.e. page action) for all URLs.
// This allows users to click the Chrome extension icon and see the popup.
chrome.runtime.onInstalled.addListener(function() {
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
		chrome.declarativeContent.onPageChanged.addRules([{
			conditions: [new chrome.declarativeContent.PageStateMatcher({
				pageUrl: {urlMatches: '.*'},
			})
			],
				actions: [new chrome.declarativeContent.ShowPageAction()]
		}]);
	});
});

// Every time a new tab is opened or a new URL loaded, update the icon
// accordingly. The icon should always be dimmed except when on a KA webpage.
const newTabURL = function(tabId, url) {
	matching_regex = RegExp(".*\:\/\/.*khanacademy\.org.*");
	if (matching_regex.test(url)) {
		chrome.pageAction.setIcon({
			tabId,
			path: {
				"16": "images/icon16.png",
				"48": "images/icon48.png",
				"128": "images/icon128.png",
				"512": "images/icon512.png"  
			}
		}, () => {})
	} else if (url) {
		chrome.pageAction.setIcon({
			tabId,
			path: {
				"16": "images/icon16-dimmed.png",
				"48": "images/icon48-dimmed.png",
				"128": "images/icon128-dimmed.png",
				"512": "images/icon512-dimmed.png"  
			}
		}, () => {})
	}
};

// Listen for the url to change on the current tab.
chrome.tabs.onUpdated.addListener(function(tabId, _, tab) {
	// Teacher dashboard scraper popup?
	executeScript(tabId, 'content/scripts/teacher-dashboard-scraper.js')
	newTabURL(tabId, tab.url);
});

// Listen for new tabs to be selected.
chrome.tabs.onActivated.addListener(function(activeInfo) {
	chrome.tabs.getSelected(null, function(tab) {
		newTabURL(activeInfo.tabId, tab.url);
	});
});