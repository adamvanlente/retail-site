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

    // Define an id for the lement.
    var elId = 'order_' + order.objectId;

    // Create a section to append to the page.
    $('.customerOrderPage').append(
      $('<section>')
        .attr('class', 'myOrderHolder')
        .attr('id', elId));

    // Render some details for every type of order.
    retroduck.myOrders.renderOrderHeaderAndDetails(order, elId);

    // Render items based on which type of order it is.
    if (order.is_social_order) {
      retroduck.myOrders.renderSocialOrderItems(order, elId);
    }

  },

  /**
   * Render items for a social order.
   * @function that creates elements showing details about each item on a
   *           social order.
   * @param order Object parse order object.
   * @param elId String id unique to the order details div.
   *
   */
  renderSocialOrderItems: function(order, elId) {

    // Create a holder for the order item details.
    $('#' + elId).append($('<span>')
      .attr('class', 'orderItemDetails')
      .attr('id', 'orderItemDetails_' + elId));

    if (JSON.parse(order.items)) {

      // Create a heading for the list of designs.
      $('#orderItemDetails_' + elId)
        .append($('<h2>')
          .html('Designs'))

      var orderItems = JSON.parse(order.items);
      for (var i = 0; i < orderItems.length; i++) {
        var orderItem = orderItems[i];
        var id = 'orderItem_' + orderItem.id;

        // Append a holder for this item's details.
        $('#orderItemDetails_' + elId)
          .append($('<section>')
            .attr('class', 'orderSingleItemDetails')
            .attr('id', 'orderSingleItemDetails_' + id));

        // Append the item title.
        $('#orderSingleItemDetails_' + id)
          .append($('<span>')
            .attr('class', 'myOrderItemTitle')
            .html(orderItem.item_name));

        console.log(orderItem, order.is_social_order);

        var isSocial = order.is_social_order;
        if (isSocial) {
          // add a span summarzing the social sales and totals and whatnot.
        }


        // Get an array of the images.
        var imgSpan = $('<section>').attr('class', 'myOrdersImgSpan');
        var imgArray = orderItem.design_images_list.split(',');
        for (var j = 0; j < imgArray.length; j++) {
          var imgUrl = imgArray[j];
          imgSpan.append($('<img>')
            .attr('src', imgUrl));
        }
        $('#orderSingleItemDetails_' + id).append(imgSpan);

      }
    } else {
      $('#orderItemDetails_' + elId)
        .append($('<span>')
         .attr('class', 'noSocialOrderDesignsMessage')
         .html('There are no items associated with this order')
      );
    }
  },

  /**
   * Render main details for an order.
   * @function that renders the order name, number and status in the
   *           list of customer's orders.
   * @param order Object parse order object.
   * @param elId String id unique to the order details div.
   *
   */
  renderOrderHeaderAndDetails: function(order, elId) {

    // Create a holder for the order details.
    $('#' + elId).append($('<span>')
      .attr('class', 'orderDetailsHolder')
      .attr('id', 'orderDetails_' + elId));

    // Get the background color for the status.
    var orderStatusBgColor = retroduck.utils.orderStatusMap[order.order_status];

    $('#orderDetails_' + elId)

      // Append order name and a readable id.
      .append($('<section>')
        .attr('class', 'orderDetailName')
        .append($('<h2>')
          .html(order.order_name))
        .append($('<h3>')
          .html('order no. ' + order.readable_id)))

      // Append the order status an a message explaining the status.
      .append($('<section>')
        .attr('class', 'orderDetailsStatus')
        .append($('<label>')
          .css({'background': orderStatusBgColor})
          .html(order.order_status))
        .append($('<span>')
          .html(retroduck.msg.ORDER_STATUS_MESSAGES[order.order_status])));
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
         .html('I couldn\'t find any orders associated with your account.'));
   }
};
