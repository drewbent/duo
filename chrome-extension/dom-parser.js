/*  A class for parsing and extracting data from the KA website via the DOM. */
class DOMParser {

  static checkScore(newHTML) {
    var score = -1;
    var outOf = -1;
  
    for (var i = 0; i <= 7; i++) {
      scoreOutOf4 = newHTML.find("span[aria-label='" + String(i) +
        " out of 4 correct']");
      scoreOutOf7 = newHTML.find("span[aria-label='" + String(i) +
        " out of 7 correct']");
      
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
}