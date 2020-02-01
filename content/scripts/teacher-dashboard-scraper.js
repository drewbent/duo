$(document).ready(() => {
  // Inject the sync popup
  $.get(chrome.runtime.getURL('content/html/teacher-dashboard-popup.html'), data => {
    const popup = $(data)
    popup.appendTo('body')

    chrome.runtime.sendMessage({
      action: 'com.duo.test'
    }, data => {
      console.log(data)
    })
  })
})