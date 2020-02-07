var strugglingPopupInjected = false
var strugglingPopupVisible = false

/**
 * @fileoverview This will observe DOM changes and check if the student is struggling.
 * It works in both the lesson view and the unit view.
 */
$(document).ready(() => {
    let incorrectStreak = 0
    const struggleThreshold = 2

    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length === 0) return
    
            const html = $(mutation.addedNodes[0].outerHTML)

            // Correct
            if (_containsCorrectAlert(html)) {
                console.log('Correct')
                incorrectStreak = 0
                return
            }

            if (!_containsIncorrectAlert(html)) return

            // Incorrect
            console.log('Incorrect')
            incorrectStreak += 1
            if (incorrectStreak < struggleThreshold) return

            // Student is struggling
            console.log('Student is struggling')

            const skill = scrapeTaskSkill()
            if (skill == null)
                return console.log('Failed to scrape skill info :(')
            
            sendMessage('com.duo.findGuides', { skill }, data => {
                if (data.error)
                return console.log(data.error)

                incorrectStreak = 0
                const guideNames = data.map(g => g.name)
                if (!strugglingPopupInjected) {
                    _injectStrugglingPopup(() => _injectGuides(guideNames))
                } else {
                    if (!strugglingPopupVisible)
                        _showStrugglingPopup()

                    _injectGuides(guideNames)
                }
            })
        })
    })
    
    const observerConfig = {
        childList: true,
        subtree: true
    }
    
    observer.observe(document.body, observerConfig)
})

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

        strugglingPopupInjected = true
        if (cb) cb()
    })
}

function _injectGuides(guideNames) {
    const popup = $(`#duo-sp-container`)
    const noGuidesContent = popup.find('#duo-sp-no-guides-content')
    const yesGuidesContent = popup.find('#duo-sp-find-guide-content')
    const subtitle = popup.find('.duo-popup-subtitle')
    hideFlash(popup)

    const list = popup.find('ul')
    list.empty()

    if (guideNames.length === 0) {
        subtitle.text('Looks like you\'re having trouble! Please find a classmate to help you, or go to Phil and Drew to find help.')
        hide(yesGuidesContent)
        show(noGuidesContent)
    } else {
        subtitle.text('Looks like you\'re having trouble! Please find one of these students to guide you, and then enter their name below.')
        list.html(guideNames.map(name => `
            <li class='text-center text-normal-size'>${name}</li>
        `))

        const nameInput = $('#duo-sp-name-input')
        nameInput.val('')
        $('#duo-sp-done-btn').click(() => {
            const name = $('#duo-sp-name-input').val()
            if (guideNames.includes(name)) {
                _hideStrugglingPopup()
            } else {
                flashError(popup, 'Invalid student')
            }
        })

        hide(noGuidesContent)
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