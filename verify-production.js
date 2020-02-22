/**
 * @fileoverview A (currently super simple) script we can run to make sure everything is in
 * order for production.
 */
const api = require('./utils/api')

if (api.API_URL !== 'https://duo-learn.herokuapp.com/') {
  console.log('FAILED: API should be pointing to production, not ' + api.API_URL)
} else {
  console.log('Success! Build is ready for production.')
}