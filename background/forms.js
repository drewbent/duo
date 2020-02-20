/**
 * @fileoverview For managing learner form responses
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'com.duo.fetchForm') {
        fetchAllCurrentUserData().then(({ loginData }) => {
            const classId = loginData.class_section_id
            const date = new Date()
            const dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
            api.get(`/forms/current?class_id=${classId}&date=${dateString}`)
                .then(sendResponse)
                .catch(sendErrorResponse(sendResponse))
        })
        return true
    }

    if (request.action === 'com.duo.uploadFeedback') {
        const { sessionId, distributionId, responses } = request.payload

        fetchAllCurrentUserData().then(({ loginData }) => {
            const studentId = loginData.id
            const data = {
                session_id: sessionId,
                student_id: studentId,
                distribution_id: distributionId,
                responses,
            }
            console.log(data)
            api.post('/form-responses/feedback', data)
                .then(sendResponse)
                .catch(sendErrorResponse(sendResponse))
        })

        return true
    }
})