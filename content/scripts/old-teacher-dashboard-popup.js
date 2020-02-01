$(document).ready(() => {
  updatePopup()
})

const getPopup = () => $('#duo-teacher-dashboard-scraper-popup')

/**
 * Shows/hides the popup based on current state
 */
function updatePopup() {
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
  const popup = getPopup()
  if (popup) popup.remove()
}

function showPopup() {
  if (popup) return // Popup already visible
  $.get(chrome.runtime.getURL('content/html/teacher-dashboard-popup.html'), data => {
    popup = $(data)
    popup.appendTo('body')
  })
}