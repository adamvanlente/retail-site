/**
 * Key listeners module
 * @module that listens for key presses in different situations.
 *
 */

$(document.body).keyup(function(e) {

  // Isolate the key code.
  var key = e.keyCode;

  // Case for enter.
  if (key == 13) {

    // Submit customer sign in form.
    if ($('.customerSigninForm').length > 0) {
      $('.customerSignInButton').click();
    }

  }




});
