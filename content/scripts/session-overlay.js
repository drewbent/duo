/** 
 * @fileoverview Provides methods for showing and interacting with the "session
 * overlay"
 */
var sessionOverlayVisible = false
var sessionOverlayInjected = false

showSessionOverlay()

function showSessionOverlay() {
    if (!sessionOverlayInjected) {
        _injectStrugglingOverlay()
    } else {
        if (!sessionOverlayVisible) _showSessionOverlay()
    }
}

/**
 * PRIVATE METHODS
 * ===============
 */
function _injectStrugglingOverlay() {
    console.log('Injecting struggling overlay')
    $.get(chrome.runtime.getURL('content/html/session-overlay.html'), data => {
        $(data).appendTo('body')
        sessionOverlayInjected = true
    })
}

function _showSessionOverlay() {
    show($('#duo-so-container'))
    sessionOverlayVisible = true
}

function _hideSessionOverlay() {
    hide($('#duo-so-container'))
    sessionOverlayVisible = false
}

