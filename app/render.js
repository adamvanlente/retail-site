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

        // Render the homepage.
        res.render('cart.jade', store);
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
                console.log(rt);
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
                var order = results[0].attributes;
                var items = order.items || '{}';
                items = JSON.parse(items);

                // Begin building a social items object.
                var socialItems = {};

                for (var item in items) {

                  // Get the product.
                  var product = items[item];

                  // Initialize price.
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

                  price = parseInt(price).toFixed(2);

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
                  socialItems[product.id].delivery_method =
                      product.social_delivery_method_visible;
                }

                // Update the title of this page to mention the social order.
                store.title = order.order_name + ' at ' + store.title;

                // Add social items to store object.
                store.social_items = socialItems;
                console.log(socialItems)

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

                   // Initialize price.
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

                   price = parseInt(price).toFixed(2);

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
     }
};
