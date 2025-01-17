/**
 * @fileoverview For managing classes
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'com.duo.getClassByKAID') {
    const { kaId } = request.payload
    api.get(`/classes?ka_id=${kaId}`)
      .then(sendResponse)
      .catch(sendErrorResponse(sendResponse))
    return true
  }
})