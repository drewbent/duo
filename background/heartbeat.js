/**
 * @fileoverview Sends a heartbeat to the backend if the student is currently on
 * a KA tab.
 */

setInterval(() => {
  chrome.tabs.query({active: true}, tabs => {
    if (tabs.length === 0) return
    const url = tabs[0].url
    const regex = RegExp(`.*\:\/\/.*khanacademy\.org/.*`)
    if (!regex.test(url)) return

    console.log('Sending heartbeat?')
  })
}, 5000)