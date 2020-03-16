/** 
 * @fileoverview Provides methods for showing and interacting with the "session
 * overlay"
 */
var sessionOverlayVisible = false
var sessionOverlayInjected = false

var currentGuide = {}
// var currentGuide = { name: 'Bob', id: '10' }
var currentSession = {}
// var currentSession = { id: 1 }

/**
 * Every time this runs (which would be every time the page reloads), (1) check to 
 * see if the URL is a KhanAcademy URL. If it is, check to see if the current user
 * has an active session. If they do, show the session overlay.
 */
if (isOnKAPage()) {
    checkForCurrentSession()
}

function checkForCurrentSession() {
    sendMessage('com.duo.getCurrentLearnerSession', {}, data => {
        if (data && data.guide && data.session) {
            console.log('This student is currently in a session.')
            if (data.session.conference_link && data.session.request_status === 'pending')
                showRequestPendingPopup(data.session, data.guide)
            else
                showSessionOverlay(data.guide, data.session)
        } else {
            console.log(data ? data.error : 'User: no current session')
        }
    })
}

/**
 * Shows the session overlay in the current tab.
 * 
 * @param {Object} guide 
 * @param {Object} session 
 */
function showSessionOverlay(guide, session) {
    if (guide == null || session == null) {
        console.log('Invalid guide/session passed to session overlay:')
        console.log(JSON.stringify(guide))
        console.log(JSON.stringify(session))
        return
    }

    currentGuide = guide
    currentSession = session
    console.log(session)

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
        
        hide($('#outer-wrapper'))

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
                
                const sessionStart = new Date(currentSession.start_time)
                sendMessage('com.duo.fetchForm', { sessionStart }, data => {
                    if (!data)
                        return _hideSessionOverlay()

                    if (data.error)
                        return flashError(content, data.error)

                    _injectForm(data)
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

    // Sessions is minutes
    let seconds = Math.floor(
        (new Date().getTime() - Date.parse(currentSession.start_time))
    / 1000)

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

    const overlay = $('#duo-so-container')
    const cancelButton = overlay.find('#duo-so-cancel-btn')
    cancelButton.addClass('disabled')

    show(overlay)
    _showSessionContent()

    hide($('#outer-wrapper'))
}

function _hideSessionOverlay() {
    hide($('#duo-so-container'))
    sessionOverlayVisible = false

    show($('#outer-wrapper'))
}

function _showSessionContent() {
    const content = $('#duo-so-content')
    const form = $('#duo-so-form')
    hide(form)
    show(content)

    // Show the conference link
    const conferenceText = $('#duo-so-conference-text')
    if (currentSession.conference_link != null) {
        conferenceText.text(currentSession.conference_link)
        show(conferenceText)
    } else {
        hide(conferenceText)
    }
}

function _showSessionForm() {
    const content = $('#duo-so-content')
    const form = $('#duo-so-form')
    hide(content)
    show(form)
}

/**
 * 
 * @param {Object} form ALL form info; an object with keys { distribution, form,
 * questions: { form_question, question }[] }
 */
function _injectForm(formData) {
    const container = $('#duo-so-form')

    // Various UI stuff
    $('#duo-so-form-title').text(formData.form.name)

    const form = $('#duo-so-form-body')
    form.empty()
    let html = ''
    let valFns = []
    formData.questions.forEach((questionData, index) => {
        const { question, form_question: formQuestion } = questionData
        let text = `<strong>${question.question}${formQuestion.required ? '*' : ''}:</strong><br/>`
        const id = `duo-form-${index}`
        switch (question.question_type) {
            case 'long_text':
                text += `
                    <textarea id='${id}' class='duo-form-field'></textarea><br/>
                `
                valFns.push(() => $(`textarea[id='${id}']`).val())
                break
            case 'short_text':
                text += `
                    <input id='${id}' type='text' class='duo-form-field' name='${question.question}'><br/>
                `
                valFns.push(() => $(`input[id='${id}']`).val())
                break
            case 'linear_scale':
                text += `
                    <select id=${id}>
                    <option value='__nothing' disabled selected value> –– select an option –– </option>
                `
                question.options.forEach(option => {
                    text += `<option value='${option.value}'>${option.text}<br/>`
                })
                text += '</select><br/>'
                valFns.push(() => parseInt($(`select[id='${id}']`).val(), 10))
                break
        }

        html += text + '<br/>'
    })
    html += `<button id='duo-so-form-submit'>Submit</button>`
    form.html(html)

    $('#duo-so-form-submit').off().click(() => {
        const responses = valFns.map(f => f())
        if (responses.length !== formData.questions.length)
            return flashError(container, 'Something went wrong.')
        
        const responseData = {}
        for (let i = 0; i < responses.length; i++) {
            const formQuestion = formData.questions[i].form_question

            if (formQuestion.required && !responses[i]) {
                return flashError(container, 'Please answer each required question.')
            }
            responseData[formQuestion.id] = responses[i]
        }

        hideFlash(container)

        sendMessage('com.duo.uploadFeedback', { 
            sessionId: currentSession.id, 
            responses: responseData,
            distributionId: formData.distribution.id,
        }, data => {
            if (data.error)
                return flashError(container, data.error)

            _hideSessionOverlay()
        })
    })
}
