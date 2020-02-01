console.log('FIRING')

$(document).ready(() => {
  // Inject sync popup
  chrome.runtime.onMessage.addListener(message => {
    console.log(message)
  })
})

/**
 * Reference to the popup element; 
 */
let popup = null

/**
 * Shows/hides the popup based on current state
 */
function showHidePopup() {
  console.log('Show hide popup')
  fetchCurrentUser().then(user => {
    if (user == null) return hidePopup()

    chrome.storage.sync.get(['currentLoginData'], ({ currentLoginData }) => {
      if (!currentLoginData || !currentLoginData.is_admin)
        return hidePopup()
      else
        showPopup()
    })
  })
}

function hidePopup() {
  if (popup) {
    popup.remove()
    popup = null
  }
}

function showPopup() {
  if (popup) return // Popup already visible
  $.get(chrome.runtime.getURL('content/html/teacher-dashboard-popup.html'), data => {
    popup = $(data)
    popup.appendTo('body')
  })
}