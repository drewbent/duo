const API_URL = 'http://localhost:5000'

function sendReq(path, data) {
  return new Promise((res, rej) => {
    firebase.auth().onAuthStateChanged(user => {
      if (user == null) 
        sendAuthReq(path, data, null).then(res).catch(rej)
      else {
        user.getIdToken()
          .then(token => {
            sendAuthReq(path, data, token).then(res).catch(rej)
          })
          .catch(rej)
      }
    })
  })
}

function sendAuthReq(path, data, idToken) {
  const reqDesc = `${data && data.method ? data.method : 'GET'} ${API_URL}${path}`
  console.log(`Sending ${reqDesc}`)
  let reqData = data || {}
  reqData.headers = {'Content-Type': 'application/json'}
  if (idToken)
    reqData.headers.Authorization = `Bearer ${idToken}`

  return new Promise((res, rej) => {
    fetch(`${API_URL}${path}`, reqData)
      .then(response => {
        if (response.ok) {
          console.log(`${reqDesc} SUCCESS`)
          return response.json()
        } else {
          console.log(`${reqDesc} FAILED: ${response.statusText}`)
          throw new Error(response.statusText)
        }
      })
      .then(res)
      .catch(rej)
  })
}

const api = {
  get: path => sendReq(path),
  post: (path, body) => sendReq(path, {
    method: 'POST',
    body: JSON.stringify(body)
  })
}