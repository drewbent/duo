var addLogo = function() {
	const logoURL = chrome.extension.getURL('images/icon128.png');
	const template = Handlebars.compile(`
		<a href='#'>
			<img src='{{logoURL}}' class='logo-button' />
		</a>
	`);
	const logoHTML = template({ logoURL: logoURL });
	
	$("nav[data-test-id='subject-progress-sidebar']").find("h4").parent().append(logoHTML);
}

var checkScore = function(newHTML) {
	var score = -1;
	var outOf = -1;

	for (var i = 0; i <= 7; i++) {
		scoreOutOf4 = newHTML.find("span[aria-label='" + String(i) + " out of 4 correct']");
		scoreOutOf7 = newHTML.find("span[aria-label='" + String(i) + " out of 7 correct']");
		
		if (scoreOutOf4.exists()) {
			score = i;
			outOf = 4;
		}

		if (scoreOutOf7.exists()) {
			score = i;
			outOf = 7;
		}
	}

	var request = $.ajax({
		type: "GET",
		url: 'https://duo-learn.herokuapp.com/student-mastery/get/',
		data: {
			skill_id: 123
		}
	});
	
	request.done(function(data) {
			// your success code here
			console.log("success");
			console.log(data);
	});

	console.log("The score is " + String(score) + " out of " + String(outOf));
};

// Create an observer instance to track DOM mutations.
var observer = new MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
		const addedNodes = mutation.addedNodes
		if (addedNodes.length > 0) {
			const newHTML = $(addedNodes[0].outerHTML);
			
			const correctAriaLabel = newHTML.find("span[aria-label*='correct']");
			if (correctAriaLabel.exists()) {
				checkScore(newHTML);
			}

			const subjectProgressSidebar = newHTML.find("nav[data-test-id='subject-progress-sidebar']");
			if (subjectProgressSidebar.exists()) {
				addLogo();
			}
		}
  });
});
var observerConfig = {
  childList: true, 
  subtree: true
};
observer.observe(document.body, observerConfig);

// Track AJAX requests.
chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
	if (msg.action == "web_request") {
		//console.log(msg.payload.url);
		
		sendResponse({ success: true });
	}
});

// Extend jQuery
$.fn.exists = function () {
	return this.length !== 0;
}
