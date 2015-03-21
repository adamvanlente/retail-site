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
		var requestUrl = formatAddressValidationRequest(street, city, state, zip);

		// Make a request to the site and then report the response time.
		najax({
			url: requestUrl,
			success: function(xmlResponse) {

				// Format the xml response to json.
				var formattedAddress = formatAddressValidationResponse(xmlResponse)

				// Render the json.
				res.json({'address': formattedAddress});
			},
			error: function(e) {
				res.json({'address': e});
			}
		});
	});
};

/** Function for formatting a USPS API Address Validation call **/
function formatAddressValidationRequest(street, city, state, zip) {
	var baseUrl = 'http://production.shippingapis.com/ShippingAPITest.dll?';
	var apiCall ='API=Verify&XML=<AddressValidateRequest%20USERID="' +
			config.usps_api_key + '">';
	var xml 		= '<Address><Address1>' + street + '</Address1><Address2>' +
			'</Address2><City>' + city + '</City><State>' + state + '</State>' +
			'<Zip5>' + zip + '</Zip5><Zip4></Zip4></Address>' +
			'</AddressValidateRequest>';
	return baseUrl + apiCall + xml;
}

/** Format an xml address response from USPS to JSON **/
function formatAddressValidationResponse(xml) {

	// Check for an error.
	if (xml.split('<Error>')[1]) {
		var error = xml.split('<Description>')[1].split('</Description>')[0];
		error = 'Error with address: ' + error;
		return {
			message: error,
			success: false
		}
	}

	// Parse response from USPS
	var a1 		 = xml.split('<Address1>')[1];
	if (a1) {
		a1 = a1.split('</Address1>')[0];
	}

	var a2 		 = xml.split('<Address2>')[1];
	if (a2) {
		a2 = a2.split('</Address2>')[0];
	}

	// Address1 and Address2 tags seem unpredictable.  Build a street string
	// based solely on what is returned.
	var lineOne = '';
	var lineTwo = '';

	if (a1 && a2) {
		lineOne = a2;
		lineTwo = a1;
	} else if (!a1 && !a2){
		return {
			message: 'Error with address: Address not found.',
			success: false
		}
	} else {
		if (a1) {
			lineOne = a1;
		}
		if (a2) {
			lineOne = a2;
		}
	}

	var aCity  = xml.split('<City>')[1].split('</City>')[0];
	var aState = xml.split('<State>')[1].split('</State>')[0];
	var aZip   = xml.split('<Zip5>')[1].split('</Zip5>')[0];

	// Return object from formatted address.
	return {
		line_one: lineOne,
		line_two: lineTwo,
		city: aCity,
		state: aState,
		zip: aZip,
		success: true
	}
}
