/* A class for interacting with the Duo backend through API calls. */
class DuoAPI {

  /**
   * Adds the Duo logo to the course page in the top left corner.
   * (e.g. on https://www.khanacademy.org/math/algebra)
   * @param subjectProgressSidebar A jQuery object containing the sidebar nav
   *    item in which the logo is to be added
   */
  static saveSkillScoreToDB(userId, score, outOf) {
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
}