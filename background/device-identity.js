/**
 * When the extension starts, set the device ID if it has not already been set
 */
getDeviceId(id => {
  console.log(`Device ID: ${id}`)
  if (id == null) _resetDeviceId()
})

function getDeviceId(cb) {
  chrome.storage.local.get(['deviceId'], ({ deviceId }) => cb(deviceId))
}

function _resetDeviceId() {
  console.log('Setting device ID')
  chrome.storage.local.set({deviceId: _generateDeviceId()})
}

/**
 * Just generates a random token
 */
function _generateDeviceId() {
  const rand = () => Math.random().toString(36).substr(2)
  return rand() + rand()
}