$(document).ready(function() {
  setInitialUI();
  
  $('#enter-email-button').click(() => {
    chrome.runtime.sendMessage({ 
      action: 'com.duo.verifyEmail', 
      payload: {
        email: $('#enter-email-text-field').val()
      }
    }, data => {
      if (data.error)
        return flashError(data.message)

      // Otherwise we got a user back; check if they're an admin
      chrome.storage.sync.set({currentLoginData: data})
      if (data.is_admin || data.signed_up)
        showEnterPassword(data)
      else
        showSignUp()
    })
  })

  $('#sign-up-button').click(() => {
    showLoader()
    chrome.storage.sync.get(['currentLoginData'], ({ currentLoginData }) => {
      if (!currentLoginData || !currentLoginData.email) {
        showPage('enter-email')
        return flashError('Something went wrong. Please try again.')
      }
  
      const firstName = $('#first-name-input').val()
      if (!firstName) return flashError('You must enter a first name.')
  
      const lastName = $('#last-name-input').val()
      if (!lastName) return flashError('You must enter a last name.')
  
      const password = $('#sign-up-password-input').val()
      if (!password) return flashError('You must enter a password.')
  
      const confirmPassword = $('#sign-up-password-confirm-input').val()
      if (password !== confirmPassword) return flashError('Passwords must match.')
  
      chrome.runtime.sendMessage({
        action: 'com.duo.signUp',
        payload: {
          email: currentLoginData.email,
          name: `${firstName} ${lastName}`,
          password
        }
      }, data => {
        hideLoader()

        if (data.error)
          return flashError(data.message)

        // The data will return the user information

      })
    })
  })

});

const showLoader = () => {
  console.log('Showing Loader')
  show($('#loader'))
  show($('#loader-spinner'))
}

const hideLoader = () => {
  console.log('Hiding loader')
  hide($('#loader'))
  hide($('#loader-spinner'))
}

const flashError = message => {
  $('#error-flash-text').text(message)
  $('#error-flash').show()
}

const hide = element => {
  element.css('visibility', 'hidden')
}

const show = element => element.css('visibility', 'visible')

const setInitialUI = () => {
  hideAllPages()
  chrome.storage.sync.get(['currentLoginData'], ({ currentLoginData: data }) => {
    if (data == null) {
      showEnterEmail()
    } else {
      if (data.is_admin || data.signed_up) showEnterPassword(data)
      else showSignUp()
    }
  })
}

/** SHOWING PAGES */
const showEnterEmail = () => {
  showPage('enter-email')
  chrome.storage.sync.set({currentLoginData: null, currentUser: null})
}

const showSignUp = () => {
  showPage(
    'sign-up',
    undefined,
    showEnterEmail
  )
}

const showEnterPassword = loginData => {
  showPage(
    'enter-password', 
    {subtitle: `Welcome${loginData.is_admin ? ', admin' : ''}! Please enter your password.`}, 
    showEnterEmail
  )
}

const showPage = (page, data, backButtonListener) => {
  hideAllPages()
  $(`#${page}`).show()

  // Handle data
  if (data) {
    if (data.subtitle)
      $(`#${page} .subtitle`).text(data.subtitle)
  }
  
  const backButton = $('#back-button')
  if (backButtonListener) {
    backButton.show()
    backButton.off().click(backButtonListener)
  } else {
    backButton.hide()
  }
}

const hideAllPages = () => {
  $('#enter-email').hide()
  $('#sign-up').hide()
  $('#enter-password').hide()
  $('#home').hide()

  // Also hide the error flash
  $('#error-flash').hide()
}