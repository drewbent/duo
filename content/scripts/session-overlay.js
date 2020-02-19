/** 
 * @fileoverview Provides methods for showing and interacting with the "session
 * overlay"
 */
var sessionOverlayVisible = false
var sessionOverlayInjected = false

// var currentGuide = undefined
var currentGuide = { name: 'Bob', id: '10' }
// var currentSession = undefined
var currentSession = { id: 1 }

// Temp
console.log('Running')
showSessionOverlay({ name: 'Bob', id: '10' }, { id: 1 })
setTimeout(() => {
    console.log('Fetching form')
    sendMessage('com.duo.fetchForm', {}, data => {
        if (data.error)
            return flashError(content, data.error)

        console.log(data)
        // _injectFormQuestions(data)
        // _showSessionForm()
    })
}, 300)

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
        _showSessionContent()

        const overlay = $('#duo-so-container')
        const content = $('#duo-so-content')

        const cancelButton = overlay.find('#duo-so-cancel-btn')
        const reasonSelect = overlay.find('#cancellation-reason-select')

        cancelButton.click(() => {
            // Cancel the session
            const reason = reasonSelect.val()
            sendMessage('com.duo.cancelTutoringSession', { sessionId: currentSession.id, reason }, data => {
                if (data.error)
                    return flashError(content, data.error)

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
                    return flashError(content, data.error)
                
                sendMessage('com.duo.fetchForm', {}, data => {
                    if (data.error)
                        return flashError(content, data.error)

                    _injectFormQuestions(data)
                    _showSessionForm()
                })
            })
        })
    })
}

var _interval = undefined;
function _startSessionTimer() {
    if (_interval)
        clearInterval(_interval)
    
    const el = $('#duo-so-timer-text')
    const baseText = `Session for '${currentSession.skill}' with ${currentGuide.name}: `
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
    _showSessionContent()
}

function _hideSessionOverlay() {
    hide($('#duo-so-container'))
    sessionOverlayVisible = false
}

function _showSessionContent() {
    const content = $('#duo-so-content')
    const form = $('#duo-so-form')
    hide(form)
    show(content)
}

function _showSessionForm() {
    const content = $('#duo-so-content')
    const form = $('#duo-so-form')
    hide(content)
    show(form)
}

function _injectFormQuestions(questions) {
    const container = $('#duo-so-form')
    const form = $('#duo-so-form-body')
    form.empty()
    let html = ''
    const questionTexts = questions.map(q => q.question)
    let valFns = []
    questions.forEach((question, index) => {
        let text = `<strong>${question.question}:</strong><br/>`
        const id = `duo-form-${index}`
        switch (question.type) {
            case 'text':
                text += `
                    <input id='${id}' type='text' class='duo-form-field' name='${question.question}' value='...'><br/>
                `
                valFns.push(() => $(`input[id='${id}']`).val())
                break
            case 'options':
                text += `
                    <select id=${id}>
                    <option value='__nothing' disabled selected value> –– select an option –– </option>
                `
                question.options.forEach(option => {
                    text += `<option value='${option.value}'>${option.text}<br/>`
                })
                text += '</select><br/>'
                valFns.push(() => $(`select[id='${id}']`).val())
                break
        }

        html += text + '<br/>'
    })
    html += `<button id='duo-so-form-submit'>Submit</button>`
    form.html(html)

    $('#duo-so-form-submit').off().click(() => {
        const answers = valFns.map(f => f())
        if (answers.length !== questionTexts.length)
            return flashError(container, 'Something went wrong.')
            
        for (answer of answers) {
            if (!answer || answer == null)
                return flashError(container, 'Please answer every question.')
        }
        
        hideFlash(container)
        let responses = {}
        for (let i = 0; i < questionTexts.length; i++) {
            responses[questionTexts[i]] = answers[i]
        }

        sendMessage('com.duo.uploadLearnerForm', { sessionId: currentSession.id, questions: responses }, data => {
            if (data.error)
                return flashError(container, data.error)

            _hideSessionOverlay()       
        })
    })
}
