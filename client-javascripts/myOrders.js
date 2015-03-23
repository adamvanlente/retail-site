// RetroDuck namespace.
var retroduck = retroduck || {};

/**
 * Shopping cart module.
 * @module that contains helper functions for the shopping cart.
 *
 */
retroduck.myOrders = {

  /**
   * Get the current user's orders.
   * @function that gets the current user's orders from the server.
   *
   */
  getCurrentUserOrders: function() {
    var email = retroduck.myOrders.getCurrentUsersEmailAddress();
    if (email) {

      $('.customerOrderPage')
        .html('')
        .append($('<span>')
          .attr('class', 'myOrdersLoadingOrdersMessage')
          .html('loading orders...'));

      retroduck.myOrders.getUserOrders(email,
        function(results) {
          if (results.success && results.results) {
            $('.customerOrderPage')
              .html('');
            retroduck.myOrders.renderUserOrdersToPage(results.results, email);
          } else {
            retroduck.myOrders.showNoOrdersMessage();
          }
        });
    } else {
      retroduck.myOrders.showNoUserLoggedInMessage();
    }
  },

  /**
   * Render the user's orders on the order page.
   * @function that displays all of a user's orders.
   * @param orders Object array of user orders.
   * @param email String user's email address.
   *
   */
  renderUserOrdersToPage: function(orders, email) {
    if (orders && orders.length > 0) {
      $('.customerOrderPage').append($('<h1>')
        .attr('class', 'myOrdersPageHeader')
        .html('orders for user: ' + email));
      for (var i = 0; i < orders.length; i++) {
        var order = orders[i];
        retroduck.myOrders.renderSingleOrderToPage(order);
      }
    } else {
      retroduck.myOrders.showNoOrdersMessage();
    }
  },

  /**
   * Render an order to the page.
   * @function that takes a Parse order object and renders it on the page.
   * @param order Object parse order object
   *
   */
  renderSingleOrderToPage: function(order) {
    console.log(order);
    // Define an id for the lement.
    var elId = 'order_' + order.objectId;

    // Create a section to append to the page.
    $('.customerOrderPage').append(
      $('<section>')
        .attr('class', 'myOrderHolder')
        .attr('id', elId));

    // // Append a header element/
    $('#' + elId).append($('<h1>')
      .attr('class', 'myOrdersOrderHolderHeader')
      .html(order.order_name));

    $('#' + elId).append($('<span>')
      .attr('class', 'orderDetailsHolder')
      .attr('id', 'orderDetails_' + elId));

  },

  /**
   * Load the list of a users orders.
   * @function that takes an email address and returns all orders associated
   *           with that email.
   * @param email String email address of user.
   *
   */
   getUserOrders: function(email, callback) {

     // Check for user email.
     email = email || retroduck.myOrders.getCurrentUsersEmailAddress();

     if (email) {
       $.ajax({
         url: '/getUserOrders/' + email,
         success: function(response) {
           callback(response);
         },
         error: function(e) {
           callback();
         }
       });
     } else {
       retroduck.myOrders.showNoUserLoggedInMessage();
     }
   },

   /**
    * Get the current user email address
    *
    */
   getCurrentUsersEmailAddress: function() {
     if (retroduck.currentUser) {
       return retroduck.currentUser.attributes.email;
     } else {
       return false;
     }
   },

   /** Show message for no user logged in **/
   showNoUserLoggedInMessage: function() {
     $('.customerOrderPage')
       .html('')
       .append($('<span>')
         .attr('class', 'myOrdersNoCustomerLoggedIn')
         .html('Please log in to see your orders.')
         .click(function() {
           retroduck.utils.launchCustomerSigninForm();
         }));
   },

   showNoOrdersMessage: function() {
     $('.customerOrderPage')
       .html('')
       .append($('<span>')
         .attr('class', 'myOrdersNoOrdersFoundMessage')
         .html('I couldn\'t find an orders associated with your account.'));
   }
};
