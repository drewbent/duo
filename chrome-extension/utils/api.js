const API_URL = 'http://localhost:5000'

function sendReq(path, data) {
  return new Promise((res, rej) => {
    fetch(`${API_URL}/${path}`, data)
      .then(response => response.json())
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