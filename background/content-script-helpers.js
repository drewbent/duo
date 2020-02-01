/**
 * @fileoverview Helpers for executing content scripts from background scripts.
 * 
 * TODO: Make sure some scripts aren't loaded on the same tab multiple times?
 */


/**
 * Loads content script dependencies for this tab (if needed), then executes the
 * provided content script.
 * 
 * @param {Integer} tabId The tab to execute the script/dependencies in
 * @param {String} file The name of the script to execute
 */
function executeScript(tabId, file, cb) {
  _loadDependencies(tabId, () => _executeScript(tabId, file, true, cb))
}

// PRIVATE
const _dependencies = [
  'thirdParty/jquery-3.3.1.min.js',
  'content/scripts/flash-helpers.js',
  'content/scripts/content-helpers.js',
]

// Loads scripts that content scripts depend on
function _loadDependencies(tabId, cb) {
  _executeMultipleScripts(tabId, _dependencies, () => {
    console.log(`Tab ${tabId}: Loaded content script dependencies`)
    cb()
  })
}

function _executeMultipleScripts(tabId, files, cb) {
  const createCallback = (file, innerCallback) => () => {
    _executeScript(tabId, file, false, innerCallback)
  }

  let callback = null;

  for (let i = files.length - 1; i >= 0; --i)
      callback = createCallback(files[i], callback || cb);

  if (callback !== null)
      callback(); // Execute outermost function
}

function _executeScript(tabId, file, log, cb) {
  chrome.tabs.executeScript(tabId, { file, runAt: 'document_end' }, () => {
    if (log)
      console.log(`Tab ${tabId}: Executed script ${file}`)
    cb && cb()
  })
}