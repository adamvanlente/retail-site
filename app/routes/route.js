// ******************************************
// Main route handler.
// __________________________________________

// Get the Parse API set up.
var config 				= require('../config');
var Parse 				= require('parse').Parse;
Parse.initialize(config.key, config.token);

// Helper library for making ajax requests.
var najax = require('najax');

// Requests module.
var requests 			= require('../requests');

// Rendering module.
var render  			= require('../render');

// Main route module.
module.exports = function(app) {

	//***********************
	//***********************
	//**** MAIN PAGE ********
	//***********************
	//***********************
	app.get('/', function(req, res) {

			// Render homepage.
			render.homePage(res);
	});

	//***********************
	//***********************
	//**** SHOPPING CART ****
	//***********************
	//***********************
	app.get('/cart', function(req, res) {

		// Render homepage.
		render.shoppingCart(res);
	});

	//***********************
	//***********************
	//* RENDER USER ORDERS **
	//***********************
	//***********************
	app.get('/my_orders', function(req, res) {

		// Render the user order page.
		render.myOrders(res);
	});

	//***********************
	//***********************
	//**** CUSTOM ROUTE *****
	//***********************
	//***********************
	app.get('/:routeName', function(req, res) {

		// Get route path
		var routeName = req.params.routeName;

		// Render the page.
		render.customRoute(routeName, res);
	});

	//***********************
	//***********************
	//**** PRODUCT **********
	//***********************
	//***********************
	app.get('/product/:catalogId', function(req, res) {

		// Catalog id.
		var catalogId = req.params.catalogId;

		// Render homepage.
		render.loadProduct(catalogId, res);
	});

	//***********************
	//***********************
	//**** SOCIAL PRODUCT ***
	//***********************
	//***********************
	app.get('/social/:orderId', function(req, res) {

		// Order with social items.
		var orderId = req.params.orderId;

		// Render a social order page.
		render.socialOrder(orderId, res);
	});


	//***********************
	//***********************
	//* GET A USER'S ORDERS *
	//***********************
	//***********************
	app.get('/getUserOrders/:emailAddress', function(req, res) {

		// User email address.
		var email = req.params.emailAddress;

		requests.getUsersOrders(email, function(json) {
			res.json(json);
		});
	});

	//***********************
	//***********************
	//*** VALIDATE ADDRESS **
	//***********************
	//***********************
	app.get('/validateAddress/:street/:city/:state/:zip', function(req, res) {

		// Order with social items.
		var street = req.params.street;
		var city   = req.params.city;
		var state  = req.params.state;
		var zip    = req.params.zip;

		// Build a request url.
		var requestUrl =
				render.formatAddressValidationRequest(street, city, state, zip);

		// Make a request to the site and then report the response time.
		najax({
			url: requestUrl,
			success: function(xmlResponse) {

				// Format the xml response to json.
				var formattedAddress =
						render.formatAddressValidationResponse(xmlResponse);

				// Render the json.
				res.json({'address': formattedAddress});
			},
			error: function(e) {
				res.json({'address': e});
			}
		});
	});
};
