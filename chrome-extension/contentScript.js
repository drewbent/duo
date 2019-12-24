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

	chrome.storage.sync.get(["userId", "loggedIn"], function(r) {
    if (r.loggedIn) {
      saveSkillScoreToDB(r.userId, score, outOf);
    }
  });

	console.log("The score is " + String(score) + " out of " + String(outOf));
};

const saveSkillScoreToDB = function(userId, score, outOf) {
	// course, unit, skill
	// mastery_points_start
	// mastery_points_end
	const skill = $("[data-test-id='modal-title']").text();
	const unit = $("[data-test-id='unit-block-title']").text();
	const course = $("[aria-label='breadcrumbs'] a").text();

	const classSection = 0; // TODO(drew): complete
	const masteryPointsStart = -1; // TODO(drew): complete
	const masteryPointsEnd = -1; // TODO(drew): complete
	$("[aria-label='breadcrumbs'] a").text();

	var request = $.ajax({
		type: "POST",
		url: 'http://127.0.0.1:5000/duo-user-completed-skills/',
		data: {
			user_id: userId,
			course: course,
			unit: unit,
			skill: skill,
			class_section: classSection,
			questions_correct: score,
			questions_out_of: outOf,
			mastery_points_start: masteryPointsStart,
			mastery_points_end: masteryPointsEnd
		}
	});
	
	request.done(function(data) {
			// your success code here
			console.log("success");
			console.log(data);
	});
};

// Create an observer instance to track DOM mutations.
var observer = new MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
		const addedNodes = mutation.addedNodes
		if (addedNodes.length > 0) {
			const newHTML = $(addedNodes[0].outerHTML);
			
			const correctAriaLabel = newHTML.find("span[aria-label*='correct']");
			if (correctAriaLabel.exists()) {
				// TODO(drew): clean up this function and what calls what.
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
