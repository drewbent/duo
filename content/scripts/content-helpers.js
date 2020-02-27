/**
 * Sets the subtitle of a jquery element.
 * 
 * @param {JQuery Element} container
 * @param {String} subtitle 
 */
function setSubtitle(container, subtitle) {
  container.find('.duo-popup-subtitle').text(subtitle)
}

function isHidden(element) {
  return element.css('display') === 'none'
}

function hide(element) {
  element.css('display', 'none')
}

function show(element) {
  element.css('display', 'block')
}

function sendMessage(action, payload, cb) {
  console.log('Sending message with action ' + action)
  chrome.runtime.sendMessage({ action, payload }, cb)
}

function isOnKAPage(path) {
  const regex = RegExp(`.*\:\/\/.*khanacademy\.org/${path || '.*'}`)
  return regex.test(window.location.href)
}