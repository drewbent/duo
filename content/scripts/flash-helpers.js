/**
 * @param {JQuery Element} container 
 * @param {String} message 
 */
function flashSuccess(container, message) {
  showFlash(container, message, '#4caf50')
}

/**
 * @param {JQuery Element} container 
 * @param {String} message 
 */
function flashError(container, message) {
  showFlash(container, message, '#f44336')
}

function showFlash(container, message, color) {
  const flash = container.find('.duo-flash')
  // console.log(flash)
  if (flash.length === 0) return

  console.log('Flashing')
  if (color)
    flash.css('background-color', color)

  flash.text(message)
  show(flash)
}

function hideFlash(container) {
  const flash = container.find('.duo-flash')
  if (flash.length === 0) return
  hide(flash)
}

function hide(element) {
  element.css('display', 'none')
}

function show(element) {
  element.css('display', 'block')
}