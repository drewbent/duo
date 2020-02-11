/**
 * @fileoverview For managing learner form responses
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'com.duo.fetchLearnerForm') {
        api.get('/session-learner-form')
            .then(sendResponse)
            .catch(sendErrorResponse(sendResponse))
        return true
    }

    if (request.action === 'com.duo.uploadLearnerForm') {
        const { sessionId, questions } = request.payload

        api.post('/session-learner-form-responses', { session_id: sessionId, questions })
            .then(sendResponse)
            .catch(sendErrorResponse(sendResponse))

        return true
    }
})