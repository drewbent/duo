var _requestPendingPollingInterval = null
var _requestPendingPopupInjected = false
var _requestPendingPopupVisible = false
var _requestPendingCurrentGuide = null
var _requestPendingCurrentSession = null

function showRequestPendingPopup(session, guide) {
  _requestPendingCurrentSession = session
  _requestPendingCurrentGuide = guide
  if (_requestPendingPopupInjected) {
    _showRequestPendingPopup()
  } else {
    _injectRequestPendingPopup()
  }
}

function _showRequestPendingPopup() {
  if (_requestPendingPopupVisible) return
  _requestPendingPopupVisible = true
  const popup = $('#duo-rp-container')
  _startSessionPolling()
  show(popup)
}

function _injectRequestPendingPopup() {
  _requestPendingPopupInjected = true
  _requestPendingPopupVisible = true
  $.get(chrome.runtime.getURL('content/html/request-pending-popup.html'), data => {
    $(data).appendTo('body')
    const popup = $('#duo-rp-container')
    _startSessionPolling()

    $('#duo-rp-cancel-btn').click(() => {
      const session = _requestPendingCurrentSession
      if (session == null) return flashError(popup)
      sendMessage('com.duo.cancelTutoringSession', { 
        sessionId: session.id,
        reason: 'learner_stopped_waiting'
      }, data => {
        if (data.error) return flashError()
        else _hideRequestPendingPopup()
      })
    })
  })
}

function _hideRequestPendingPopup() {
  if (!_requestPendingPopupVisible) return
  _requestPendingPopupVisible = false
  const popup = $('#duo-rp-container')
  hide(popup)
  _stopSessionPolling()
}

function _startSessionPolling() {
  _fetchCurrentSession()
  _requestPendingPollingInterval = setInterval(() => {
    _fetchCurrentSession()
  }, 3000)
}

function _stopSessionPolling() {
  clearInterval(_requestPendingPollingInterval)
  _requestPendingPollingInterval = null
}

function _fetchCurrentSession() {
  if (_requestPendingCurrentSession == null) return console.log('No session to fetch')

  sendMessage('com.duo.getTutoringSession', { 
    sessionId: _requestPendingCurrentSession.id 
  }, data => {
    if (data.error) return console.warn(data.error)
    _requestPendingCurrentSession = data
    const guide = _requestPendingCurrentGuide || {name: 'guide'}
    
    const popup = $('#duo-rp-container')
    setSubtitle(popup, `Waiting for ${guide.name}'s response...`)

    switch (data.request_status) {
      case 'not_applicable':
      case 'accepted':
        _hideRequestPendingPopup()
        showSessionOverlay(guide, data)
        console.log('Session accepted')
        break
      case 'rejected':
        _hideRequestPendingPopup()
        alert(`${guide.name} has rejected your request: ${data.rejection_note}`)
        break
      case 'cancelled':
        _hideRequestPendingPopup()
        break
    }
  })
}