/*  A class for parsing and extracting data from the KA website via the DOM. */
class DOMParser {

  /**
   * Return the most recent skill score data.
   * This must be called when the task was just completed and the popup is
   * still visible.
   * @param newTaskCompletionHTML the jQuery object associated with the task
   * completion popup
   */
  static getSkillScoreData(newTaskCompletionHTML) {    

    const rawScore = DOMParser.getRawTaskScore(newTaskCompletionHTML);
    const questionsCorrect = rawScore.score;
    const questionsOutOf = rawScore.outOf;

    const courseUnitSkillData = DOMParser.getCourseUnitSkill();
    const skill = courseUnitSkillData.skill;
    const unit = courseUnitSkillData.unit;
    const course = courseUnitSkillData.course;

    // Use the variable stored in ContentSession to find the original mastery
    // points. This was parsed earlier on.
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

  /**
   * Return the mastery points associated with the currently active task.
   * (e.g. 0, 50, 80, 100 mastery points)
   * 
   * If called at the start of a task, then this will be the mastery points
   * at the beginning. If called after the task has been completed, then this
   * will be the mastery points at the end.
   * 
   * This is extracted from an aria label associated with the SVG graphics
   * that represent the mastery points in the DOM.
   */
  static getSkillMasteryPoints() {
    // Determine the current skill name.
    const skill = $("[data-test-id='modal-title']").text();

    // Identify the masteryPracticeContentItem jQuery object on the page that
    // is associated with the current skill.
    const masteryPracticeContentItem =
      $("[data-test-id='mastery-practice-content-item'] span")
        .filter(function() {
          // Exact matches are needed since skill names often have significant
          // overlap with one another.
          return $(this).text() === skill;
        })
        .parents("[data-test-id='mastery-practice-content-item']")
        .first();
    
    // Extract the mastery point data from the SVG.
    const svg = masteryPracticeContentItem.find("svg");
    const masteryPointsStr = svg.attr("aria-valuenow");
    const masteryPoints = parseInt(masteryPointsStr, 10)

    return masteryPoints;
  }

  // -------------------------------------------------------------------------
  // PRIVATE FUNCTIONS
  // -------------------------------------------------------------------------
  
  /**
   * Return the course, unit, and skill associated with the currently active
   * task.
   */
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

  /**
   * Return the raw task score from with the most recent task.
   * This includes both the raw points (e.g. 3) and the denominator (e.g. 7).
   * This must be called when the task was just completed and the popup is
   * still visible.
   * @param newTaskCompletionHTML the jQuery object associated with the task
   * completion popup
   */
  static getRawTaskScore(newTaskCompletionHTML) {
    const newHTML = newTaskCompletionHTML; // shorter variable name

    var score = -1;
    var outOf = -1;
  
    for (var i = 0; i <= 7; i++) {
      // TODO(drew): Confirm that there are no options beyond 4 or 7.
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