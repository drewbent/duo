/*  A class for parsing and extracting data from the KA website via the DOM. */
class DOMParser {

  static getTaskScoreData(newTaskCompletionHTML) {    

    const rawScore = DOMParser.getRawTaskScore(newTaskCompletionHTML);
    const questionsCorrect = rawScore.score;
    const questionsOutOf = rawScore.outOf;

    const courseUnitSkillData = DOMParser.getCourseUnitSkill();
    const skill = courseUnitSkillData.skill;
    const unit = courseUnitSkillData.unit;
    const course = courseUnitSkillData.course;

    const masteryPointsStart = ContentSession.masteryPointsStart;
    const masteryPointsEnd = DOMParser.getSkillMasteryPoints();
    
    const classSection = 0; // TODO(drew): Make this real
  
    return {
      course: course,
      unit: unit,
      skill: skill,
      class_section: classSection,
      questionsCorrect: questionsCorrect,
      questionsOutOf: questionsOutOf,
      masteryPointsStart: masteryPointsStart,
      masteryPointsEnd: masteryPointsEnd
    }
  };

  static getCourseUnitSkill() {
    const skill = $("[data-test-id='modal-title']").text();
    const unit = $("[data-test-id='unit-block-title']").text();
    const course = $("[aria-label='breadcrumbs'] a").text();

    return {
      skill: skill,
      unit: unit,
      course: course
    }
  }

  static getSkillMasteryPoints() {
    const skill = $("[data-test-id='modal-title']").text();

    const masteryPracticeContentItem =
      $("[data-test-id='mastery-practice-content-item'] span")
        .filter(function() {
          return $(this).text() === skill;
        })
        .parents("[data-test-id='mastery-practice-content-item']")
        .first();
    
    const svg = masteryPracticeContentItem.find("svg");
    const masteryPointsStr = svg.attr("aria-valuenow");
    const masteryPoints = parseInt(masteryPointsStr, 10)

    return masteryPoints;
  }

  static getRawTaskScore(newTaskCompletionHTML) {
    const newHTML = newTaskCompletionHTML; // shorter variable name

    var score = -1;
    var outOf = -1;
  
    for (var i = 0; i <= 7; i++) {
      var scoreOutOf4 = newHTML.find("span[aria-label='" + String(i) +
        " out of 4 correct']");
      var scoreOutOf7 = newHTML.find("span[aria-label='" + String(i) +
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

    return {
      score: score,
      outOf: outOf
    }
  }
}