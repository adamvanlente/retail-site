// RetroDuck namespace.
var retroduck = retroduck || {};

/**
 * Messages module
 * @module simple module containting globals for UI messages.
 *
 */
retroduck.msg = {

  // Message user sees as a disclaimer to their shopping cart total.
  SHOPPING_CART_DISCLAIMER: '* plus applicable taxes and shipping',

  // Message when no items exist within shopping cart.
  EMPTY_CART_MESSAGE: 'your cart is empty',

  // Title that appears at the top of the popup version of the shopping cart.
  SHOPPING_CART_POPUP_TITLE: 'Your shopping cart',
  CART_POPUP_TOGGLE_SIZE_UP: '<i class="fa fa-plus-circle"></i>',
  CART_POPUP_TOGGLE_SIZE_DOWN: '<i class="fa fa-minus-circle"></i>',

  // Shopping cart title for order summary section.
  ORDER_SUMMARY_TITLE: 'Order summary <i class="fa fa-list"></i>',

  // Customer details form.
  CUSTOMER_DETAILS_FORM_TITLE: 'Customer details <i class="fa fa-user"></i>',

  // Credit card form values and messages.
  CREDIT_CARD_FORM_TITLE:
      'Credit card details <i class="fa fa-credit-card"></i>',
  CREDIT_CARD_NUMBER: 'Card number',
  CREDIT_CARD_MONTH: 'MM',
  CREDIT_CARD_YEAR: 'YY',
  CREDIT_CARD_CVC: 'CVC',
  CREDIT_CARD_ZIP: 'ZIP',
  INVALID_CREDIT_CARD_NUMBER: 'Your card number appears to be invalid. ' +
      'Please double check and ensure that it is correct',
  INVALID_CREDIT_CARD_MONTH: 'Your card expiry month appears to be invalid. ' +
      'Please double check and ensure that it is correct',
  INVALID_CREDIT_CARD_YEAR: 'Your card expiry year appears to be invalid. ' +
      'Please double check and ensure that it is correct',
  INVALID_CREDIT_CARD_CVC: 'Your card CVC number appears to be invalid. ' +
      'Please double check and ensure that it is correct',
  INVALID_CREDIT_CARD_ZIP: 'Your card zip code appears to be invalid. ' +
      'Please double check and ensure that it is correct',

  // Shipping form input placeholders and messages.
  NO_SHIPMENTS_IN_CART_MESSAGE: '(none of your items are shipping)',
  SHIPPING_ADDRESS_FORM_TITLE:
      'Shipping information <i class="fa fa-truck"></i>',
  SHIPPING_ADDRESS_LINE_ONE: 'Address',
  SHIPPING_ADDRESS_LINE_TWO: 'Address cont\'d',
  SHIPPING_ADDRESS_LINE_CITY: 'City',
  SHIPPING_ADDRESS_LINE_STATE: 'State',
  SHIPPING_ADDRESS_LINE_ZIP: 'Zip',

  // Confirm cart billing/shipping button text.
  CONFIRM_CART_BUTTON:
      'Calculate total &amp; review<i class="fa fa-arrow-circle-right"></i>',

  // Bad form values.
  BAD_EMAIL_ADDRESS: 'Please enter a valid email address',
  PASSWORDS_DONT_MATCH: 'The passwords do not match',
  NO_PASSWORD: 'Please enter a password',
  INCOMPLETE_FORM: 'Please complete all form fields',
  BAD_CUST_NAME: 'Please enter both a first and last name',

  // Account related messages.
  PASSWORD_RESET_SUCCESSFUL: 'A link has been emailed to you, which you can ' +
      'use to reset your password.  Please check your email.',
  PASSWORD_RESET_FAILURE: 'Unable reset passwrod.  If you are not an ' +
      'existing user, create a new account.',
  NEW_USER_CREATED: 'Your user account has been created',


};
