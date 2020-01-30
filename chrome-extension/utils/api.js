const API_URL = 'http://localhost:5000'

function sendReq(path, data) {
  console.log(`Sending ${data && data.method ? data.method : 'GET'} ${API_URL}${path}`)
  return new Promise((res, rej) => {
    fetch(`${API_URL}${path}`, data)
      .then(response => {
        if (response.ok)
          return response.json()
        else
          throw new Error(response.statusText)
      })
      .then(json => res(json))
      .catch(err => rej(err))
  })
}

const api = {
  get: path => sendReq(path),
  post: (path, body) => sendReq(path, {
    method: 'POST',
    body: JSON.stringify(body)
  })
}