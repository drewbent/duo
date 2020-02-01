if ($('#duo-teacher-dashboard-scraper-popup').length === 0) {
  console.log('Showing the popup.')
  $.get(chrome.runtime.getURL('content/html/teacher-dashboard-popup.html'), data => {
    $(data).appendTo('body')
  })
}