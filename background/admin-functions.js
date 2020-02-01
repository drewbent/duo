chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'com.duo.test') {
    api.get('/users')
      .then(() => sendResponse(data))
      .catch(err => sendResponse({ error: err.message }))
    return true
  }
})