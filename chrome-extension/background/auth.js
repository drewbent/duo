/**
 * @fileoverview Listen for auth events sent from the popup, and act on them.
 */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action == 'com.duo.verifyEmail') {
    const { email } = request.payload
    api.get(`/students?email=${email}`)
      .then(data => sendResponse(data))
      .catch(err => sendResponse(err))
    return true
  }

  if (request.action == 'com.duo.signUp') {
    const { email, name, password } = request.payload
    console.log(request.payload)
    setTimeout(() => sendResponse({}), 1000)
    return true
  }

  if (request.action == 'com.duo.login') {
    const { email, password } = request.payload
    console.log(email)
    console.log(password)
  }
})