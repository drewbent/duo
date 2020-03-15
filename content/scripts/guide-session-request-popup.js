/**
 * @fileoverview Polls and shows an overlay if this student is selected as a guide
 */
var _guideRequestInjected = false
var _guideRequestVisible = false
var _guideRequestCurrentLearner = null
var _guideRequestCurrentSession = null

// Start polling
_fetchPendingGuideSession()
setInterval(() => {
  _fetchPendingGuideSession()
}, 2000)

function _fetchPendingGuideSession() {
  sendMessage('com.duo.getPendingGuideSession', {}, data => {
    if (data == null) return _hideGuideRequestPopup()

    if (data.error) return
    const { learner, session } = data
    _guideRequestCurrentSession = session
    showGuideRequestPopup(() => {
      _setLearner(learner)
    })
  })
}

function showGuideRequestPopup(cb) {
  if (_guideRequestInjected) {
    _showGuideRequestPopup()
    cb()
  } else {
    _injectGuideRequestPopup(cb)
  }
}

function _injectGuideRequestPopup(cb) {
  _guideRequestInjected = true
  _guideRequestVisible = false
  $.get(chrome.runtime.getURL('content/html/guide-session-request-popup.html'), data => {
    $(data).appendTo('body')

    const popup = $('#duo-gsr-container')
    const rejectionNoteField = $('#duo-gsr-rejection-note-field')
    const rejectButton = $('#duo-gsr-reject-btn')

    rejectionNoteField.keyup(() => {
      if (rejectionNoteField.val() === '')
        rejectButton.addClass('disabled')
      else
        rejectButton.removeClass('disabled')
    })

    rejectButton.click(() => {
      sendMessage('com.duo.rejectTutoringSession', { 
        sessionId: _guideRequestCurrentSession.id,
        note: rejectionNoteField.val() 
      }, data => {
        const response = data || {}
        if (response.error)
          flashError(popup, response.error)
        else
          _hideRequestPendingPopup()
      })
    })

    $('#duo-gsr-accept-btn').click(() => {
      sendMessage('com.duo.acceptTutoringSession', {
        sessionId: _guideRequestCurrentSession.id,
      }, data => {
        if (data == null) {
          // Insert the hangout link
        } else {
          flashError(popup, data.error)
        }
      })
    })

    cb()
  })
}

function _showGuideRequestPopup() {
  if (_guideRequestVisible) return
  _guideRequestVisible = true
  const popup = $('#duo-gsr-container')
  show(popup)
}

function _hideGuideRequestPopup() {
  if (!_guideRequestVisible) return
  _guideRequestVisible = false
  const popup = $('#duo-gsr-container')
  hide(popup)
}

function _setLearner(learner) {
  const popup = $('#duo-gsr-container')
  setSubtitle(popup, `${learner.name} has requested your help!`)
}