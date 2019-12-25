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
        const userId = r.userId;
        const practiceAttempt = data.user.exerciseData.practiceAttempt;
        const score = practiceAttempt.numCorrect;
        const outOf = practiceAttempt.numAttempted;
        const mastery_points_start = practiceAttempt.startingFpmLevel; // todo
        const mastery_points_end = practiceAttempt.endingFpmLevel; // todo
        const classSection = 0; // TODO(drew): make this real
        const course = 0; // TODO(drew): make this real
        const unit = 0; // TODO(drew): make this real
        const skill = 0; // TODO(drew): make this real

        var request = $.ajax({
          type: "POST",
          url: 'http://127.0.0.1:5000/duo-user-completed-skills/', // TODO(drew): make this work on production
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
            console.log(data);
        });
      }
    });
  };
}