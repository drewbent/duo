// POPUP

// Ensure that it's only called once
let tabUpdated = false
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status == 'complete' && tab.status == 'complete' && tab.url != undefined) {
    const regex = RegExp('.*\:\/\/.*khanacademy\.org/coach/class/.+/progress/unit-mastery/subject/.+/unit/.+')
    if (regex.test(changeInfo.url || tab.url)) {
      chrome.tabs.insertCSS(tabId, { file: 'content/styles/content.css' })
      executeScript(tabId, 'content/scripts/show-teacher-dashboard-popup.js')
    } else {
      executeScript(tabId, 'content/scripts/hide-teacher-dashboard-popup.js')
    }

    tabUpdated = true
  }
});