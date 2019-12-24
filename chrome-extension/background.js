// Add callback for ajax requests.
const callback = function(details) {
	if (details.type == "xmlhttprequest" && details.statusCode == 200) {
		chrome.tabs.sendMessage(details.tabId, {
			action: "web_request",
			payload: details
		}, function(response) {});
	}
};
const filter = {urls: ["*://*.khanacademy.org/*"]};
const opt_extraInfoSpec = [];
chrome.webRequest.onCompleted.addListener(callback, filter, opt_extraInfoSpec);

// Enable page action popup
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

// Every time a new tab is opened or a new URL loaded, update the icon accordingly.
// In particular, the icon should always be dimmed except when on a KA webpage.
const newTabURL = function(tabId, url) {
	matching_regex = RegExp(".*\:\/\/.*khanacademy\.org.*");
	if (matching_regex.test(url)) {
		chrome.pageAction.setIcon({
			tabId: tabId,
			path: {
				"16": "images/icon16.png",
				"48": "images/icon48.png",
				"128": "images/icon128.png",
				"512": "images/icon512.png"  
			}
		}, () => {})
	} else if (url) {
		chrome.pageAction.setIcon({
			tabId: tabId,
			path: {
				"16": "images/icon16-dimmed.png",
				"48": "images/icon48-dimmed.png",
				"128": "images/icon128-dimmed.png",
				"512": "images/icon512-dimmed.png"  
			}
		}, () => {})
	}
};
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	newTabURL(tabId, changeInfo.url);
}); 
chrome.tabs.onActivated.addListener(function(activeInfo) {
	chrome.tabs.getSelected(null,function(tab) {
		newTabURL(activeInfo.tabId, tab.url);
	});
});