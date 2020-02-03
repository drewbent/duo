/**
 * @fileoverview For managing auth
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'com.duo.verifyEmail') {
    const { email } = request.payload
    api.get(`/students?email=${email}`)
      .then(sendResponse)
      .catch(sendErrorResponse(sendResponse))
    return true
  }

  if (request.action === 'com.duo.signUp') {
    // Expects keys 'email', 'name', and 'password'
    const { id, email, password } = request.payload
    api.post(`/students/${id}/sign-up`, { email, password })
      .then(sendResponse)
      .catch(sendErrorResponse(sendResponse))
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
      .catch(sendErrorResponse(sendResponse))
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
    getDuoUserData()
  ])
  return { user: values[0], loginData: values[1] }
}

const getCurrentUser = async() => (
  new Promise(res => firebase.auth().onAuthStateChanged(res))
)

const getDuoUserData = async() => (
  new Promise(res => chrome.storage.sync.get(['duoUserData'], ({ duoUserData }) => {
    res(duoUserData)
  }))
)