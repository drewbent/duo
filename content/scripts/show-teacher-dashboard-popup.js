$(document).ready(() => {
  const popupId = 'duo-teacher-dashboard-scraper-popup'
  // Show/hide
  if ($(`#${popupId}`).length === 0) {
    console.log('Duo: Showing teacher dashboard popup.')
    $.get(chrome.runtime.getURL('content/html/teacher-dashboard-popup.html'), data => {
      $(data).appendTo('body')
      const popup = $(`#${popupId}`)

      // Get class
      const classId = _getClassId()
      if (!classId) return

      chrome.runtime.sendMessage({action: 'com.duo.getClassByKAID', payload: {
        kaId: classId
      }}, data => {
        if (data.error) {
          if (data.status === 404) 
            setSubtitle(popup, `No class found for id ${classId}`)
          else
            flashError(popup, data.error)

          return
        }
        
        setSubtitle(popup, `Class recognized: ${data.name}`)     
        return
      })
    })
  } else {
    return
  }
})

// PRIVATE METHODS
/**
 * Fetches the class ID from the url
 */
function _getClassId() {
  const pathComponents = location.pathname.split('/')
  for (let i = 0; i < pathComponents.length; i++)
    if (pathComponents[i] === 'class' && i + 1 < pathComponents.length)
      return pathComponents[i + 1]
  
  return null
}