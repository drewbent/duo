const _dependencies = [
  'thirdParty/jquery-3.3.1.min.js',
  'content/scripts/content-utils.js',
]

/** Mapping of tabId => boolean; check if content script dependencies loaded */
const _depsLoadedForTab = {}

/**
 * 
 * @param {String} fname The name of the script to execute
 * @param {String[]} dependencies A list of scripts to run before the target script; 
 * if nothing is passed, this will use a default list of scripts.
 */
function executeScript(tabId, file) {
  _loadDependencies(tabId, () => _executeScript(tabId, file))
}

// Loads scripts that content scripts depend on
function _loadDependencies(tabId, cb) {
  if (!_depsLoadedForTab[tabId]) {
    _depsLoadedForTab[tabId] = true
    _executeMultipleScripts(tabId, _dependencies, cb)
  } else {
    cb()
  }
}

function _executeMultipleScripts(tabId, scripts, cb) {
  const createCallback = (script, innerCallback) => () => {
    _executeScript(tabId, script, innerCallback)
  }

  let callback = null;

  for (let i = scripts.length - 1; i >= 0; --i)
      callback = createCallback(scripts[i], callback || cb);

  if (callback !== null)
      callback(); // Execute outermost function
}

function _executeScript(tabId, script, cb) {
  console.log(`Executing script ${script} in tab ${tabId}`)
  chrome.tabs.executeScript(tabId, {file: script}, cb)
}