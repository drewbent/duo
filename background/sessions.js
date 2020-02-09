/**
 * @fileoverview For managing tutoring sessions
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'com.duo.beginTutoringSession') {
        const { guideId, learnerId } = request.payload
        api.post(`/tutoring-sessions`, { guide_id: guideId, learner_id: learnerId })
            .then(sendResponse)
            .catch(sendErrorResponse(sendResponse))
        return true
    }
})