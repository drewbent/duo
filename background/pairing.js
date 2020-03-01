chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'com.duo.findE4NMatches') {
        const { skill } = request.payload
        fetchAllCurrentUserData().then(({ user, loginData }) => {
            if (!user || !loginData || loginData.id == null)
                return sendResponse({ error: 'User not signed in. '})

            if (loginData.is_admin)
                return sendResponse({ error: 'User is an admin.' })

            api.get(`/students/${loginData.id}/find-matches/e4n?skill=${skill.toLowerCase()}`)
                .then(sendResponse)
                .catch(sendErrorResponse(sendResponse))
        })
        return true
    }
})