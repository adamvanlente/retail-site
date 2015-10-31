// Config module.
var config 				= require('./config');

// Init parse.
var Parse 				= require('parse').Parse;
Parse.initialize(config.key, config.token);

// Stripe
var stripe = require("stripe")(config.stripe_key);

// Module for requests.
module.exports = {

  // Make a payment to Stripe's API.
  makePayment: function(form, cb) {

    // Get total in pennies.
    var total = getStripeAmount(form.cart_total);

    // Make the stripe charge.  Send success flag back to front end.
    var charge = stripe.charges.create({
      amount: total, // amount in cents, again
      currency: "usd",
      source: form.stripeToken,
      description: "Example charge"
    }, function(err, charge) {
      if (err && err.type === 'StripeCardError' ||
          err && err.type === 'StripeInvalidRequest') {
        cb({
          'success': false,
          'res': err
        })
      }
      cb({
        'formData': form,
        'charge': charge,
        'success': true
      });
    });
  }
};

// Convert a dollars & cents total to all pennies.
function getStripeAmount(amount) {

  // Set to fixed number (2 decimal).
  amount = Number(amount).toFixed(2);
  amount = String(amount);

  // Convert amount total to pennies.
  var dollars = amount.split('.')[0];
  var cents = amount.split('.')[1];
  var dollarsInCents = Number(dollars) * 100;
  var newTotal = dollarsInCents + Number(cents);

  return newTotal;
}
