/**
 * @fileoverview For managing tutoring sessions
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    if (request.action === 'com.duo.beginTutoringSession') {
        const { guideId, skill, manuallyRequested, conferenceLink } = request.payload
        fetchAllCurrentUserData().then(({ user, loginData }) => {
            if (user == null || loginData == null || loginData.id == null)
                return sendResponse({ error: 'Not signed in.' })

            if (loginData.id === guideId) return sendResponse({error: 'You cannot select yourself.'})
            api.post(`/tutoring-sessions`, { 
                guide_id: guideId, 
                learner_id: loginData.id,
                skill,
                manually_requested: manuallyRequested,
                conference_link: conferenceLink,
            })
                .then(sendResponse)
                .catch(sendErrorResponse(sendResponse))
        })
        return true
    }

    if (request.action === 'com.duo.finishTutoringSession') {
        const { sessionId } = request.payload
        
        api.post(`/tutoring-sessions/${sessionId}/finish`)
            .then(sendResponse)
            .catch(sendErrorResponse(sendResponse))

        return true
    }

    if (request.action === 'com.duo.cancelTutoringSession') {
        const { sessionId, reason } = request.payload
        
        api.post(`/tutoring-sessions/${sessionId}/cancel`, { cancellation_reason: reason })
            .then(sendResponse)
            .catch(sendErrorResponse(sendResponse))
        
        return true
    }

    if (request.action === 'com.duo.rejectTutoringSession') {
        const { sessionId, note } = request.payload

        api.post(`/tutoring-sessions/${sessionId}/reject`, { note })
            .then(sendResponse)
            .catch(sendErrorResponse(sendResponse))

        return true
    }

    if (request.action === 'com.duo.acceptTutoringSession') {
        const { sessionId } = request.payload

        api.post(`/tutoring-sessions/${sessionId}/acceept`)
            .then(sendResponse)
            .catch(sendErrorResponse(sendResponse))

        return true
    }

    if (request.action === 'com.duo.getCurrentLearnerSession') {
        fetchAllCurrentUserData().then(({ user, loginData }) => {
            if (user == null || loginData == null || loginData.id == null)
                return sendResponse({ error: 'Not signed in.' })

            api.get(`/students/${loginData.id}/tutoring-sessions/current-learning`)
                .then(sendResponse)
                .catch(sendErrorResponse(sendResponse))
        })

        return true
    }

    if (request.action === 'com.duo.getPendingGuideSession') {
        fetchAllCurrentUserData().then(({ user, loginData }) => {
            if (user == null || loginData == null || loginData.id == null)
                return sendResponse({ error: 'Not signed in' })

            api.get(`/students/${loginData.id}/tutoring-sessions/pending-guide`)
                .then(sendResponse)
                .catch(sendErrorResopnse(sendResponse))
        })
        return true
    }

})