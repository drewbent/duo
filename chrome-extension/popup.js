$(document).ready(function() {
  setInitialUI();
  
  $('#enter-email-button').click(() => {
    chrome.runtime.sendMessage({ 
      action: 'com.duo.verifyEmail', 
      payload: {
        email: $('#enter-email-text-field').val()
      }
    }, data => {
      console.log(`Verify Email returned: ${JSON.stringify(data)}`)
      console.log(data)
      if (data.error)
        return flashError(data.error)

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

        console.log(data)
      })
    })
  })

});

const showLoader = () => {
  show($('#loader'))
  show($('#loader-spinner'))
}

const hideLoader = () => {
  hide($('#loader'))
  hide($('#loader-spinner'))
}

const flashError = message => {
  $('#flash').css('background-color', '#f44336')
  showFlash(message)
}

const flashSuccess = message => {
  $('#flash').css('background-color', '#4caf50')
  showFlash(message)
}

const showFlash = message => {
  $('#flash-text').text(message)
  $('#flash').show()
}

const hide = element => {
  element.css('visibility', 'hidden')
}

const show = element => element.css('visibility', 'visible')

const setInitialUI = () => {
  hideAllPages()
  chrome.storage.sync.get(['currentUser'], data => {
    if (data.currentUser == null) {
      showEnterEmail()
    } else {
      showPage('home')
    }
  })
}

/** SHOWING PAGES */
const showEnterEmail = () => {
  chrome.storage.sync.set({currentUser: null})
  chrome.storage.sync.get(['currentLoginData'], ({ currentLoginData: data }) => {
    console.log(JSON.stringify(data))
    showPage('enter-email', null, null, () => {
      if (data != null)
        $('#enter-email-text-field').val(data.email)
    })
  })
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

const showPage = (page, data, backButtonListener, onLoad) => {
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

  hideAllPages()
  $(`#${page}`).show()
  onLoad && onLoad()
}

const hideAllPages = () => {
  $('#enter-email').hide()
  $('#sign-up').hide()
  $('#enter-password').hide()
  $('#home').hide()

  // Also hide the error flash
  $('#flash').hide()
}