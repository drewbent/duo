/**
 * @fileoverview Manages the presentation of the guide's current (online) session.
 * Displays the conference link.
 */
var _currentGuideOnlineSessionPopupInjected = false
var _currentGuideOnlineSessionPopupVisible = false
var _currentGuideOnlineSession = null
var _currentGuideOnlineSessionLearner = null

_checkForCurrentGuideOnlineSession()

function showCurrentGuideSession(session, learner) {
  _currentGuideOnlineSession = session
  _currentGuideOnlineSessionLearner = learner

  if (_currentGuideOnlineSessionPopupInjected) {
    _showCurrentGuideOnlineSessionPopup()
  } else {
    _injectCurrentGuideOnlineSessionPopup()
  }
}

function _injectCurrentGuideOnlineSessionPopup() {
  _currentGuideOnlineSessionPopupInjected = true
  _currentGuideOnlineSessionPopupVisible = true
  $.get(chrome.runtime.getURL('content/html/guide-current-session.html'), data => {
    $(data).appendTo('body')
    _displayCurrentSessionInfo()

    $('#duo-gcs-close-btn').click(() => {
      _hideCurrentGuideOnlineSessionPopup()
    })
  })
}

function _showCurrentGuideOnlineSessionPopup() {
  if (_currentGuideOnlineSessionPopupVisible) return
  _currentGuideOnlineSessionPopupVisible = true
  const popup = _getPopup()
  _displayCurrentSessionInfo()
  show(popup)
}

function _hideCurrentGuideOnlineSessionPopup() {
  if (!_currentGuideOnlineSessionPopupVisible) return
  _currentGuideOnlineSessionPopupVisible = false
  const popup = _getPopup()
  hide(popup)
}

function _displayCurrentSessionInfo() {
  const popup = _getPopup()
  const learner = _currentGuideOnlineSessionLearner || {}
  setSubtitle(popup, `Session with ${learner.name}`)
  const session = _currentGuideOnlineSession || {}
  $('#duo-gcs-conference-link').text(session.conference_link)
}

function _getPopup() {
  return $('#duo-gcs-container')
}

function _checkForCurrentGuideOnlineSession() {
  sendMessage('com.duo.getCurrentGuideOnlineSession', {}, data => {
    if (data == null) return _hideCurrentGuideOnlineSessionPopup()
    const { session, learner } = data
    if (session != null && learner != null) {
      _currentGuideOnlineSession = session
      _currentGuideOnlineSessionLearner = learner
      showCurrentGuideSession(session, learner)
    }
  })
}