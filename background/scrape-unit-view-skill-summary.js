let runnableAt = null
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  const now = new Date()
  if (
    changeInfo.status == 'complete' && 
    tab.status == 'complete' && 
    tab.url != undefined &&
    (!runnableAt || now > runnableAt)
  ) {
    // Run the script max every x seconds/minutes
    const runDelay = 5
    if (!runnableAt) runnableAt = new Date()
    runnableAt.setSeconds(now.getSeconds() + runDelay)

    // Matches URL?
    const regex = RegExp('.*\:\/\/.*khanacademy\.org/.+/.+/.+((?!/).)*$')
    if (regex.test(tab.url))
      executeScript(tabId, 'content/scripts/scrape-unit-view-skill-summary.js')
  }
});