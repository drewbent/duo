chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'com.duo.test') {
    api.get('/users')
      .then(data => sendResponse(data))
      .catch(err => { console.log(err); sendResponse({ error: err.message }) })
    return true
  }
})