// RetroDuck namespace.
var retroduck = retroduck || {};

/**
 * Shopping cart module.
 * @module that contains helper functions for the shopping cart.
 *
 */
retroduck.cart = {

  /*
   * Render the shopping cart page.
   * @function that renders store/cart/ route
   *
   */
  renderShoppingCartPage: function() {

    // Get the shopping cart div and clear its contents.
    var shoppingCartDiv = $('.shoppingCartPage');
    $('.shoppingCartPage').html('');

    // Get the cart.
    var cart = retroduck.utils.getOneCookie('cart');

    // Set message if no cart exists.
    if (!cart) {
      shoppingCartDiv
        .html('')
        .append($('<label>')
          .attr('class', 'emptyShoppingCartMessage')
          .html(retroduck.msg.EMPTY_CART_MESSAGE));
      return;
    }

    // Turn cart string into JSON.
    cart = JSON.parse(cart);

    // Check if there are items in the cart.
    if (cart.totalItems == 0) {
      shoppingCartDiv
        .html('')
        .append($('<label>')
          .attr('class', 'emptyShoppingCartMessage')
          .html(retroduck.msg.EMPTY_CART_MESSAGE));
      return;
    }

    // Create a sign in area for customrs.
    retroduck.cart.showCustomerDetailsForm(shoppingCartDiv);

    // Show a summary of the cart items and quantities.
    var cost = retroduck.cart.showItemSummary(cart, shoppingCartDiv);

    // Show a summary of costs.
    retroduck.cart.showCostSummary(cost, shoppingCartDiv);

    // Create and show billing options.
    retroduck.cart.showCreditCardForm(shoppingCartDiv);

    // Create a form for shipping address.
    retroduck.cart.showShippingAddressForm(shoppingCartDiv, cart);

    // Add a button that lets the user confirm their payment/shipping details.
    retroduck.cart.addConfirmCartButton(shoppingCartDiv)

    if (retroduck.cart.formObject) {
      for (var field in retroduck.cart.formObject) {

        var val = retroduck.cart.formObject[field];
        if ($('#' + field)) {
          $('#'+ field).val(val);
        }
      }
    }
  },

  /**
   * Show the summary of items currently in the cart.
   * @function that shows a summary along with checkout options
   * @param cart Object cart cookie from browser.
   * @param shoppingCartDiv Object dom element containing shopping cart div.
   * @return Float total cost in shopping cart.
   *
   */
  showItemSummary: function(cart, shoppingCartDiv) {

    // Set a header for the summary.
    shoppingCartDiv.append($('<h1>')
      .html(retroduck.msg.ORDER_SUMMARY_TITLE)
      .attr('class', 'orderSummaryTitle'))

    // Div to hold the cart items.
    var shoppingCartItemsDiv = $('<div>')
        .attr('id', 'shoppingCartItemsDiv')
        .attr('class', 'shoppingCartItemsDiv');

    // Initialize variable for total cost of items.
    var totalCost = 0.00;

    // Parse the cart JSON.
    for (var item in cart.items) {

      // Grab product and its details.
      var product = cart.items[item];
      for (var size in product.sizes) {

        if (size != 'length') {

          // Set a span element for each item.  There will be one span for each
          // size of an item, so >= 1 span for each item in cart.
          var itemSpan = $('<span>')
              .attr('class', 'itemSpan')
              .attr('id', 'itemSpan_' + item);

          // Get and set some vars for each item.
          var quantity = product.sizes[size];
          var itemTotal = parseFloat(quantity * product.price);

          // Increment total cost.
          totalCost += itemTotal;

          // Append item details to the span.
          itemSpan
            .append($('<img>')
              .attr('src', product.thumbnail))
            .append($('<label>')
              .html(product.name))
            .append($('<label>')
              .html(size))
            .append($('<label>')
              .html(quantity + ' @ $' + product.price))
            .append($('<label>')
              .html('$' + parseFloat(itemTotal).toFixed(2) + ' total'));

          // Append item detail span.
          shoppingCartItemsDiv.append(itemSpan);
        }
      }

      // Give the customer delivery options for each item.
      var deliverySpan = $('<span>')
          .attr('class', 'deliverySpan')
          .attr('id', 'deliverySpan_' + item);

      // Set delivery method var and msg var, as well as id for shipping id.
      var dm = product.deliveryMethod;
      var msg = 'please select a delivery method for ';
      var shipId;

      // Set a count word for quantity (eg 1 item/2 items).
      var countPhrase = 'This item ';
      var extraWord = 'is '
      if (product.totalItems > 1) {
        countPhrase = 'These items ';
        extraWord = 'are ';
      }

      // Set a message based on delivery type.
      if (dm == 'pickup or ship') {
        deliverySpan
            .append($('<em>')
            .html(msg + countPhrase)
              .append($('<input>')
                .attr('class', 'shippingIdentifierRadio')
                .attr('id', 'ship')
                .attr('type', 'radio')
                .attr('name', 'radio_' + item)
                .prop('checked', true)
                .click(function() {
                  retroduck.cart.updateVisibilityOfShippingForm();
                }))
              .append($('<label>')
                .html('ship'))
              .append($('<input>')
                .attr('class', 'shippingIdentifierRadio')
                .attr('id', 'pickup')
                .attr('name', 'radio_' + item)
                .attr('type', 'radio')
                .click(function() {
                  retroduck.cart.updateVisibilityOfShippingForm();
                }))
              .append($('<label>')
                .html('pickup')));
      } else {

        // Cases for different types of shipping methods.
        if (dm == 'delivery') {
          msg = countPhrase + extraWord + 'being delivered to a previously ' +
              'specified address.';
          shipId = 'delivery';
        } else if (dm == 'shipping') {
          msg = countPhrase + 'will be shipped.  Complete the shipping '+
              'information below.';
          shipId = 'ship';
        } else if (dm == 'free shipping') {
          msg = countPhrase + 'will be shipped for free.  Complete the' +
          ' shipping information below.';
          shipId = 'ship';
        } else if (dm == 'pickup') {
          msg = countPhrase + extraWord + 'being picked up at a previously ' +
              'specified location.';
          shipId = 'pickup';
        }
        deliverySpan.append($('<em>')
            .attr('class', 'shippingIdentifierEm')
            .attr('id', shipId)
            .html(msg));
      }

      // delivery, pickup or ship, pickup, shipping
      shoppingCartItemsDiv.append(deliverySpan);
      retroduck.cart.shipId = shipId;
    }

    // Append the summary for the item to the main summary div.
    shoppingCartDiv.append(shoppingCartItemsDiv);

    // Return the total cost within the cart.
    return totalCost;
  },

  /**
   * Hide or show the shipping form.
   * @function that checks to see if the shipping form should be visible.
   *           Some orders have no items that are shipping, so we check that
   *           there are shipped items on the order before showing the form.
   *
   */
  updateVisibilityOfShippingForm: function() {

    // Iterate over shipping identifiers and determine if shipping form's
    // visibility should be toggled on/off.
    var hideShipping = true;

    $('.shippingIdentifierEm').each(function(i, el) {
      var type = el.id;
      if (type == 'ship') {
        hideShipping = false;
      }
    });
    $('.shippingIdentifierRadio').each(function(i, el) {
      var type = el.id;
      if (type == 'ship' && el.checked) {
        hideShipping = false;
      }
    });

    // If any items are shipping, show the shipping form.
    var div = $('.shippingAddressForm');
    if (hideShipping) {
      retroduck.cart.setShippingFormEmpty(div);
    } else {
      retroduck.cart.setShippingFormFields(div);
    }
  },

  /**
   * Show the summary of costs for the shopping cart
   * @function that takes cart object and makes UI elements showing cost.
   * @param cost Float total cost in shopping cart.
   * @param shoppingCartDiv Object dom element containing shopping cart div.
   *
   */
  showCostSummary: function(cost, shoppingCartDiv) {

    // Append cost summary.
    shoppingCartDiv.append($('<div>')
      .attr('class', 'shoppingCartCostSummary')
      .append($('<span>')
        .attr('class', 'cartTotalAndEditOption')
        .append($('<label>')
          .attr('class', 'costTitle')
          .html('total cost'))
        .append($('<label>')
          .attr('class', 'costPrice')
          .html('$' + parseFloat(cost).toFixed(2) + '*'))
        .append($('<label>')
          .html('edit <i class="fa fa-pencil"></i>')
          .attr('class', 'editCart')
          .click(function() {
            retroduck.cart.show();
          })))

      .append($('<span>')
        .attr('class', 'costDisclaimer')
        .html(retroduck.msg.SHOPPING_CART_DISCLAIMER)));

  },

  /**
   * Show a form for the credit card info.
   * @function that creates the dom elements for entering credit card info.
   * @param shoppingCartDiv Object dom element for shopping cart div.
   *
   */
  showCreditCardForm: function(shoppingCartDiv) {

    // Set a header for the summary.
    shoppingCartDiv.append($('<h1>')
      .html(retroduck.msg.CREDIT_CARD_FORM_TITLE)
      .attr('class', 'creditCardFormTitle'));

    // Set up billing details div.
    var billingDetailsDiv = $('<div>').attr('class', 'creditCardFormDiv');

    // Append form elements for credit card form.
    billingDetailsDiv

      .append($('<input>')
        .attr('class', 'creditCardFormNumber')
        .attr('id', 'credit_card_number')
        .attr('type', 'text')
        .attr('placeholder', retroduck.msg.CREDIT_CARD_NUMBER))

      .append($('<input>')
        .attr('class', 'creditCardFormMonth')
        .attr('id', 'credit_card_month')
        .attr('type', 'text')
        .attr('placeholder', retroduck.msg.CREDIT_CARD_MONTH))

      .append($('<input>')
        .attr('class', 'creditCardFormYear')
        .attr('id', 'credit_card_year')
        .attr('placeholder', retroduck.msg.CREDIT_CARD_YEAR))

      .append($('<input>')
        .attr('class', 'creditCardFormCVC')
        .attr('id', 'credit_card_cvc')
        .attr('placeholder', retroduck.msg.CREDIT_CARD_CVC))

      .append($('<input>')
        .attr('class', 'creditCardFormZip')
        .attr('id', 'credit_card_zip')
        .attr('placeholder', retroduck.msg.CREDIT_CARD_ZIP));

    // Append form to main div.
    shoppingCartDiv.append(billingDetailsDiv);
  },

  /**
   * Show form for entering customer details.
   * @function that reveals the form for entering customer details.
   * @param shoppingCartDiv Object dom element to append to
   *
   */
  showCustomerDetailsForm: function(shoppingCartDiv) {

    // Set a header for the summary.
    shoppingCartDiv.append($('<h1>')
      .html(retroduck.msg.CUSTOMER_DETAILS_FORM_TITLE)
      .attr('class', 'customerDetailsFormTitle'));

    // Set up billing details div.
    var customerDiv = $('<div>').attr('class', 'customerFormDiv');

    // Append form to main div.
    shoppingCartDiv.append(customerDiv);

    retroduck.utils.checkForUser();
  },

  /**
   * Show a form for the credit card info.
   * @function that creates the dom elements for entering credit card info.
   * @param shoppingCartDiv Object dom element for shopping cart div.
   * @param cart Object cookie containing shopping cart in JSON.
   *
   */
  showShippingAddressForm: function(shoppingCartDiv, cart) {

    // Determine what to do based on different shipping methods.
    var hasShippedItems;
    for (var productId in cart.items) {
      var product = cart.items[productId];
      if (product.deliveryMethod == 'pickup or ship' ||
          product.deliveryMethod == 'shipping' ||
          product.deliveryMethod == 'free shipping') {
            hasShippedItems = true;
          }
    }

    // Set up billing details div.
    var shippingDetailsDiv = $('<div>').attr('class', 'shippingAddressForm');

    // Set a header for the summary.
    shoppingCartDiv.append($('<h1>')
      .html(retroduck.msg.SHIPPING_ADDRESS_FORM_TITLE)
      .attr('class', 'shippingAddressFormHeader'));

    // Append form to main div.
    shoppingCartDiv.append(shippingDetailsDiv);

    // Do not include shipping options if no items are eligible.
    if (!hasShippedItems) {
      retroduck.cart.setShippingFormEmpty(shippingDetailsDiv);
    } else {

      // Store a global shipping status.
      retroduck.cart.hasItemsThatAreShipping = true;

      // Set the form fields for shipping info.
      retroduck.cart.setShippingFormFields(shippingDetailsDiv);
    }
  },

  /**
   * Set the shipping details form to empty.
   * @function that removes shipping form from the cart page.
   * @param div Object dom element for shipping details.
   *
   */
  setShippingFormEmpty: function(div) {
    div
      .html('')
      .append($('<div>')
        .html(retroduck.msg.NO_SHIPMENTS_IN_CART_MESSAGE)
        .attr('class', 'noShippingOptions'));

    // Store a global shipping status.
    retroduck.cart.hasItemsThatAreShipping = false;
  },

  /**
   * Fill out the shipping details with form fields.
   * @function that fills out the shipping details div with a form.
   * @param div Object dom element for shipping details.
   *
   */
  setShippingFormFields: function(div) {

    // Append form elements for credit card form.
    div
      .html('')
      .append($('<input>')
        .attr('class', 'shippingAddressFull')
        .attr('id', 'cart_address_line_one')
        .attr('type', 'text')
        .attr('placeholder', retroduck.msg.SHIPPING_ADDRESS_LINE_ONE))

      .append($('<input>')
        .attr('class', 'shippingAddressFull')
        .attr('id', 'cart_address_line_two')
        .attr('type', 'text')
        .attr('placeholder', retroduck.msg.SHIPPING_ADDRESS_LINE_TWO))

      .append($('<input>')
        .attr('class', 'shippingAddressThird')
        .attr('id', 'cart_address_line_city')
        .attr('type', 'text')
        .attr('placeholder', retroduck.msg.SHIPPING_ADDRESS_LINE_CITY))

      .append($('<input>')
        .attr('class', 'shippingAddressThird')
        .attr('id', 'cart_address_line_state')
        .attr('type', 'text')
        .attr('placeholder', retroduck.msg.SHIPPING_ADDRESS_LINE_STATE))

      .append($('<input>')
        .attr('class', 'shippingAddressThird')
        .attr('id', 'cart_address_line_zip')
        .attr('type', 'text')
        .attr('placeholder', retroduck.msg.SHIPPING_ADDRESS_LINE_ZIP));

      // Fill in the address with the current customer.
      retroduck.cart.fillInCurrentCustomerAddress();
  },

  /**
   * Fill in the customer address.
   * @function that checks for an active user, and dumps their address
   *           into the shopping cart address form (if address exists).
   *
   */
  fillInCurrentCustomerAddress: function() {

    // Set address to current user address.  If we've reached this stage,
    // order has items that are shipping.  We're now checking for a current
    // user.  We'll fill out their address if we have one on file.
    if (retroduck.currentUser) {
      var eml = retroduck.currentUser.attributes.email;
      var dbCustomer = Parse.Object.extend("dbCustomer");
      var query = new Parse.Query(dbCustomer);
      query.equalTo("email_address", eml);
      query.find({
        success: function(results) {
          // We have this customer.  Grab address and fill it in.
          if (results.length > 0) {
            retroduck.currentDatabaseCustomer = results[0];
            retroduck.cart.populateAddressForm(results[0].attributes);
          }
        },
        error: function(error) {
          // No customer exists.  Do nothing.
        }
      });
    }
  },

  /**
   * Populate shipping form within the shopping cart.
   * @function that takes an address, and given any valid params, fills in the
   *           appropriate shipping form field.
   * @param address Object parse user/customer object.
   *
   */
  populateAddressForm: function(address) {

    if (!address) {
      return;
    }
    if (address.address_one) {
      $('#cart_address_line_one').val(address.address_one);
    }
    if (address.address_two) {
      $('#cart_address_line_two').val(address.address_two);
    }
    if (address.address_city) {
      $('#cart_address_line_city').val(address.address_city);
    }
    if (address.address_state) {
      $('#cart_address_line_state').val(address.address_state);
    }
    if (address.address_zip) {
      $('#cart_address_line_zip').val(address.address_zip);
    }

    // Build form object.
    retroduck.cart.buildFormObject();
  },

  /**
   * Clear address form.
   * @function that clears the values of the shipping address form.
   *
   */
  clearAddressForm: function() {
    if ($('#cart_address_line_one')) {
      $('#cart_address_line_one').val('');
    }
    if ($('#cart_address_line_two')) {
      $('#cart_address_line_two').val('');
    }
    if ($('#cart_address_line_city')) {
      $('#cart_address_line_city').val('');
    }
    if ($('#cart_address_line_state')) {
      $('#cart_address_line_state').val('');
    }
    if ($('#cart_address_line_zip')) {
      $('#cart_address_line_zip').val('');
    }
  },

  /**
   * Add a button to let user confirm payment details.
   * @function that creates and appends a confirm button for the shopping cart.
   * @param shoppingCartDiv Object dom element for shopping cart div
   *
   */
  addConfirmCartButton: function(shoppingCartDiv) {

    // Add a button that lets the user confirm their card/shipping info.
    // Set a header for the summary.
    shoppingCartDiv.append($('<button>')
      .html(retroduck.msg.CONFIRM_CART_BUTTON)
      .attr('class', 'confirmShoppingCartDetailsButton')
      .click(function() {
        retroduck.cart.launchCartConfirmation();
      }));
  },

  /**
   * Launch a div to confirm cart details.
   * @function that launches a div containing details that will help the user
   *           confirm their checkout details, and proceed to completing the
   *           checkout process by paying.
   *
   */
  launchCartConfirmation: function() {

    // First, check for a user.
    if (!retroduck.currentUser) {
      var msg = retroduck.msg.NO_USER_LOGGED_IN;
      retroduck.utils.errorMessage(msg);
      return;
    }

    // Validate credit card form.
    // var ccValid = retroduck.cart.validateCreditCardForm();
    var ccValid = true;

    // Make sure the address is valid.
    var addressValid = retroduck.cart.validateShippingAddress();

    if (ccValid && addressValid) {

      // Confirm that the address is valid according to USPS.
      retroduck.cart.verifyAddressWithUSPS(function() {

        // Launch summary div.
        retroduck.cart.showConfirmationSummary();
      });
    }
  },

  /**
   * Verify address provided by customer
   * @function that takes user's address and verifies it with USPS.
   * @param cb Object callback funtion
   *
   */
  verifyAddressWithUSPS: function(cb) {

    // Assemble the USPS request.
    var lineOne = $('#cart_address_line_one').val();
    var lineTwo = $('#cart_address_line_two').val();
    var street = lineTwo == '' ? lineOne : lineOne + ' ' + lineTwo;
    var city = $('#cart_address_line_city').val();
    var state = $('#cart_address_line_state').val();
    var zip = $('#cart_address_line_zip').val();

    var requestUrl = '/validateAddress/' + street + '/' +
        city + '/' + state +'/' + zip;
    requestUrl = requestUrl.replace(/#/g, 'apt')

    $.ajax({
      url: requestUrl,
      success: function(response) {

        response = response.address;
        if (response.success) {
          retroduck.currentDatabaseCustomer.set('address_one', response.line_one);
          retroduck.currentDatabaseCustomer.set('address_two', response.line_two);
          retroduck.currentDatabaseCustomer.set('address_city', response.city);
          retroduck.currentDatabaseCustomer.set('address_state', response.state);
          retroduck.currentDatabaseCustomer.set('address_zip', response.zip);
          retroduck.currentDatabaseCustomer.save(null, {
            success: function() {
              retroduck.cart.populateAddressForm({
                address_one: response.line_one,
                address_two: response.line_two,
                address_city: response.city,
                address_state: response.state,
                address_zip: response.zip
              });
              cb();
            }
          });
        } else {
          cb();
        }
      },
      error: function(e) {
        cb();
      }
    });
  },

  /**
   * Validate credit card form.
   * @function that checks to see if credit card form values are valid and
   *           quits/returns messages if not.
   *
   */
  validateCreditCardForm: function() {

    // Define form fields.
    var ccField = $('#credit_card_number');
    var monthField = $('#credit_card_month');
    var yearField = $('#credit_card_year');
    var cvcField = $('#credit_card_cvc');
    var zipField = $('#credit_card_zip');
    var msg;

    // Check if CC has been entered.
    if (!ccField.val()) {
      msg = retroduck.msg.INVALID_CREDIT_CARD_NUMBER;
      retroduck.utils.errorMessage(msg);
      return false;
    }

    // Validate length of CC number
    if (ccField.val().length != 16 || isNaN(ccField.val())) {
      msg = retroduck.msg.INVALID_CREDIT_CARD_NUMBER;
      retroduck.utils.errorMessage(msg);
      return false;
    }

    // Validate Month and Year
    if (!monthField.val() || !yearField.val() ||
        isNaN(yearField.val()) || isNaN(monthField.val())) {
          msg = retroduck.msg.INVALID_CREDIT_CARD_DATE;
          retroduck.utils.errorMessage(msg);
          return false;
    }

    // Validate CVC field.
    if (!cvcField.val()) {
      msg = retroduck.msg.INVALID_CREDIT_CARD_CVC;
      retroduck.utils.errorMessage(msg);
      return false;
    }

    // Validate zip code.
    if (!zipField.val()) {
      msg = retroduck.msg.INVALID_CREDIT_CARD_ZIP;
      retroduck.utils.errorMessage(msg);
      return false;
    }

    return true;
  },

  /**
   * Validate shipping address.
   * @function that checks the fields of the shipping form for valid values.
   *
   */
  validateShippingAddress: function() {

    if (!retroduck.cart.hasItemsThatAreShipping) {
      return true;
    }

    var msg;
    if (!$('#cart_address_line_one').val() ||
        !$('#cart_address_line_city').val() ||
        !$('#cart_address_line_state').val() ||
        !$('#cart_address_line_zip').val()) {
      msg = retroduck.msg.INVALID_SHIPPING_ADDRESS;
      retroduck.utils.errorMessage(msg);
      return false
    }

    // If no failures found, move on.
    return true;
  },

  /**
   * Show the cart cummary.
   * @function that shows the shopping cart summary
   *
   */
  showConfirmationSummary: function() {

    // Get cart cookie.
    var cart = retroduck.utils.getOneCookie('cart');
    cart = JSON.parse(cart);

    // Define address.
    var lineOne = $('#cart_address_line_one').val();
    var lineTwo = $('#cart_address_line_two').val();
    var lineCity = $('#cart_address_line_city').val();
    var lineState = $('#cart_address_line_state').val();
    var lineZip = $('#cart_address_line_zip').val();
    var streetString = lineTwo == '' ? lineOne : lineOne + '<br>' + lineTwo;

    // Set the subtotal.
    var subTotal = 0;
    for (var item in cart.items) {
      var product = cart.items[item];
      subTotal += (parseFloat(product.price) * parseInt(product.totalItems));
    }

    // Set Sales Tax
    var tax = 0;
    if (retroduck.utils.TAXABLE_STATES[lineState]) {
      tax = subTotal * retroduck.utils.TAXABLE_STATES[lineState];
    }

    // Append a popup for confirmation.
    $("body")
      .append($('<div>')
        .attr('class', 'confirmCheckoutPopupDialog')
        .attr('name', 'rdModalPopup'));

    // Append cart info to popup.
    $('.confirmCheckoutPopupDialog')
      .append($('<h3>')
        .html(retroduck.msg.CONFIRM_CHECKOUT_HEADER));

    // Append cart info to popup.
    var shipping = 0;
    var itemsRequiringShippingFee = 0;
    if (retroduck.cart.hasItemsThatAreShipping) {

      // Count the number of items needing shipping fees.
      for (item in cart.items) {
        var prod = cart.items[item];
        if (prod.delivery_method != 'free shipping') {
          itemsRequiringShippingFee++;
        }
      }

      if (itemsRequiringShippingFee > 0) {
        shipping = 8;

        if (itemsRequiringShippingFee > 24) {
          shipping = 24;
        }
      }

      // Append shipping address.
      $('.confirmCheckoutPopupDialog')
        .append($('<section>')
          .attr('class', 'confirmCartAddress')
          .append($('<header>')
            .html('shipping to'))
          .append($('<label>')
            .html(streetString))
          .append($('<label>')
            .html(lineCity + ', ' + lineState + ' ' + lineZip)));
    }

    // Set grand total.
    retroduck.cart.grandTotal =
        parseFloat(tax) + parseFloat(subTotal) + parseFloat(shipping);

    // Append note about costs.
    $('.confirmCheckoutPopupDialog')
       .append($('<section>')
         .attr('class', 'confirmCartCosts')
         .append($('<header>')
           .html('cart total'))

         .append($('<span>')
           .attr('class', 'standard')
           .append($('<label>')
             .html('subtotal'))
           .append($('<em>')
             .html('$' + subTotal.toFixed(2))))

         .append($('<span>')
           .attr('class', 'standard')
           .append($('<label>')
             .html('tax'))
           .append($('<em>')
             .html('$' + tax.toFixed(2))))

         .append($('<span>')
           .attr('class', 'standard')
           .append($('<label>')
             .html('shipping'))
           .append($('<em>')
             .html('$' + shipping.toFixed(2))))

         .append($('<span>')
           .attr('class', 'cartCostConfirmGrandTotal')
           .append($('<label>')
             .html('total'))
           .append($('<em>')
             .html('$' + retroduck.cart.grandTotal.toFixed(2))))
         );

     // Append credit card note.
     var lastFourCard = $('#credit_card_number').val().slice(-4);
     $('.confirmCheckoutPopupDialog')
       .append($('<section>')
         .attr('class', 'confirmCardDetails')
         .append($('<label>')
           .html('card ending in **' + lastFourCard)));

     $('.confirmCheckoutPopupDialog')
       .append($('<section>')
         .attr('class', 'confirmCartButtons')
         .append($('<button>')
           .attr('class', 'cartPayButton')
           .html(retroduck.msg.CART_CONFIRM_BUY)
           .click(function() {
             retroduck.cart.assembleAndPayForOrder();
           }))
         .append($('<button>')
           .attr('class', 'cartCancelButton')
           .html(retroduck.msg.CART_CANCEL_BUY)
           .click(function() {
             $('.whiteOut').click();
           })));


    // Show whiteout div for use as offclick.
    $('.whiteOut')
      .show()
      .click(function() {
        $('.confirmCheckoutPopupDialog').remove();
        $('.whiteOut').hide();
      });
  },

  /**
   * Set summary for cart popup.
   * @function that sets the total cart items and price for cart popup.
   * @param totalItems Int total number of items in cart.
   * @param cartSubtotal Float subtotal for items in cart.
   *
   */
  setCartPopupSummary: function(totalItems, cartSubtotal) {

    // Set summary and buttons for cart.
    $('.shoppingCartDialog')
      .append($('<span>')
        .attr('class', 'shoppingCartSummary')

        // Summary of cart contents.
        .append($('<label>')
          .attr('class', 'cartTotalItems')
          .attr('id', 'cartPopupTotalItems')
          .html(totalItems + ' total items in cart'))
        .append($('<label>')
          .attr('class', 'cartTotalCost')
          .attr('id', 'cartPopupTotalCost')
          .html('$' + parseFloat(cartSubtotal).toFixed(2) + ' subtotal')))

      // Checkout button.
      .append($('<button>')
        .attr('class', 'cartCheckoutButton')
        .html('checkout')
        .click(function() {
          window.location.href = '/cart';
        }))

      // Continue shopping button.
      .append($('<button>')
        .attr('class', 'cartContinueButton')
        .html('continue shopping')
        .click(function() {
          $('.whiteOut').click();
        }));
  },

  /**
   * Update the summary found within the cart popup.
   * @function that updates the summary at the bottom of the cart popup.
   *
   */
  updateCartPopupSummary: function() {

    // Get the shopping cart.
    var cart = retroduck.utils.getOneCookie('cart');
    cart = JSON.parse(cart);

    // Initialize total items and total cost.
    var totalItems = 0;
    var cartSubtotal = 0;

    // Iterate over items to get price.
    for (var item in cart.items) {
      var product = cart.items[item];
      totalItems += parseInt(product.totalItems);
      cartSubtotal += parseFloat(product.price * product.totalItems);
    }

    // Set total cost.
    $('#cartPopupTotalCost').html('$' + cartSubtotal.toFixed(2) + ' subtotal');

    // Set total items
    $('#cartPopupTotalItems').html(totalItems + ' total items in cart');
  },

  /**
   * Append a span to the cart popup.
   * @function that appends a span for each product & unique size in the cart.
   * @param product Object cart product
   * @param productIndex Int index of this product.
   *
   */
  appendProductSpanToCartPopup: function(product, productIndex, productId) {

    // Index of size within product, eg if there are S, M and L or product
    // with productIndex: 1, S will be 1_0, M 1_1, and L 1_2.
    var sizeIndex = 0;

    // Case for this product not having any items in the cart.
    if (!product.totalItems || product.totalItems == 0) {
      return;
    }

    // Start building a product span.
    var productSpan = $('<span>')
      .attr('class', 'productSpanWithinCartPopup')
      .attr('id', 'productSpan_productIndex');


    // Append a name header.
    productSpan.append($('<h2>')
      .html(product.name));

    // Iterate over the sizes.
    for (var i = 0; i < retroduck.utils.orderSizeList.length; i++) {
      var size = retroduck.utils.orderSizeList[i];
      if (product.sizes[size]) {

        // Get quantity.
        var quantity = product.sizes[size];

        // Get price for this size.
        var price = (quantity * product.price).toFixed(2);

        // Set a unique id for this size.
        var id = productIndex + '_' + sizeIndex;

        var sizeSpan = $('<span>')
          .attr('class', 'sizeSpanWithinCart')
          .attr('id', id + '_sizeSpan');

        // Append a thumbnail if one exists.
        if (product.thumbnail) {
          sizeSpan.append($('<img>')
            .attr('src', product.thumbnail));
        }

          // Append a size label.
        sizeSpan.append($('<label>')
            .attr('class', 'sizeLabelWithinSizeSpan')
            .html(size))

          // Append a quantity label.
          .append($('<label>')
            .attr('class', 'quantityLabelWithinSizeSpan')
            .html(quantity))

          // Append a quantity label.
          .append($('<label>')

            .attr('class', 'toggleSizeLabel')

            .append($('<button>')
              .attr('class', 'toggleSizesUp')
              .attr('id', productId + '_' + size)
              .html(retroduck.msg.CART_POPUP_TOGGLE_SIZE_UP)
              .click(function(e) {
                retroduck.cart.incrementItemWithIdAndSize(e);
              }))

            .append($('<button>')
              .attr('class', 'toggleSizesDown')
              .attr('id', productId + '_' + size)
              .html(retroduck.msg.CART_POPUP_TOGGLE_SIZE_DOWN)
              .click(function(e) {
                retroduck.cart.decrementItemWithIdAndSize(e);
              })));

        productSpan.append(sizeSpan);
      }
    }

    // Append the product span.
    $('.shoppingCartItemsHolder').append(productSpan);
  },

  /**
   * Increment the number of a particular item and size in the shopping cart.
   * @function that allows the user to add items quickly using
   *           buttons inside the shopping cart.
   * @param event Object dom eveny from the click of the + button.
   *
   */
  incrementItemWithIdAndSize: function(event) {

    // Get product id and size to be updated.
    var id = event.currentTarget.id;
    var productId = id.split('_')[0];
    var size = id.split('_')[1];

    // Get shopping cart.
    var cart = retroduck.utils.getOneCookie('cart');
    cart = JSON.parse(cart);
    var product = cart.items[productId];

    // Increment the size and total items.
    product.totalItems++;
    product.sizes[size]++;

    if (cart.totalItems) {
      cart.totalItems++;
    } else {
      cart.totalItems = 1;
    }

    // Update the cookie and UI.
    retroduck.cart.finishUpdatingSizes(cart);
  },

  /**
  * Decrement the number of a particular item and size in the shopping cart.
  * @function that allows the user to remove items quickly using
  *           buttons inside the shopping cart.
  * @param event Object dom eveny from the click of the - button.
  *
  */
  decrementItemWithIdAndSize: function(event) {

    // Get product id and size to be updated.
    var id = event.currentTarget.id;
    var productId = id.split('_')[0];
    var size = id.split('_')[1];

    // Get shopping cart.
    var cart = retroduck.utils.getOneCookie('cart');
    cart = JSON.parse(cart);
    var product = cart.items[productId];

    // Decrement the size and total items.
    product.totalItems--;
    product.sizes[size]--;

    // Decrement total items in cart.
    if (cart.totalItems > 0) {
      cart.totalItems--;
    } else {
      cart.totalItems = 0;
    }

    // Delete the product if quantity is 0.
    if (product.sizes[size] == 0) {
      delete product.sizes[size];
    }

    // Delete product if none are in cart.
    if (product.totalItems == 0) {
      delete cart.items[productId];
    }

    // Update the cookie and UI.
    retroduck.cart.finishUpdatingSizes(cart);
  },

  /**
   * Finish updating cart after updating sizes.
   * @function that updates the cart cookie and UI after a user increments
   *           or decrements a size within the shopping cart.
   * @param cart Object cart cookie JSON object
   *
   */
  finishUpdatingSizes: function(cart) {

    // Set the cart in the cookie.
    retroduck.utils.setCookie('cart', JSON.stringify(cart));

    // Update the cart and cart icon.
    retroduck.cart.updateCartIcon();
    retroduck.cart.show();

    // If the user is currently in the cart, update that page as well.
    if (window.location.pathname == '/cart') {
      retroduck.cart.renderShoppingCartPage();
    }
  },

  /**
  * Add an item to the cart.
  * @function that adds a product to the shopping cart.
  * @param event Object dom event from the click.
  *
  */
  addItemToCart: function(event) {

    // Get the button and the product params from its properties.
    var button = event.currentTarget;
    var productId = button.id.split('_')[0];
    var size = button.id.split('_')[1];
    var deliveryMethod = button.id.split('_')[2];
    var thumb = button.name;
    var price = button.title.split('_')[0];
    var name = button.title.split('_')[1];

    // Check for a shopping cart in the properties.
    var cart = retroduck.utils.getOneCookie('cart');
    if (cart) {

      // Make cart an object.
      cart = JSON.parse(cart);
    } else {

      // Set empty cart.
      cart = {};
    }

    // Set cart items;
    if (!cart.items) {
      cart.items = {};
    }

    // Set a property for this product in the items list.
    if (!cart.items[productId]) {
      cart.items[productId] = {};
    }

    // Set a thumbnail for the product.
    if (!cart.items[productId].thumbnail) {
      cart.items[productId].thumbnail = thumb;
    }

    // Set a name for the product.
    if (!cart.items[productId].name) {
      cart.items[productId].name = name;
    }

    // Set the price.
    if (!cart.items[productId].price) {
      cart.items[productId].price = price;
    }

    // Set up sizes object.
    if (!cart.items[productId].sizes) {
      cart.items[productId].sizes = {};
      cart.items[productId].sizes.length = 0;
    }

    // Set a total items counter.
    if (!cart.items[productId].totalItems) {
      cart.items[productId].totalItems = 0;
    }

    // Set delivery method
    if (!cart.items[productId].deliveryMethod) {
      if (deliveryMethod) {
        cart.items[productId].deliveryMethod = deliveryMethod;
      }
    }

    // Increment the cart item.
    retroduck.cart.incrementCartItem(cart, productId, size);

    // Show the user their cart.
    retroduck.cart.show();
  },

  /**
  * Adds a product to the shopping cart.
  * @function that adds one item to the current shopping cart cookie.
  * @param cart Object shopping cart object.
  * @param productId String Parse id of catalog item.
  * @param size String size to add.
  *
  */
  incrementCartItem: function(cart, productId, size) {

    if (!cart) {
      var cart = retroduck.utils.getOneCookie('cart');
      cart = JSON.parse(cart);
    }

    // Increment or set product property.
    if (cart.items[productId].sizes[size]) {
      cart.items[productId].sizes[size]++;
      cart.items[productId].totalItems++;
    } else {
      cart.items[productId].sizes[size] = 1;
      cart.items[productId].sizes.length++;
      cart.items[productId].totalItems++;
    }

    // Increment total items in cart.
    if (cart.totalItems) {
      cart.totalItems++;
    } else {
      cart.totalItems = 1;
    }

    // Set the cart in the cookie.
    retroduck.utils.setCookie('cart', JSON.stringify(cart));

    // Update the cart icon.
    retroduck.cart.updateCartIcon();
  },

  /**
  * Removes a product from the shopping cart.
  * @function that removes one item from the current shopping cart cookie.
  * @param cart Object shopping cart object.
  * @param productId String Parse id of catalog item.
  * @param size String size to remove.
  *
  */
  decrementCartItem: function(cart, productId, size) {

    if (!cart) {
      var cart = retroduck.utils.getOneCookie('cart');
      cart = JSON.parse(cart);
    }

    // Decrement or set product property.
    if (cart.items[productId].sizes[size]) {
      cart.items[productId].sizes[size]--;
      cart.items[productId].totalItems--;
      cart.items[productId].sizes.length--;
      if (cart.items[productId].totalItems < 0) {
        cart.items[productId].totalItems = 0;
      }
    }

    // Check if all of this size has been removed, and if so, remove the object.
    if (cart.items[productId].sizes[size] == 0) {
      delete cart.items[productId].sizes[size];
    }

    // Remove entire product object if it is empty.
    if (cart.items[productId].totalItems == 0) {
      delete cart.items[productId];
    }

    // Decrement total items in cart.
    if (cart.totalItems > 0) {
      cart.totalItems--;
    } else {
      cart.totalItems = 0;
    }

    // Set the cart in the cookie.
    retroduck.utils.setCookie('cart', JSON.stringify(cart));

    // Update the cart icon.
    retroduck.cart.updateCartIcon();
  },

  /**
   * Keeps the shopping cart form details in memory.
   * @function that watches for keystrokes while in the shopping cart and
   *           keeps track of what the customer has entered.  That way, if
   *           something happens the form automagically holds the info.
   *
   */
  logCartKeystrokes: function() {
    $(document).keyup(function(e) {
      retroduck.cart.buildFormObject();
    });
  },

  /**
   * Build an object based on the values in the shopping cart form.
   *
   */
  buildFormObject: function() {
    retroduck.cart.formObject = {
      'credit_card_number': $('#credit_card_number').val(),
      'credit_card_cvc': $('#credit_card_cvc').val(),
      'credit_card_zip': $('#credit_card_zip').val(),
      'credit_card_month': $('#credit_card_month').val(),
      'credit_card_year': $('#credit_card_year').val(),

      'cart_address_line_one': $('#cart_address_line_one').val(),
      'cart_address_line_two': $('#cart_address_line_two').val(),
      'cart_address_line_city': $('#cart_address_line_city').val(),
      'cart_address_line_state': $('#cart_address_line_state').val(),
      'cart_address_line_zip': $('#cart_address_line_zip').val()
    };
  },

  /**
   * Prepare database order object and commit payment.
   * @function that takes shopping cart contents, converts them to a database
   *           ready json object, and pays for the order (or shows message that
   *           payment was not successful).
   *
   */
  assembleAndPayForOrder: function() {
    var form = retroduck.cart.formObject;
    var msg = '';

    if (!form) {
      msg = 'Please complete the form to complete check out.';
      retroduck.utils.errorMessage(msg);
      return;
    }

    var requiredItems = {
      'credit_card_number': 'Credit Card number',
      'credit_card_cvc': 'Credit Card Security code',
      'credit_card_zip': 'Credit Card Billing Zip Code',
      'credit_card_month': 'Credit Card Exp Month',
      'credit_card_year': 'Credit Card Exp Year',
      'cart_address_line_one': 'Address Street',
      'cart_address_line_city': 'Address City',
      'cart_address_line_state': 'Address State',
      'cart_address_line_zip': 'Address Zip Code'
    };

    for (var field in form) {
      if (!form[field] && requiredItems[field]) {
        msg += requiredItems[field] + ' is required<br>';
      }
      var formIsInvalid = true;
    }

    if (formIsInvalid) {
      retroduck.utils.errorMessage(msg);
      return;
    }
    var total = retroduck.cart.grandTotal;
    console.log(total, formObject);
  },

  /** Show a message that the cart is empty. **/
  emptyCartMessage: function() {
    $('.shoppingCartDialog')
      .append($('<span>')
        .attr('class', 'noShoppingCartItems')
        .html('Your shopping cart is empty.  Add some stuff!'))
      .append($('<button>')
        .html('OK!  I Will!')
        .attr('class', 'noShoppingCartItemsButton')
        .click(function() {
          $('.shoppingCartDialog').hide();
        }));
  },

  /** Update the shopping cart icon. **/
  updateCartIcon: function() {

    // Get cart cookie.
    var cart = retroduck.utils.getOneCookie('cart');
    cart = JSON.parse(cart);

    // Set cart total.
    var cartTotal = 0;
    var cartSubtotal = 0;

    // Iterate over all items.
    for (var item in cart.items) {
      var prod = cart.items[item];
      cartTotal += parseInt(prod.totalItems);
      cartSubtotal += (prod.totalItems * prod.price);
    }

    // Set the cart icon.
    $('.shoppingCartMenuIcon--count')
      .html(cartTotal);
    $('.shoppingCartMenuIcon--total')
      .html('$' + Number(cartSubtotal).toFixed(2));
  },

  /** Show the user their shopping cart. **/
  show: function() {

    // Launch the popup.
    retroduck.utils.launchPopup('shoppingCartDialog');

    // Set the cart heading.
    $('.shoppingCartDialog')
      .html('')
      .append($('<h1>')
        .html(retroduck.msg.SHOPPING_CART_POPUP_TITLE))
      .append($('<div>')
        .attr('class', 'shoppingCartItemsHolder'));

    // Get the shopping cart.
    var cart = retroduck.utils.getOneCookie('cart');

    // Case for no cart at all.
    if (!cart) {
      retroduck.cart.emptyCartMessage();
      return;
    }

    // Turn the cart into an object.
    cart = JSON.parse(cart);

    // Keep count of items.
    var uniqueProducts = 0;
    var cartSubtotal = 0;

    // Go over the items.
    for (var item in cart.items) {
      var product = cart.items[item];
      if (product.sizes && product.sizes.length > 0) {

        // Product is ok, keep track of unique products in cart.
        uniqueProducts++;

        // Get product price and increment total price.
        var productPrice = (parseInt(product.totalItems) *
            parseFloat(product.price)).toFixed(2);

        cartSubtotal = (parseFloat(cartSubtotal) +
            parseFloat(productPrice)).toFixed(2);

        // Append a span for the product.
        retroduck.cart.appendProductSpanToCartPopup(
            product, uniqueProducts, item);
      }
    }

    // Case for no sizes for any product.
    if (uniqueProducts == 0) {
      retroduck.cart.emptyCartMessage();
    } else {
      retroduck.cart.setCartPopupSummary(cart.totalItems, cartSubtotal);
    }
  },

};

// When any page loads, update some shopping cart details.
$(document).ready(function() {

  // Update the shopping cart icon.
  retroduck.cart.updateCartIcon();

  // Attach click to icon.
  $('.shoppingCartMenuIcon').click(function() {
    retroduck.cart.show();
  });

  // Show shopping cart page if neccessary.
  if (window.location.pathname == '/cart') {
    retroduck.cart.renderShoppingCartPage();
    retroduck.cart.logCartKeystrokes();
    retroduck.utils.checkForUser();
  }

});
