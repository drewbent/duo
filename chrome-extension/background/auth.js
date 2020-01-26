/**
 * @fileoverview Listen for auth events sent from the popup, and act on them.
 */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action == 'com.duo.verifyEmail') {
    const { email } = request.payload
    console.log(email)
    return sendResponse(`We got the email: ${email}`)
  }

  if (request.action == 'com.duo.login') {
    const { email, password } = request.payload
    console.log(email)
    console.log(password)
  }
})