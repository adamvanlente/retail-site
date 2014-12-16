// ******************************************
// Main route handler.
// __________________________________________

// Get the Parse API set up.
var config 				= require('../config');
var Parse 				= require('parse').Parse;
Parse.initialize(config.key, config.token);

// Requests module.
var requests 			= require('../requests');

module.exports = function(app) {

	//***********************
	//***********************
	//**** MAIN PAGE ********
	//***********************
	//***********************
	app.get('/', function(req, res) {

			requests.getCurrentStore(function(store) {

				// Render the homepage.
				res.render('index.jade', store);
			});
	});

	//***********************
	//***********************
	//**** CUSTOM ROUTE *****
	//***********************
	//***********************
	app.get('/:routeName', function(req, res) {

		// Get route path
		var routeName = req.params.routeName;

		// Create the route name, eg 'products' + '.jade' = products.jade.
		var routeTemplate = routeName + '.jade';

		// Render template
		res.render('index.jade');
	});
};
