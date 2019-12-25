/** 
 * A class for interacting with the KA backend through API calls.
 * Given that the API is not open, we have to intercept other calls (see
 * dispatch.js) and adopt their same cookies and auth tokens.
 */
class KhanAPI {

  /**
   * Replicate the api/internal/user/task/practice/ GET call to identify the
   * KA task ID associated with the current task.
   * @param payload the payload associated with the intercepted AJAX call
   *   that is now to be replicated
   * @param callback the callback function to call once the task ID is found
   */
  static getTaskId(payload, callback) {
    var fkey;
    // Extract x-ka-fkey from the header, as we'll need it in our own call.
    payload.requestHeaders.forEach(function(header) {
      if (header.name == "x-ka-fkey") {
        fkey = header.value;
      }
    });

    var request = $.ajax({
      type: "GET",
      // We need &calledByChrome=true in order to make sure we don't create
      // an infinite loop of these API calls triggering more calls.
      url: payload.url + "&calledByChrome=true",
      headers: {
        "x-ka-fkey": fkey
      },
      xhrFields: {
        withCredentials: true // mantain current cookie data
      },
      dataType: "json"
    });

    request.done(function(data) {
      callback(data.taskJson.id);
    });

    request.fail(function(error) {
      console.log(error);
    });
  }

  /**
   * Replicate the getEotCardDetails API call to collect mastery data after
   * a skill has been completed.
   * @param payload the payload associated with the intercepted AJAX call
   *   that is now to be replicated
   * @param callback the callback function to call once the skill data has
   *   been obtained
   */
  static getEotCardDetails(payload, callback) {
    var cookie;
    var fkey;
    payload.requestHeaders.forEach(function(header) {
      if (header.name == "Cookie") {
        cookie = header.value;
      }
      if (header.name == "x-ka-fkey") {
        fkey = header.value;
      }
    });

    var data = {
      "operationName": "getEotCardDetails",
      "variables": {
        "taskId": ContentSession.currentKATaskId
      },
      "query": "query getEotCardDetails($taskId: String!) {\n  user {\n" +
        "    id\n    exerciseData {\n      practiceAttempt(taskId: $taskId)" +
        " {\n        id\n        numAttempted\n        numCorrect\n        " +
        "startingFpmLevel\n        endingFpmLevel\n        " +
        "masteryLevelChange\n        pointsEarned\n        __typename\n" +
        "      }\n      __typename\n    }\n    __typename\n  }\n}\n"
    }

    var request = $.ajax({
      type: "POST",
      url: "https://www.khanacademy.org/api/internal/graphql?opname=getEotCardDetails&lang=en&calledByChrome=true",
      dataType: "json",
      data: JSON.stringify(data),
      contentType: "application/json",
      headers: {
        "x-ka-fkey": fkey
      },
      xhrFields: {
        withCredentials: true
      },
    });

    request.done(function(data) {
      callback(data);
    });

    request.fail(function(error) {
      console.log(error);
    });
  }

}