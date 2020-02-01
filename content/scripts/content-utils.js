const fetchCurrentUser = () => {
  return new Promise(res => {
    chrome.runtime.sendMessage({action: 'com.duo.fetchCurrentUser'}, res)
  })
}