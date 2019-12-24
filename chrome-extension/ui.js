/* A class for introducing new UI into the KA website. */
class UI {

  /**
   * Adds the Duo logo to the course page in the top left corner.
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