/**
 * @fileoverview Detects discrepencies between the Duo and KA user.
 */

var signInOverlayInjected = false
var signInOverlayVisible = false

_isSignedIn(signedIn => {
  if (!signedIn) _injectSignInOverlay()
})

function _injectSignInOverlay() {
  console.log('Injecting sign in overlay')
  signInOverlayInjected = true
  signInOverlayVisible = true
  $.get(chrome.runtime.getURL('content/html/sign-in-to-duo-overlay.html'), data => {
    $(data).appendTo('body')
    const container = $('#duo-sitd-container')

    $('#duo-sitd-cancel-btn').click(() => {
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

/**
 * @param {Function} cb A callback that passes a bool indicating whether or not the
 * user is signed in
 */
function _isSignedIn(cb) {
  sendMessage('com.duo.fetchCurrentUser', {}, user => cb(user != null))
}

/**
 * Scrapes the name of the current KA user, if possible
**/
function _scrapeCurrentUserName() {

}