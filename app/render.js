// Config module.
var config 				= require('./config');

// Requests module
var requests 			= require('./requests');

// Init parse.
var Parse 				= require('parse').Parse;
Parse.initialize(config.key, config.token);

// Module for rendering pages.
module.exports = {

    /**
     * Render the home page of the store.
     * @function that renders the home page for the store.
     *
     */
    homePage: function(res) {
        requests.getCurrentStore(function(store) {

            // Render the homepage.
            res.render('index.jade', store);
        });
    },

    /**
    * Render the home page of the store.
    * @function that renders the home page for the store.
    *
    */
    shoppingCart: function(res) {
      requests.getCurrentStore(function(store) {

        // Render the shopping cart.
        res.render('cart.jade', store);
      });
    },

    /**
    * Render the user's orders.
    * @function that renders customer order page.
    *
    */
    myOrders: function(res) {
      requests.getCurrentStore(function(store) {

        // Render the user's order page.
        res.render('myOrders.jade', store);
      });
    },

    /**
     * Render a custom route.
     * @function that renders the html for a custom route.
     * @param routeName String name of the route/path.
     * @param res Object response object.
     *
     */
    customRoute: function(routeName, res) {

        // Get the current store
        requests.getCurrentStore(function(store) {

            // Default: set store as page in case this route is invalid, and so that
            // page will inherit the default header and footer.
            var page = store;

            // Get the custom route details
            if (store.custom_pages[routeName]) {

                // Get the route details.
                var rt = store.custom_pages[routeName];
                rt.elements = requests.sortDict(rt.elements, 'index_in_list');

                // Set the title and meta details.
                page.title = rt.title;
                page.meta_keywords = rt.meta_keywords;
                page.meta_description = rt.meta_description;

                // Build the content string.
                var bodyContent = '';

                // Iterate over all elements.
                for (var element in rt.elements) {
                    var content = rt.elements[element];
                    bodyContent += content.rendered_content;
                }

                // Set the body string.
                page.body = bodyContent;
            }

            // Render the homepage.
            res.render('index.jade', page);
        });
    },

    /**
     * Render a social order
     * @function that renders a social order and its available items.
     * @param orderId String readable order id for store order.
     * @param res Object response object
     *
     */
     socialOrder: function(orderId, res) {
         requests.getCurrentStore(function(store) {

             requests.getSocialItems(orderId, function(results) {

                if (!results[0] || !results[0].attributes) {
                  return;
                }

                var order = results[0].attributes;
                var orderId = results[0].id;

                // Set some store params
                store.order_name = order.order_name

                var items = order.items || '{}';
                items = JSON.parse(items);

                // Begin building a social items object.
                var socialItems = {};

                for (var item in items) {

                  // Get the product.
                  var product = items[item];

                  // Initialize price.
                  var price = getProductPrice(product);

                  // Get array of images.
                  var imgArray = product.design_images_list.split(',');
                  var primaryImage = imgArray[0] || '';

                  // Assign the product id to an object.
                  socialItems[product.id] = {};
                  socialItems[product.id].id = product.id;
                  socialItems[product.id].images = imgArray
                  socialItems[product.id].primary_image = primaryImage;
                  socialItems[product.id].name = product.item_name;
                  socialItems[product.id].price = price;
                  socialItems[product.id].sizes = product.sizes || {};
                  socialItems[product.id].expiry_date = product.social_end_date;
                  socialItems[product.id].desc = product.product_socialmessage;
                  socialItems[product.id].delivery_method =
                      product.social_delivery_method_visible;
                }

                // Update the title of this page to mention the social order.
                store.title = order.order_name + ' at ' + store.title;

                // Add social items to store object.
                store.social_items = socialItems;
                store.order_id = orderId;

                // Render the homepage.
                res.render('social.jade', store);
             });
         });
     },

     /**
      * Load a product.
      * @function that loads a product.
      * @param productId String id for the product.
      *
      */
     loadProduct: function(productId, res) {

         // Get the current store.
         requests.getCurrentStore(function(store) {

           // Get the product
           requests.getProductById(productId, res, store, function(product) {

                   // Initialize products object.
                   var products = {};

                   // Product price.
                   var price = getProductPrice(product);

                   // Assign the product id to an object.
                   products[product.id] = {};
                   products[product.id].images = product.design_images_list.split(',');
                   products[product.id].name = product.item_name;
                   products[product.id].price = price;
                   products[product.id].sizes = product.sizes || {};
                   products[product.id].expiry_date = product.social_end_date;

                   store.products = products;

                   // Load the product page.
                   res.render('product.jade', store);
           });
         });
     },

     /** Function for formatting a USPS API Address Validation call **/
    formatAddressValidationRequest: function(street, city, state, zip) {
     	var baseUrl = 'http://production.shippingapis.com/ShippingAPITest.dll?';
     	var apiCall ='API=Verify&XML=<AddressValidateRequest%20USERID="' +
     			config.usps_api_key + '">';
     	var xml 		= '<Address><Address1>' + street + '</Address1><Address2>' +
     			'</Address2><City>' + city + '</City><State>' + state + '</State>' +
     			'<Zip5>' + zip + '</Zip5><Zip4></Zip4></Address>' +
     			'</AddressValidateRequest>';
     	return baseUrl + apiCall + xml;
     },

     /** Format an xml address response from USPS to JSON **/
     formatAddressValidationResponse: function(xml) {

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
};

/** Get the relevant price from a product. **/
function getProductPrice(product) {

  var price;

  // Set price as sale, social or regular price.
  if (product.product_socialprice &&
    product.product_socialprice != '' &&
    product.product_socialprice != 0) {
      price = product.product_socialprice;
    } else {
      if (product.product_saleprice &&
        product.product_saleprice != '' &&
        product.product_saleprice != 0) {
          price = product.product_saleprice;
        } else {
          price = product.product_price;
        }
      }

  return parseFloat(price).toFixed(2);
}

/** Build a new object to represent a product.  Used for jade template **/
function buildProductObject(product, price) {
  var products = {};
  products[product.id] = {};
  products[product.id].images = product.design_images_list.split(',');
  products[product.id].name = product.item_name;
  products[product.id].price = price;
  products[product.id].sizes = product.sizes || {};
  products[product.id].expiry_date = product.social_end_date;

  return products;
}
