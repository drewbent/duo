$(document).ready(function() {
  refreshUI();
  
  $("#login #submit").click(function() {
    const userId = $("#login input[name='username']").val();
    console.log(userId);

    chrome.storage.sync.set({
        'userId': userId,
        'loggedIn': true
    }, function() {
      console.log('User ID is set to ' + userId);
      refreshUI();
    });
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
    if (r.loggedIn) {
      updateWelcomeUI(r.userId);
      $("#login").hide();
      $("#profile").show();
      
    } else {
      $("#login").show();
      $("#profile").hide();
    }
  });
};