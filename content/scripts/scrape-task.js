/**
 * @fileoverview This is global & always running on KA websites. It will detect unit
 * view task completions.
 */
console.log('DUO TASK SCRAPING ACTIVE')

 $(document).ready(() => {
    const observer = new MutationObserver(mutations => {
        /** 
         * Low effort way of making sure this is always running; just do the 
         * page matching here.
         */
        const algebraRegex = RegExp('.*\:\/\/.*khanacademy\.org/math/algebra/.*')
        if (!algebraRegex.test(window.location.href))
            return

        mutations.forEach(mutation => {
            if (mutation.addedNodes.length == 0) return
    
            const html = $(mutation.addedNodes[0].outerHTML)
            if (!containsSkillCompletion(html)) return

            try {
                const data = {
                    ..._scrapeQuestionData(html),
                    course: _scrapeTaskCourse(isUnitView),
                    unit: _scrapeTaskUnit(isUnitView),
                    skill: scrapeTaskSkill(isUnitView),
                    recorded_from: isUnitView() ? 'unit_view_task' : 'lesson_view_task',
                }
                
                sendMessage('com.duo.uploadSkillCompletion', { data }, response => {
                    if (response.error) console.log(response.error)
                    else console.log('Successfully uploaded skill completion.')

                    // If the student is struggling, guides will be sent bak
                    if (response.guides) {
                        showStrugglingPopup(response.guides)
                    }
                })
            }
            catch(err) {
                console.log('Failed to scrape question data: ' + err.message)
            }
        })
    })
    
    const observerConfig = {
        childList: true,
        subtree: true,
    }
    
    observer.observe(document.body, observerConfig)
 })

 /**
  * PUBLIC METHODS
  * ==============
  */
function isUnitView() {
    const url = window.location.href
    return url.endsWith('?modal=1')
}
 
/**
 * @param {Boolean} isUnitView Whether or not we're scraping from the unit view
 * @returns A string containing the skill name. If none is found, throws an error.
 */
function scrapeTaskSkill() {
    if (isUnitView()) {
        const text = $('[data-test-id="modal-title"]').text()
        if (text && text.length !== 0) return text
        else throw new Error('Failed to find skill name.')
    } else {
        // It's in the first h1
        const header = $('h1').first()
        return header.text()
    }
}

function containsSkillCompletion(html) {
    return html.find('span[aria-label*="correct"]').length > 0
}

/**
 * PRIVATE METHODS
 * ===============
 */

/**
 * 
 * @param {JQuery Element} html The JQuery element of the html to scrape within
 * @returns An object with keys { questions_correct, questions_out_of }. If this fails
 * to scrape the data from the provided html, it will throw an error.
 */
function _scrapeQuestionData(html) {
    const correctLabel = html.find('span[aria-label*="correct"]')
    if (correctLabel.length == 0) 
        throw new Error('Failed to find question info component.')

    const text = correctLabel.text() // Formatted "{correct}/{total} correct"
    const textComponents = text.split(' ')
    if (textComponents.length != 2) 
        throw new Error('Failed to split text using format "{correct}/{total} correct".')

    const questionComponents = textComponents[0].split('/')
    if (questionComponents.length != 2)
        throw new Error('Failed to split question data using format "{correct}/{total}"')

    const questions_correct = parseInt(questionComponents[0], 10)
    const questions_out_of = parseInt(questionComponents[1], 10)
    if (isNaN(questions_correct) || isNaN(questions_out_of))
        throw new Error('Failed to parse question components ' + JSON.stringify(questionComponents))

    return {
        questions_correct,
        questions_out_of,
    }
}

/**
 * @returns A string containing the course name. If none is found returns null.
 */
function _scrapeTaskCourse() {
    if (isUnitView()) {
        // Don't need this, so ignoring for now. I found the attr selector from dom-parser
        // '[aria-label='breadcrumbs'] a' would get the unit name instead of the course name.
        return null
    } else {
        const json = _scrapeLdInfo()
        if (!json || json.length < 2) return null
        return json[1].item.name
    }
}

/**
 * @returns A string containing the unit name. If none is found returns null.
 */
function _scrapeTaskUnit() {
    if (isUnitView()) {
        return $("[data-test-id='unit-block-title']").text()
    } else {
        const json = _scrapeLdInfo()
        if (!json || json.length < 3) return null
        return json[2].item.name
    }
}

/**
 * For the lesson view, this extracts the "ld" information which contains lesson info.
 * Returns a list of objects.
 */
function _scrapeLdInfo() {
    const text = $('script[type="application/ld+json"]').text()
    const json = JSON.parse(text)
    if (!json) return null
    return json.itemListElement
}