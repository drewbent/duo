/**
 * @fileoverview This is global & always running on KA websites. It will detect unit
 * view task completions.
 */

const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        if (mutation.addedNodes.length == 0) return

        const html = $(mutation.addedNodes[0].outerHTML)
        if (!_containsSkillCompletion(html)) return

        // We don't care if these fail
        try {
            const data = {
                ..._scrapeQuestionData(html),
                course: _scrapeCourse(),
                unit: _scrapeUnit(),
                skill: _scrapeSkill(),
                recorded_from: 'unit_view',
            }
            
            sendMessage('com.duo.uploadSkillCompletion', { data }, response => {
                if (response.error) console.log(response.error)
                else console.log('Successfully uploaded skill completion.')
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

/**
 * PRIVATE METHODS
 * ===============
 */
function _containsSkillCompletion(html) {
    return html.find('span[aria-label*="correct"]').length > 0
}

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
 * @param {JQuery Element} html The JQuery element of the html to scrape within
 * @returns A string containing the course name. If none is found returns null.
 */
function _scrapeCourse() {
    // Don't need this, so ignoring for now. I found the attr selector from dom-parser
    // '[aria-label='breadcrumbs'] a' would get the unit name instead of the course name.
    return null
}

/**
 * @param {JQuery Element} html The JQuery element of the html to scrape within
 * @returns A string containing the unit name. If none is found returns null.
 */
function _scrapeUnit() {
    return $("[data-test-id='unit-block-title']").text();
}

/**
 * @param {JQuery Element} html The JQuery element of the html to scrape within
 * @returns A string containing the skill name. If none is found, throws an error.
 */
function _scrapeSkill() {
    const text = $('[data-test-id="modal-title"]').text()
    if (text) return text
    else throw new Error('Failed to find skill name.')
}