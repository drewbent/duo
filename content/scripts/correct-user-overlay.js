/**
 * @fileoverview Detects discrepencies between the Duo and KA user.
 */

var signInOverlayInjected = false
var signInOverlayVisible = false

if (isOnKAPage()) {
  sendMessage('com.duo.shouldShowSignInPrompt', {}, show => {
    if (show) _injectSignInOverlay()
  })
}

function _injectSignInOverlay() {
  console.log('Injecting sign in overlay')
  signInOverlayInjected = true
  signInOverlayVisible = true
  $.get(chrome.runtime.getURL('content/html/sign-in-to-duo-overlay.html'), data => {
    $(data).appendTo('body')
    const container = $('#duo-sitd-container')

    $('#duo-sitd-cancel-btn').click(() => {
      sendMessage('com.duo.setIsInPeerX', { isInPeerX: false })
      _hideSignInOverlay()
    })

    $('#duo-sitd-signed-in-btn').click(() => {
      _isSignedIn(signedIn => {
        if (signedIn)
          _hideSignInOverlay()
        else
          flashError(container, 'Not signed in')
      })
    })
  })
}

function _hideSignInOverlay() {
  hide($('#duo-sitd-container'))
  signInOverlayVisible = true
}

function _showSignInOverlay() {
  show($('#duo-sitd-container'))
  signInOverlayVisible = false
}

function _isSignedIn(cb) {
  sendMessage('com.duo.fetchCurrentUser', {}, user => cb(user != null))
}

/**
 * Scrapes the name of the current KA user, if possible
**/
function _scrapeCurrentUserName() {

}