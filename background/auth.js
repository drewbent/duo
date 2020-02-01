/**
 * @fileoverview For managing auth
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'com.duo.verifyEmail') {
    const { email } = request.payload
    api.get(`/students?email=${email}`)
      .then(sendResponse)
      .catch(err => sendResponse({error: err.message}))
    return true
  }

  if (request.action === 'com.duo.signUp') {
    // Expects keys 'email', 'name', and 'password'
    api.post('/users/sign-up', request.payload)
      .then(data => sendResponse(data))
      .catch(err => sendResponse({error: err.message}))
    return true
  }

  if (request.action === 'com.duo.login') {
    const { email, password } = request.payload
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(({ user }) => {
        updateTeacherDashboardPopup()
        sendResponse(user)
      })
      .catch(err => sendResponse({error: err.message}))
    return true
  }

  if (request.action === 'com.duo.logout') {
    firebase.auth().signOut()
      .then(() => {
        updateTeacherDashboardPopup()
        sendResponse()
      })
      .catch(err => sendResponse({error: err.message}))
    return true
  }

  if (request.action === 'com.duo.fetchCurrentUser') {
    getCurrentUser().then(sendResponse)
    return true
  }
})

const fetchAllCurrentUserData = async() => {
  const values = await Promise.all([
    getCurrentUser(),
    getCurrentLoginData()
  ])
  return { user: values[0], loginData: values[1] }
}

const getCurrentUser = async() => (
  new Promise(res => firebase.auth().onAuthStateChanged(res))
)

const getCurrentLoginData = async() => (
  new Promise(res => chrome.storage.sync.get(['currentLoginData'], ({ currentLoginData }) => {
    res(currentLoginData)
  }))
)