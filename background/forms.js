/**
 * @fileoverview For managing learner form responses
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'com.duo.fetchForm') {
        fetchAllCurrentUserData(({ loginData }) => {
            const classId = loginData.class_section_id
            const date = new Date()
            const dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
            api.get(`/forms/current?class_id=${classId}&date=${dateString}`)
                .then(sendResponse)
                .catch(sendErrorResponse(sendResponse))
        })
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