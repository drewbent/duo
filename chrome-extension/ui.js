/* A class for introducing new UI into the KA website. */
class UI {

  /**
   * Add info about a peer guide for a struggling student after compleeting
   * a task. 
   * @param duoHelpData the object returned by the API with details on the
   *   peer guide
   */
  static addHelpOfferToEndOfTask(duoHelpData) {
    const guideId = duoHelpData["guide_id"];
    const guideName = duoHelpData["guide_name"];
    const guideUsername = duoHelpData["guide_username"];

    const logoURL = chrome.runtime.getURL("images/icon128.png");

    const templateURL = chrome.runtime.getURL(
      "templates/end-of-task-help.handlebars");
    
    $.get(templateURL, function(uncompiledTemplate) {
      // Load the Handlebars template.
      const template = Handlebars.compile(uncompiledTemplate);
      const helpHTML = template({
        guideName: guideName,
        logoURL: logoURL
      });

      // Add the HTML to the DOM (to replace the old HTML).
      $("[data-test-id='exercise-task-card-do-n']")
        .hide()
        .html(helpHTML)
        .fadeIn();
    });
  }

  /**
   * Add the Duo logo to the course page in the top left corner.
   * (e.g. on https://www.khanacademy.org/math/algebra)
   */
  static addDuoLogoToCoursePage() {
    const logoURL = chrome.runtime.getURL("images/icon128.png");
    const templateURL = chrome.runtime.getURL(
      "templates/icon-course-page.handlebars");

    $.get(templateURL, function(uncompiledTemplate) {
      // Load the Handlebars template.
      const template = Handlebars.compile(uncompiledTemplate);
      const logoHTML = template({ logoURL: logoURL });

      // Add the new logo HTML to the DOM.
      const subjectProgressSidebar = $(
        "nav[data-test-id='subject-progress-sidebar']");
      subjectProgressSidebar.find("h4").parent().append(logoHTML);
    });
  }
}