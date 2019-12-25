/* A class for interacting with the Duo backend through API calls. */
class DuoAPI {

  /**
   * Adds the Duo logo to the course page in the top left corner.
   * (e.g. on https://www.khanacademy.org/math/algebra)
   * @param subjectProgressSidebar A jQuery object containing the sidebar nav
   *    item in which the logo is to be added
   */
  static saveSkillScoreToDB(data) {
    chrome.storage.sync.get(["userId", "loggedIn"], function(r) {
      if (r.loggedIn) {
        var request = $.ajax({
          type: "POST",
          url: 'http://127.0.0.1:5000/duo-user-completed-skills/', // TODO(drew): make this work on production
          data: {
            user_id: r.userId,
            course: data.course,
            unit: data.unit,
            skill: data.skill,
            class_section: data.classSection,
            questions_correct: data.questionsCorrect,
            questions_out_of: data.questionsOutOf,
            mastery_points_start: data.masteryPointsStart,
            mastery_points_end: data.masteryPointsEnd
          },
          dataType: "json"
        });
        
        request.done(function(success) {
            console.log(success);
        });

        request.fail(function(error) {
          console.log(error);
        });
      } else {
        console.log("Logged out.");
      }
    });
  };
}