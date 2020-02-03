/**
 * @fileoverview For managing completions
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  if (request.action === 'com.duo.uploadTeacherDashboardCompletions') {
    const { completions } = request.payload
    api.post(`/ka-skill-completion/create-multiple-by-student-name`, completions)
      .then(sendResponse)
      .catch(sendErrorResponse(sendResponse))

    return true
  }

})