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

  if (request.action === 'com.duo.uploadSkillCompletion') {
    const { data } = request.payload
    fetchAllCurrentUserData().then(({ user, loginData }) => {
      if (!user || !loginData || loginData.id == null) {
        sendResponse({ error: 'User not signed in.' })
        return
      }

      if (loginData.is_admin) {
        sendResponse({ error: 'User is an admin.' })
        return
      }

      api.post(`/students/${loginData.id}/ka-skill-completions`, data)
        .then(sendResponse)
        .catch(sendErrorResponse(sendResponse))
    })

    return true
  }

})