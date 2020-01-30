/**
 * @fileoverview Listen for auth events sent from the popup, and act on them.
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action == 'com.duo.verifyEmail') {
    const { email } = request.payload
    api.get(`/students?email=${email}`)
      .then(data => sendResponse(data))
      .catch(err => sendResponse({error: err.message}))
    return true
  }

  if (request.action == 'com.duo.signUp') {
    // Expects keys 'email', 'name', and 'password'
    api.post('/users/sign-up', request.payload)
      .then(data => sendResponse(data))
      .catch(err => sendResponse({error: err.message}))
    return true
  }

  if (request.action == 'com.duo.login') {
    const { email, password } = request.payload
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(({ user }) => sendResponse(user))
      .catch(err => sendResponse({error: err.message}))
    return true
  }

  if (request.action == 'com.duo.logout') {
    firebase.auth().signOut()
      .then(() => sendResponse())
      .catch(err => sendResponse({error: err.message}))
    return true
  }

  if (request.action == 'com.duo.fetchCurrentUser') {
    firebase.auth().onAuthStateChanged(user => {
      sendResponse(user)
    })
    return true
  }
})