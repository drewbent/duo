/**
 * @fileoverview Provides methods for showing and interacting with the 
 * "struggling popup"
 */
var strugglingPopupInjected = false
var strugglingPopupVisible = false
var currentGuides = []
var _isGetHelp = false

/**
 * Display the struggling popup
 * 
 * @param {Object[]} guides A list of guides
 * @param {Boolean} isGetHelp Whether or not this was triggered from the 'get help'
 * button. Will affect behavior
 */
function showStrugglingPopup(guides, isGetHelp = false) {
    _isGetHelp = isGetHelp
    if (!strugglingPopupInjected) {
        _injectStrugglingPopup(() => _injectGuides(guides))
    } else {
        if (!strugglingPopupVisible) _showStrugglingPopup()
        _injectGuides(guides)
    }
}

/**
 * PRIVATE METHODS
 * ===============
 */
function _injectStrugglingPopup(cb) {
    $.get(chrome.runtime.getURL('content/html/struggling-popup.html'), data => {
        $(data).appendTo('body')

        const popup = $('#duo-sp-container')

        $('#duo-sp-cancel-btn').click(() => {
            _hideStrugglingPopup()
        })

        $('#duo-sp-done-btn').click(() => {
            const guideId = $('#duo-sp-guide-select').children('option:selected').val()
            const guide = currentGuides.find(g => g.id === parseInt(guideId, 10))
            if (guide == null)
                return flashError(popup, 'Something went wrong.')

            const skill = scrapeTaskSkill()
            sendMessage('com.duo.beginTutoringSession', { 
                guideId, 
                skill, 
                manuallyRequested: _isGetHelp 
            }, data => {
                if (data.error)
                    return flashError(popup, data.error)

                _hideStrugglingPopup()
                // Data contains the session
                showSessionOverlay(guide, data)
            })
        })

        strugglingPopupInjected = true
        if (cb) cb()
    })
}

function _injectGuides(guides) {
    const popup = $(`#duo-sp-container`)
    const noGuidesContent = popup.find('#duo-sp-no-guides-content')
    const yesGuidesContent = popup.find('#duo-sp-find-guide-content')
    const subtitle = popup.find('.duo-popup-subtitle')
    hideFlash(popup)

    const list = popup.find('select')
    list.empty()

    currentGuides = guides

    if (guides.length === 0) {
        subtitle.text('Looks like you\'re having trouble! Please find a classmate to help you, or go to Phil and Drew to find help.')
        hide(yesGuidesContent)
        show(noGuidesContent)
    } else {
        subtitle.text('Looks like you\'re having trouble! Please find one of these students to guide you, then select their name below.')
        list.html(guides.map(guide => `
            <option class='text-normal-size' value=${guide.id}>${guide.name}</li>
        `))

        const nameInput = $('#duo-sp-name-input')
        nameInput.val('')

        if (_isGetHelp) show(noGuidesContent)
        else hide(noGuidesContent)
        show(yesGuidesContent)
    }
}

function _hideStrugglingPopup() {
    hide($('#duo-sp-container'))
    strugglingPopupVisible = false
}

function _showStrugglingPopup() {
    show($('#duo-sp-container'))
    strugglingPopupVisible = true
}

function _containsIncorrectAlert(html) {
    return html.find('[data-test-id="exercise-feedback-popover-skip-link"]').length > 0
}

function _containsCorrectAlert(html) {
    const query = 'img[src="https://cdn.kastatic.org/images/exercise-correct.svg"]'
    return html.find(query).length > 0
}