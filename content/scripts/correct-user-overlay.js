/**
 * @fileoverview Detects discrepencies between the Duo and KA user.
 */

var signInOverlayInjected = false
var signInOverlayVisible = false
var accountMismatchPopupInjected = false
var accountMismatchPopupVisible = false

if (isOnKAPage()) {
  sendMessage('com.duo.shouldShowSignInPrompt', {}, show => {
    if (show) _injectSignInOverlay()
  })

  // Detect account mismatch
  const observer = new MutationObserver(mutations => {
    if (accountMismatchPopupVisible) return
    _detectCurrentUserMistmatch()
  })

  const observerConfig = {
    childList: true,
    subtree: true
  }

  observer.observe(document.body, observerConfig)
}

function showMismatchPopup(duoName, kaName) {
  if (accountMismatchPopupInjected) _showMismatchPopup(duoName, kaName)
  else _injectMismatchPopup(duoName, kaName)
}

function _detectCurrentUserMistmatch() {
  // No name found; return
  const name = _scrapeCurrentUserName()
  if (!name) return

  // Name found; compare against current user's name
  _isSignedIn(isSignedIn => {
    if (!isSignedIn) return

    // Get Duo user data
    chrome.storage.sync.get(['duoUserData'], ({ duoUserData }) => {
      if (!duoUserData) return

      if (duoUserData.name !== name)
        showMismatchPopup(duoUserData.name, name)
    })
  })
}

function _injectMismatchPopup(duoName, kaName) {
  console.log('Injecting account mismatch popup')
  accountMismatchPopupInjected = true
  accountMismatchPopupVisible = true
  $.get(chrome.runtime.getURL('content/html/account-mismatch-popup.html'), data => {
    $(data).appendTo('body')
    _setMismatchPopupSubtitle(duoName, kaName)

    $('#duo-amp-close-btn').click(() => {
      _hideMismatchPopup()
    })
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
        if (signedIn) _hideSignInOverlay()
        else flashError(container, 'Not signed in')
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

function _hideMismatchPopup() {
  hide($('#duo-amp-container'))
  accountMismatchPopupVisible = false
}

function _showMismatchPopup(duoName, kaName) {
  _setMismatchPopupSubtitle(duoName, kaName)
  show($('#duo-amp-container'))
  accountMismatchPopupVisible = true
}

function _setMismatchPopupSubtitle(duoName, kaName) {
  const container = $('#duo-amp-container')
  setSubtitle(container, `Warning: You are signed in to Duo as ${duoName}, not ${kaName}.`)
}

function _isSignedIn(cb) {
  sendMessage('com.duo.fetchCurrentUser', {}, user => cb(user != null))
}

/**
 * Scrapes the name of the current KA user, if possible
**/
function _scrapeCurrentUserName() {
  return $('span[data-test-id="header-profile-button"]')
    .children()
    .first()
    .text()
}