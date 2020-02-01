$(document).ready(function() {
  setInitialUI();
  
  $('#enter-email-button').click(() => {
    showLoader()
    chrome.runtime.sendMessage({ 
      action: 'com.duo.verifyEmail', 
      payload: {
        email: $('#enter-email-text-field').val()
      }
    }, data => {
      console.log(data)
      hideLoader()

      if (data.error)
        return flashError(data.error)

      // Otherwise we got a user back; check if they're an admin
      console.log(`Got user: ${JSON.stringify(data)}`)
      chrome.storage.sync.set({currentLoginData: data})
      if (data.is_admin || data.signed_up)
        showEnterPassword(data)
      else
        showSignUp(data)
    })
  })

  $('#sign-up-button').click(() => {
    getLoginData().then(loginData => {
      if (!loginData || !loginData.email) {
        showEnterEmail(() => flashError('Someting went wrong. Please try again.'))
        return
      }
  
      if (!loginData.name) 
        return flashError('There is no name associated with your account. Please contact your administrator.')
      
      const password = $('#sign-up-password-input').val()
      if (!password) 
        return flashError('You must enter a password.')
  
      const confirmPassword = $('#sign-up-password-confirm-input').val()
      if (password !== confirmPassword) 
        return flashError('Passwords must match.')
  
      showLoader()
      chrome.runtime.sendMessage({
        action: 'com.duo.signUp',
        payload: {
          email: loginData.email,
          name: loginData.name,
          password
        }
      }, data => {
        hideLoader()

        if (data.error)
          flashError(data.error)
        else {
          showEnterEmail(() => flashSuccess('Successfully signed up. Please log in.'))
        }
      })
    })
  })

  $('#enter-password-button').click(() => {
    showLoader()
    getLoginData().then(loginData => {
      if (!loginData || !loginData.email) {
        showEnterEmail(() => flashError('Something went wrong. Please try again.'))
        return
      }

      const password = $('#login-password-input').val()
      chrome.runtime.sendMessage({
        action: 'com.duo.login',
        payload: {
          email: loginData.email,
          password,
        }
      }, data => {
        hideLoader()

        if (data.error)
          flashError(data.error)
        else
          loginData.is_admin ? showAdminHome() : showHome()
      })
    })
  })

});

/** Utitlies */
const fetchCurrentUser = () => {
  return new Promise(res => {
    chrome.runtime.sendMessage({action: 'com.duo.fetchCurrentUser'}, res)
  })
}

const getLoginData = () => {
  return new Promise(res => [
    chrome.storage.sync.get(['currentLoginData'], ({ currentLoginData }) =>
      res(currentLoginData)
    )
  ])
}

const logout = () => chrome.runtime.sendMessage({action: 'com.duo.logout'})

/** UI ELEMENTS */
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

const setInitialUI = async () => {
  hideAllPages()
  const user = await fetchCurrentUser()
  if (user) {
    const loginData = await getLoginData()
    loginData.is_admin ? showAdminHome() : showHome()
  } else {
    showEnterEmail()
  }
}

/** SHOWING PAGES */
const showHome = () => {
  showPage('home', {
    action: {
      icon: 'exit_to_app',
      onClick: () => {
        logout()
        showEnterEmail()
      }
    }
  })
}

const showAdminHome = () => {
  showPage('admin-home', {
    action: {
      icon: 'exit_to_app',
      onClick: () => {
        logout()
        showEnterEmail()
      }
    }
  })

  fetchCurrentUser().then(user => $('#admin-home .subtitle').text(user.email))
}

const showEnterEmail = (cb) => {
  chrome.storage.sync.get(['currentLoginData'], ({ currentLoginData: data }) => {
    showPage('enter-email', null, null, () => {
      if (data != null)
        $('#enter-email-text-field').val(data.email)
      
      if (cb) cb()
    })
  })
}

const showSignUp = loginData => {
  showPage(
    'sign-up',
    {subtitle: `Welcome, ${getFirstName(loginData.name)}! Please create a password.`},
    showEnterEmail
  )
}

const showEnterPassword = loginData => {
  showPage(
    'enter-password', 
    {subtitle: `Welcome, ${loginData.is_admin ? 'Admin' : getFirstName(loginData.name)}! Please enter your password.`}, 
    showEnterEmail
  )
}

/**
 * Can create a right-side bar button item by passing the 'action' key in as data.
 * Its value should be an object formatted like so:
 * 
 * {
 *  icon: string
 *  onClick: () => {}
 * }
 * 
 * @param {String} page 
 * @param {Object} data Takes keys: subtitle, action
 * @param {Function} backButtonListener 
 * @param {Function} onLoad 
 */
const showPage = (page, data, backButtonListener, onLoad) => {
  // Handle data
  const actionButton = $('#title-action-button')
  actionButton.hide()
  if (data) {
    if (data.subtitle)
      $(`#${page} .subtitle`).text(data.subtitle)

    console.log(data.action)
    if (data.action) {
      actionButton.show()
      actionButton.off().click(data.action.onClick)
      actionButton.text(data.action.icon)
    }
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
  $('#admin-home').hide()

  // Also hide the error flash
  $('#flash').hide()
}