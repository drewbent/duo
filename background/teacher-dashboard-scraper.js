// POPUP
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status == 'complete' && tab.status == 'complete' && tab.url != undefined)
    _updatePopup(tabId, changeInfo.url || tab.url)
});

// PUBLIC METHODS
function updateTeacherDashboardPopup() {
  chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    console.log(tabs)
    if (tabs.length === 0)
      return

    const activeTab = tabs[0]
    _updatePopup(activeTab.id, activeTab.url)
  })
}

// PRIVATE METHODS
function _updatePopup(tabId, tabUrl) {
  const regex = RegExp('.*\:\/\/.*khanacademy\.org/coach/class/.+/progress/unit-mastery/subject/.+/unit/.+')
    if (regex.test(tabUrl)) {
      // Check if logged in as admin
      fetchAllCurrentUserData().then(({ user, loginData }) => {
        if (user && loginData.is_admin)
          _showPopup(tabId)
        else
          _hidePopup(tabId)
      })
    } else {

    }
}

function _showPopup(tabId) {
  chrome.tabs.insertCSS(tabId, { file: 'content/styles/content.css' })
  executeScript(tabId, 'content/scripts/show-teacher-dashboard-popup.js')
}

function _hidePopup(tabId) {
  executeScript(tabId, 'content/scripts/hide-teacher-dashboard-popup.js')
}