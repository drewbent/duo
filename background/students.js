/**
 * @fileoverview Helpers for managing student data
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  if (request.action === 'com.duo.fetchStudentsInClass') {
    const { classId } = request.payload
    if (!classId) return sendResponse({error: 'Must provide a class ID'})

    api.get(`/classes/${classId}/students`)
      .then(sendResponse)
      .catch(err => { console.log(err); sendErrorResponse(sendResponse) })

    return true
  }

})