// ******************************************
// Main route handler.
// __________________________________________

// Get the Parse API set up.
var config 				= require('../config');

var Parse 				= require('parse').Parse;
Parse.initialize(config.key, config.token);

module.exports = function(app) {

	//***********************
	//***********************
	//**** MAIN PAGE ********
	//***********************
	//***********************
	app.get('/', function(req, res) {
			res.render('index.jade');
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

		// Render the template.
		// res.render(routeTemplate);
		res.render('index.jade');
	});
};
