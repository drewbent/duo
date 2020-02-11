/** 
 * @fileoverview Provides methods for showing and interacting with the "session
 * overlay"
 */
var sessionOverlayVisible = false
var sessionOverlayInjected = false

var currentGuide = undefined
var currentSession = undefined

function showSessionOverlay(guide, session) {
    if (!guide || !session) {
        console.log('Invalid guide/session passed to session overlay:')
        console.log(JSON.stringify(guide))
        console.log(JSON.stringify(session))
        return
    }

    currentGuide = guide
    currentSession = session

    if (!sessionOverlayInjected) {
        _injectSessionOverlay()
    } else {
        if (!sessionOverlayVisible) _showSessionOverlay()
    }
}

/**
 * PRIVATE METHODS
 * ===============
 */
function _injectSessionOverlay() {
    console.log('Injecting session overlay')
    $.get(chrome.runtime.getURL('content/html/session-overlay.html'), data => {
        $(data).appendTo('body')
        sessionOverlayInjected = true
        _startSessionTimer()

        const overlay = $('#duo-so-container')

        const cancelButton = overlay.find('#duo-so-cancel-btn')
        const reasonSelect = overlay.find('#cancellation-reason-select')

        cancelButton.click(() => {
            // Cancel the session
            const reason = reasonSelect.val()
            sendMessage('com.duo.cancelTutoringSession', { sessionId: currentSession.id, reason }, data => {
                if (data.error)
                    return flashError(overlay, data.error)

                _hideSessionOverlay()  
            })
        })

        overlay.find(reasonSelect).change(() => {
            const val = reasonSelect.val()
            if (val === '__nothing')
                cancelButton.addClass('disabled')
            else
                cancelButton.removeClass('disabled')
        })

        const finishButton = $('#duo-so-finish-btn')
        finishButton.click(() => {
            sendMessage('com.duo.finishTutoringSession', { sessionId: currentSession.id }, data => {
                if (data.error)
                    return flashError(overlay, data.error)

                _hideSessionOverlay()
            })
        })
    })
}

var _interval = undefined;
function _startSessionTimer() {
    if (_interval)
        clearInterval(_interval)
    
    const el = $('#duo-so-timer-text')
    const baseText = `Session with ${currentGuide.name}: `
    let seconds = 0

    function updateText() {
        const mm = Math.floor(seconds / 60)
        const ss = (seconds % 60).toString().padStart(2, '0')
        el.text(`${baseText}${mm}:${ss}`)
    }

    updateText()
    _interval = setInterval(() => {
        seconds += 1
        updateText()
    }, 1000)
}

function _showSessionOverlay() {
    sessionOverlayVisible = true
    _startSessionTimer()

    const reasonSelect = $('#cancellation-reason-select')
    reasonSelect.val('__nothing')

    show($('#duo-so-container'))
}

function _hideSessionOverlay() {
    hide($('#duo-so-container'))
    sessionOverlayVisible = false
}

