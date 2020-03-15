/**
 * @fileoverview This will display a "get help" button on the unit and lesson views,
 * as the student is working on a problem.
 */
var getHelpButtonVisible = false

$(document).ready(() => {

  const observer = new MutationObserver(mutations => {
    if (!isOnKAPage(`math/.*`)) return
    if (!_showGetHelpButtonIfApplicable()) return
  })

  const observerConfig = {
    childList: true,
    subtree: true,
  }

  observer.observe(document.body, observerConfig)
})

function _showGetHelpButtonIfApplicable() {
  if (isUnitView()) {
    const title = $('h1[data-test-id="modal-title"]')
    if (!title || title.text() === '') return _hideGetHelpButton()
    _showOrInjectGetHelpButton(title.parent())
  } else {
    // Lesson view
    const page = $('div[data-test-id="tutorial-page"]')
    if (page.length === 0) return _hideGetHelpButton()
    const title = page.find('h1').first()
    if (!title || title.text() === '') return _hideGetHelpButton()

    const titleContainer = title.parent()
    _showOrInjectGetHelpButton(titleContainer)
  }
}

function _showOrInjectGetHelpButton(container) {
  if (!_isGetHelpButtonInjected())
    _injectGetHelpButton(container)
  else
    _showGetHelpButton()
}

function _injectGetHelpButton(container) {
  console.log('Injecting get help button')
  getHelpButtonInjected = true
  getHelpButtonVisible = true
  $.get(chrome.runtime.getURL('content/html/get-help-button.html'), data => {
    if (_isGetHelpButtonInjected()) return
    $(data).appendTo(container)

    $('#duo-get-help-btn').off().click(() => {
      const skill = scrapeTaskSkill()
      sendMessage('com.duo.findE4NMatches', { skill }, data => {
        if (data.error) return console.warn(data.error)
        showStrugglingPopup(data.matches, true, data.is_online)
      })
    })
  })
}

function _showGetHelpButton() {
  if (getHelpButtonVisible) return
  show($('#duo-get-help-btn'))
}

function _hideGetHelpButton() {
  if (!getHelpButtonVisible) return
  hide($('#duo-get-help-btn'))
}

function _isGetHelpButtonInjected() {
  return $('#duo-get-help-btn').length > 0
}