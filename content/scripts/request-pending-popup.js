var _requestPendingPollingInterval = null
var _requestPendingPopupInjected = false
var _requestPendingPopupVisible = false
var _requestPendingCurrentSession = null

function showRequestPendingPopup() {
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
  }, 2000)
}

function _stopSessionPolling() {
  clearInterval(_requestPendingPollingInterval)
  _requestPendingPollingInterval = null
}

function _fetchCurrentSession() {
  sendMessage('com.duo.getCurrentLearnerSession', {}, data => {
    if (data.error) return
    const { session, guide } = data
    _requestPendingCurrentSession = session
    
    const popup = $('#duo-rp-container')
    setSubtitle(popup, `Waiting for ${guide.name}'s response...`)

    switch (session.request_status) {
      case 'not_applicable':
      case 'accepted':
        _hideRequestPendingPopup()
        _showSessionOverlay(guide, session)
        break
      case 'rejected':
        alert(`${guide.name} has rejected your request: ${session.rejection_note}`)
        break
    }
  })
}