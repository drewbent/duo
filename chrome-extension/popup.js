$(document).ready(function() {
  refreshUI();
  
$("#enter-email-button").click(() => {
  chrome.runtime.sendMessage({ 
    action: "com.duo.verifyEmail", 
    payload: {
      email: $("#enter-email-text-field").val()
    }
  }, response => {
    console.log(response)
  })
})

  $("#login #submit").click(function() {
    // const userId = $("#login input[name='username']").val();
    // console.log(userId);

    // chrome.storage.sync.set({
    //     'userId': userId,
    //     'loggedIn': true
    // }, function() {
    //   console.log('User ID is set to ' + userId);
    //   refreshUI();
    // });
    chrome.runtime.sendMessage({ action: "login", payload: {
      email: "hello.com",
      password: "goodbye",
    }})
  });

  $("#profile #signout").click(function() {
    chrome.storage.sync.set({
        'userId': null,
        'loggedIn': false
    }, function() {
      refreshUI();
    });
  });
});

const updateWelcomeUI = function(userId) {
  $("#profile #welcome").text("Welcome, " + userId)
};

const refreshUI = function() {
  chrome.storage.sync.get(['userId', 'loggedIn'], function(r) {
    $("#enter-email").show()
    $("#profile").hide()
  });
};