// ******************************************
// Main route handler.
// __________________________________________

// Get the Parse API set up.
var config 				= require('../config');
var Parse 				= require('parse').Parse;
Parse.initialize(config.key, config.token);

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



};
