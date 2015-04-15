// RetroDuck namespace.
var retroduck = retroduck || {};

/**
 * Utils module
 * @module that contains shared utilities for RetroDuck site.
 *
 */
retroduck.utils = {

   // Remember if mobile view has been used.
   mobileUsed: false,

   // Map a color to each order status.
   orderStatusMap: {
    'quote': 'rgba(184, 184, 184, 1.0)',
    'open': 'rgba(130, 153, 200, 1.0)',
    'approved': 'rgba(102, 192, 141, 1.0)',
    'ordered': 'rgba(195, 202, 87, 1.0)',
    'received': 'rgba(226, 177, 101, 1.0)',
    'printing': 'rgba(239, 116, 116, 1.0)',
    'completed': 'rgba(54, 179, 202, 1.0)',
    'delivered': 'rgbq(160, 115, 239, 1.0)',
    'archived': 'rgba(0, 0, 0, 0.8)'
  },

   // Order in which sizes should be displayed.
   orderSizeList: ['1T', '2T', '3T', '4T', '5T', '6T', 'YXS', 'YS', 'YM', 'YL',
   'YXL', 'YXXL', 'XXXS', 'XXS', 'XS', 'S', 'M', 'L', 'XL', '1X',
   '2X', '2XL', 'XXL', '3X', '3XL', 'XXXL', '4X', '4XL', 'XXXXL',
   '5X', 'XXXXXL', '5XL', '6X', '6XL', 'XXXXXXL', '7X', '7XL',
   'XXXXXXXL', '8X', '8XL', 'XXXXXXXXL'],

   // States that need to be charged sales tax.
   TAXABLE_STATES: {
     'MI': 0.06,
     'Michigan': 0.06,
     'MICHIGAN': 0.06
   },

   /** Launch a popup. **/
   launchPopup: function(classOfPopup) {

     $(document.body).attr('class', 'modal-open');

     // Launch the elements.
     $('.whiteOut')
       .show()
       .click(function() {
         $('.whiteOut').hide();
         $('.' + classOfPopup).remove();
         $(document.body).attr('class', '');
       });

     // Remove any items with this class.
     $('.' + classOfPopup).remove();

     // Append the div.
     $(document.body).append($('<div>')
       .attr('class', classOfPopup)
       .attr('name', 'rdModalPopup'));
   },

   /** Launch a popup with which a customer can sign in. **/
   launchCustomerSigninForm: function(signUp) {
     retroduck.utils.launchPopup('customerSigninForm');

     // Append user signin form.
     $('.customerSigninForm')

       .append($('<input>')
         .attr('type', 'text')
         .attr('id', 'first_name')
         .attr('placeholder', 'first name'))
       .append($('<input>')
         .attr('type', 'text')
         .attr('id', 'last_name')
         .attr('placeholder', 'last name'))
        .append($('<input>')
          .attr('type', 'text')
          .attr('id', 'user_name')
          .attr('placeholder', 'email address'))

        .append($('<input>')
          .attr('type', 'password')
          .attr('id', 'user_pass')
          .attr('class', 'userPass')
          .attr('placeholder', 'password'))
        .append($('<input>')
          .attr('type', 'password')
          .attr('class', 'repeatPass')
          .attr('id', 'user_pass_2')
          .attr('placeholder', 'retype password'));

      // Append holder for button and label.
      $('.customerSigninForm')
         .append($('<div>')
            .attr('class', 'customerSigninFormButtons'))

      // Set up buttons within customer signin form.
      retroduck.utils.setCustomerSigninButtons(signUp);
   },

   /** Set buttons within customer login/signup div **/
   setCustomerSigninButtons: function(signUp) {

     $('.userPass').show();

     // Hide repeated password used for new user signup.
     if (!signUp) {
       $('.repeatPass').hide();
       $('#first_name').hide();
       $('#last_name').hide();
       $('.customerSigninFormButtons')
         .html('')
         .append($('<button>')
           .attr('class', 'customerSignInButton')
           .html('sign in')
           .click(function() {
             retroduck.utils.signCustomerIn();
           }))
         .append($('<label>')
           .html('need to create a new account?')
           .click(function() {
             retroduck.utils.setCustomerSigninButtons(true);
           }))
         .append($('<label>')
           .html('forgot password?')
           .click(function() {
             retroduck.utils.setUserResetPasswordButtons(true);
           }));
     } else {

       $('.repeatPass').show();
       $('#first_name').show();
       $('#last_name').show();
       $('.customerSigninFormButtons')
         .html('')
         .append($('<button>')
           .html('create account')
           .click(function() {
             retroduck.utils.signCustomerUp();
           }))
         .append($('<label>')
           .html('already a user?  sign in.')
           .click(function() {
             retroduck.utils.setCustomerSigninButtons();
           }))
         .append($('<label>')
           .html('forgot password?')
           .click(function() {
             retroduck.utils.setUserResetPasswordButtons(true);
           }));
     }
   },

   /** Allow user to reset their password. **/
   setUserResetPasswordButtons: function() {
     $('.repeatPass').hide();
     $('.userPass').hide();
     $('.customerSigninFormButtons')
       .html('')
       .append($('<button>')
         .html('reset password')
         .click(function() {
           retroduck.utils.resetPassword();
         }))
       .append($('<label>')
         .html('sign in')
         .click(function() {
           retroduck.utils.setCustomerSigninButtons();
         }))
       .append($('<label>')
         .html('need to create a new account?')
         .click(function() {
           retroduck.utils.setCustomerSigninButtons(true);
         }));
   },

   /** Sign customer in using Parse **/
   signCustomerIn: function() {

     // Get form values.
     var email = $('#user_name').val();
     var pass = $('#user_pass').val();
     var msg;

     if (!email && !pass) {

       // error message and exit
       msg = retroduck.msg.INCOMPLETE_FORM;
       retroduck.utils.errorMessage(msg);
       return;
     }

     // Validate password.
     if (!pass || pass == '') {

       // error message and exit
       msg = retroduck.msg.NO_PASSWORD;
       retroduck.utils.errorMessage(msg);
       return;
     }

     // Validate email address.
     var domain = email.split('@')[1];
     if (domain) {
       var domainExt = domain.split('.')[1];
       if (domainExt) {

         // email is valid
         retroduck.utils.validateUserAccount(email, pass);
       } else {

         // error message and exit
         msg = retroduck.msg.BAD_EMAIL_ADDRESS;
         retroduck.utils.errorMessage(msg);
         return;
       }
     } else {

       // error message and exit
       msg = retroduck.msg.BAD_EMAIL_ADDRESS;
       retroduck.utils.errorMessage(msg);
       return;
     }
   },

   /** Sign customer up for site using Parse **/
   signCustomerUp: function() {

     // Get form values.
     var email = $('#user_name').val();
     var pass = $('#user_pass').val();
     var secondPassword = $('#user_pass_2').val();
     var firstName = $('#first_name').val();
     var lastName = $('#last_name').val();

     if (!firstName || !lastName) {
       msg = retroduck.msg.BAD_CUST_NAME;
       retroduck.utils.errorMessage(msg);
       return;
     }

     if (pass != secondPassword) {

       // error message and exit
       msg = retroduck.msg.PASSWORDS_DONT_MATCH;
       retroduck.utils.errorMessage(msg);
       return;
     }

     if (!email || !pass || !secondPassword) {

       // error message and exit
       msg = retroduck.msg.INCOMPLETE_FORM;
       retroduck.utils.errorMessage(msg);
       return;
     }

     // Validate email address.
     var domain = email.split('@')[1];
     if (domain) {
       var domainExt = domain.split('.')[1];
       if (domainExt) {

         // email is valid
         retroduck.utils.createNewUserAccount(email, pass, firstName, lastName);
       } else {

         // error message and exit
         msg = retroduck.msg.BAD_EMAIL_ADDRESS;
         retroduck.utils.errorMessage(msg);
         return;
       }
     } else {

       // error message and exit
       msg = retroduck.msg.BAD_EMAIL_ADDRESS;
       retroduck.utils.errorMessage(msg);
       return;
     }
   },

   /** Validate a user using email and password **/
   validateUserAccount: function(email, pass) {
     Parse.User.logIn(email, pass, {
      success: function(user) {

        // Do stuff after successful login.
        retroduck.utils.checkForUser();
        $('.whiteOut').click();
      },
      error: function(user, error) {

        // The login failed. Check error to see why.
        var errorMessage = 'Invalid email or password.  Corrent the form ' +
            'values, or sign up for a new account.';
        retroduck.utils.errorMessage(errorMessage);
      }
    });
   },

   /** Create a new user **/
   createNewUserAccount: function(email, pass, fName, lName) {
      var msg;

      // Set user and params.
      var user = new Parse.User();
      user.set('username', email);
      user.set('password', pass);
      user.set('email', email)
      user.set('role', 'customer');

      user.signUp(null, {
        success: function(user) {

          var NewDuckburgUser = Parse.Object.extend('dbCustomer');
          var newDbUser = new NewDuckburgUser();

          newDbUser.set('email_address', email);
          newDbUser.set('first_name', fName);
          newDbUser.set('last_name', lName);
          newDbUser.set('user_id', user.id);

          newDbUser.save(null, {
            success: function(newDbUser) {

              // Created user, they're logged in.
              msg = retroduck.msg.NEW_USER_CREATED;
              retroduck.utils.successMessage(msg);
              $('.whiteOut').click();
              retroduck.utils.checkForUser();
            }
          });
        },
        error: function(user, error) {

          // Show the error message somewhere and let the user try again.
          retroduck.utils.errorMessage(error.message);
        }
      });
   },

   resetPassword: function() {

     // Get form values.
     var email = $('#user_name').val();
     var msg;

     // Validate email address.
     var domain = email.split('@')[1];
     if (domain) {
       var domainExt = domain.split('.')[1];
       if (domainExt) {

         // email is valid
         Parse.User.requestPasswordReset(email, {
            success: function() {

              // Password reset request was sent successfully
              msg = retroduck.msg.PASSWORD_RESET_SUCCESSFUL;
              retroduck.utils.successMessage(msg);
              $('.whiteOut').click();
            },
            error: function(error) {

              // Password reset request failed.
              msg = retroduck.msg.PASSWORD_RESET_FAILURE;
              retroduck.utils.errorMessage(msg);
            }
          });

       } else {

         // error message and exit
         msg = retroduck.msg.BAD_EMAIL_ADDRESS;
         retroduck.utils.errorMessage(msg);
         return;
       }
     } else {

       // error message and exit
       msg = retroduck.msg.BAD_EMAIL_ADDRESS;
       retroduck.utils.errorMessage(msg);
       return;
     }
   },

   /** Success message **/
   successMessage: function(msg) {
     retroduck.utils.messageHandler('successMessage', msg)
   },

   /** Error message **/
   errorMessage: function(msg) {
     retroduck.utils.messageHandler('errorMessage', msg)
   },

   /** Message handler **/
   messageHandler: function(className, msg) {

     if (retroduck.utils.messageTimer) {
       window.clearInterval(retroduck.utils.messageTimer);
     }

     // Set message div class (success, error, etc).
     $('#messageDiv')
        .attr('class', className)
        .html(msg);

     // Hide message div after a brief interval.
     retroduck.utils.messageTimer = setTimeout(function() {
       $('#messageDiv').attr('class', 'hidden');
     }, 3500)
   },

   /** Return array of cookies. **/
   getCookies: function() {
     var cookie = String(document.cookie);
     return cookie.split(';');
   },

   /** Check if cookies have a property. **/
   cookieHasProp: function(propToMatch) {
     var cookie = String(document.cookie);
     var cookies = cookie.split(';');
     var cookieObj = {};
     for (var i = 0; i < cookies.length; i++) {
       var prop = cookies[i].split('=')[0];
       prop = prop.replace(/ /g, '');
       if (prop == propToMatch) {
         return true;
       }
     }
     return false;
   },

   /** Get a cookie's value. **/
   getOneCookie: function(propToMatch) {
     var cookie = String(document.cookie);
     var cookies = cookie.split(';');
     var cookieObj = {};
     for (var i = 0; i < cookies.length; i++) {
       var prop = cookies[i].split('=')[0];
       prop = prop.replace(/ /g, '');
       if (prop == propToMatch) {
         if (cookies[i].split('=')[1]) {
           var val = cookies[i].split('=')[1];
           return val;
         }
       }
     }
     return false;
   },

   /** Set a cookie value. **/
   setCookie: function(prop, value) {
     var date = new Date();
     date.setMonth(date.getMonth() + 12);

     var newCookie = String(prop) + '=' + String(value) +
        '; expires='+  date.toGMTString() +'; path=/';

     document.cookie = newCookie;
   },

   /** Check if a user is present **/
   checkForUser: function() {

     // Define user
     retroduck.currentUser = Parse.User.current();

     // Condition if a customer is found.
     if (retroduck.currentUser) {

       // Add logout button to menu
       if (!$('.menuMyOrdersLink').length || $('.menuMyOrdersLink').length == 0) {
         $('.menuLinksHolder')
            .append($('<a>')
              .attr('class', 'menuMyOrdersLink')
              .attr('href', 'javascript:void(0)')
              .html('My Orders')
              .click(function() {
                window.location = '/my_orders';
              }));
       }

       // Add logout button to menu
       if (!$('.menuLogoutLink').length || $('.menuLogoutLink').length == 0) {
         $('.menuLinksHolder')
            .append($('<a>')
              .attr('class', 'menuLogoutLink')
              .attr('href', 'javascript:void(0)')
              .html('Logout')
              .click(function() {
                retroduck.utils.logUserOut();
              }));
       }

       // Get the customer attributes.
       var attribs = retroduck.currentUser.attributes;
       var name = attribs.username;

       // Set username in icon.
       $('.userMenuIcon--name').html(name);

       // TODO some special logic for employees?

       // Hide sign in button and set up user icon.
       $('.userSignInIcon').hide();
       $('.userMenuIcon').show();

       // If currently viewing cart, hide sign in button here as well.
       if (window.location.pathname == '/cart') {

         // Fill in address with current user.
         retroduck.cart.fillInCurrentCustomerAddress();

         // Update the customer div to show the current customer.
         $('.customerFormDiv')
           .html('')
           .append($('<span>')
             .attr('class', 'cartLoggedInCustomerInfo')
             .html('logged in as: ')
             .append($('<em>')
               .html(name)))
             .append($('<label>')
               .attr('class', 'logoutLinkWithinCart')
               .html('logout')
               .click(function() {
                 retroduck.utils.logUserOut();
               }));
       }
     } else {
       $('.userMenuIcon').hide();
       $('.menuLogoutLink').remove();
       $('.menuMyOrdersLink').remove();
       $('.userSignInIcon')
         .show()
         .click(function() {
           retroduck.utils.launchCustomerSigninForm();
         });

         // If currently viewing cart, show sign in button here.
         if (window.location.pathname == '/cart') {

           // Clear the address form.
           retroduck.cart.clearAddressForm();

           // Set user div for easy login/signup.
           $('.customerFormDiv')
             .html('')
             .append($('<button>')
               .html('Sign in')
               .click(function() {
                 retroduck.utils.launchCustomerSigninForm();
               }))
             .append($('<label>')
               .html('new user / first time')
               .click(function() {
                 retroduck.utils.launchCustomerSigninForm(true);
               }));
         }
     }

     // Load user's orders.
     if (window.location.pathname == '/my_orders') {
       retroduck.myOrders.getCurrentUserOrders();
     }
   },

   /**
    * Hide any modal dialogs.
    * @function that looks for any modals and removes them from the dom.
    *
    */
   hideAllModals: function() {
     $('[name="rdModalPopup"]').each(function(i, element) {
       element.remove();
     });
   },

   /**
    * Listener for a window resize.
    * @function that removes unwanted elements when the user resizes window.
    *
    */
   windowResizer: function() {
     var browserWidth = window.innerWidth;
     if (browserWidth > 568) {
       if (retroduck.utils.mobileUsed) {
         retroduck.menu.hide();
         $('.whiteOut').attr('class', 'whiteOut desktop');
         retroduck.utils.mobileUsed = false;
       }
     } else {
       $('.whiteOut').attr('class', 'whiteOut mobile');
       retroduck.utils.mobileUsed = true;
     }
   },

   /*
    * Listener function for scrolling.
    * @function that updates the look of the top menu based on how far the user
    *           has scrolled the page.
    *
    */
   scrollListener: function() {
     var top = $(window).scrollTop();
     if (top > 0) {
       $('.menuLogo').attr('class', 'menuLogo scrolled');
     } else {
       $('.menuLogo').attr('class', 'menuLogo');
     }
   },

   /** Log the current user out **/
   logUserOut: function() {
     retroduck.currentUser = null;
     Parse.User.logOut();
     retroduck.utils.checkForUser();
   }
};

/** Check for a user and update an page items. **/
$(document).ready(function() {
  retroduck.utils.checkForUser();
  retroduck.utils.scrollListener();
  retroduck.utils.windowResizer();
  window.onresize = retroduck.utils.windowResizer;
  $('.homePageLink').click(function() {
    window.location = '/';
  })
});

/** Listen for a scroll and update the header if neccesary **/
window.addEventListener("scroll", retroduck.utils.scrollListener);
