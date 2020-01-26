const API_URL = 'http://localhost:5000'

function sendReq(path, data) {
  return fetch(`${API_URL}/${path}`, data)
}

const api = {
  get: path => sendReq(path),
  post: (path, body) => sendReq(path, {
    method: 'POST',
    body: JSON.stringify(body)
  })
}