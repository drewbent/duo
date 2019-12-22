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