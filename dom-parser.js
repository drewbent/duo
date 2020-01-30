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

    // If unit-block-title does not exist, we are not on the unit page.
    // Instead, we're on the lessson page and need to adjust our parsing
    // accordingly.
    const isLessonView = !($("[data-test-id='unit-block-title']").exists());

    const rawScore = DOMParser.getRawTaskScore(newTaskCompletionHTML);
    const questionsCorrect = rawScore.score;
    const questionsOutOf = rawScore.outOf;

    const courseUnitSkillData = DOMParser.getCourseUnitSkill(isLessonView);
    const skill = courseUnitSkillData.skill;
    const unit = courseUnitSkillData.unit;
    const course = courseUnitSkillData.course;

    // Use the variable stored in ContentSession to find the original mastery
    // points. This was parsed earlier on.
    // Note: there is no way to find the mastery points in the lesson view, so
    // in this case we just return null.
    const masteryPointsStart = isLessonView ? 
      null : ContentSession.masteryPointsStart;
    const masteryPointsEnd = isLessonView ? 
      null : DOMParser.getSkillMasteryPoints();
    
    const classSection = 0; // TODO(drew): Make this real
  
    return {
      course: course,
      unit: unit,
      skill: skill,
      classSection: classSection,
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
   * 
   * Note: this code only runs on the unit view and should not be run on the
   * lesson view.
   */
  static getSkillMasteryPoints() {
    const skillName = $("[data-test-id='modal-title']").text();

    // Identify the masteryPracticeContentItem jQuery object on the page that
    // is associated with the current skill.
    const masteryPracticeContentItem =
      $("[data-test-id='mastery-practice-content-item'] span")
        .filter(function() {
          // Exact matches are needed since skill names often have significant
          // overlap with one another.
          return $(this).text() === skillName;
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
   * 
   * @param isLessonView true if the user is in the lesson view; false if the
   *   user is the normal unit view
   */
  static getCourseUnitSkill(isLessonView) {

    let skill;
    let unit;
    let course;

    if (!isLessonView) {
      skill = $("[data-test-id='modal-title']").text();
      unit = $("[data-test-id='unit-block-title']").text();
      course = $("[aria-label='breadcrumbs'] a").text();
    }

    if (isLessonView) {
      // On the lesson view, the course and unit metadata are stored in ld+json
      const jsonld = JSON.parse(document.querySelector(
        'script[type="application/ld+json"]').innerText);
      course = jsonld.itemListElement[1].item.name;
      unit = jsonld.itemListElement[2].item.name;
      
      // The skill name is extracted from the lefthand navigation
      const ariaCurrent = $(
        "[aria-label='lesson table of contents'] [aria-current='true']");
      ariaCurrent.first().find("div").each(function(index) {
        // One of the divs inside the currently selected element has a title.
        // Find this one and use it to extract the skill name.
        const title = $(this).attr("title");
        if (title) {
          skill = title.replace("Practice: ", "");
        }
      });
    }

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
   *   completion popup
   */
  static getRawTaskScore(newTaskCompletionHTML) {
    const newHTML = newTaskCompletionHTML; // shorter variable name

    var score = -1;
    var outOf = -1;
  
    for (var i = 0; i <= 7; i++) {
      // TODO: Confirm that there are no options beyond 4 or 7.
      // TODO: Find way to do this with arbitrary numbers (regex)
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