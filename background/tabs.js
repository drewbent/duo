chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'com.duo.createHangout') {
    chrome.tabs.create({ url: 'https://hangouts.google.com' })
  }
})