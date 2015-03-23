// Config module.
var config 				= require('./config');

// Init parse.
var Parse 				= require('parse').Parse;
Parse.initialize(config.key, config.token);

// Module for requests.
module.exports = {

  /**
   * Get the current store
   * @function that gets all the details about the current store.
   *
   */
  getCurrentStore: function(successCb) {

      // Build a query from the object type.
      var DbObject = Parse.Object.extend('dbStoreSettings');
      var query = new Parse.Query(DbObject);

      // Always sort newest first.
      query.descending("updatedAt");
      query.matches('store_name', config.site_name);

      // Perform the queries and continue with the help of the callback functions.
      query.find({
          success: function(results) {

              var store 							= results[0].attributes;

              var storeObject 				     = {};
              storeObject.title 			     = store.store_title.store_title;;
              storeObject.meta_keywords 	 = store.meta_keywords.meta_keywords;
              storeObject.meta_description = store.meta_description.meta_description;
              storeObject.header 			     = store.header.header_body;
              storeObject.footer 			     = store.footer.footer_body;
              storeObject.body			       = store.homepage_body.homepage_body;
              storeObject.custom_pages     = store.custom_pages;
              storeObject.attributes       = store;

              // Return store object.
              successCb(storeObject);
          },
          error: function(error) {
              console.log(error.message)
          }
      });
  },

  /**
   * Get the current store
   * @function that gets all the details about the current store.
   *
   */
  getUsersOrders: function(emailAddress, successCb) {

      // Build a query from the object type.
      var DbObject = Parse.Object.extend('dbOrder');
      var query = new Parse.Query(DbObject);

      // Always sort newest first.
      query.descending("due_date");
      query.matches('cust_email', emailAddress);

      // Perform the queries and continue with the help of the callback functions.
      query.find({
          success: function(results) {
              successCb({
                success: true,
                results: results
              });
          },
          error: function(error) {
              successCb({
                success: false,
                results: []
              });
          }
      });
  },

  /**
   * Get social items from an order.
   * @function that shows all social items for a particular order.
   * @param orderId String readable RD order id.
   * @param successCb Object function for success
   *
   */
  getSocialItems: function(orderId, successCb) {

      // Build a query from the object type.
      var DbObject = Parse.Object.extend('dbOrder');
      var query = new Parse.Query(DbObject);

      // Always sort newest first.
      query.descending("updatedAt");
      query.matches('readable_id', orderId);

      // Perform the queries and continue with the help of the callback functions.
      query.find({
          success: function(results) {
              successCb(results);
          },
          error: function(result, error) {
              console.log(error.message)
          }
      });
  },

  /**
  * Get social items from an order.
  * @function that shows all social items for a particular order.
  * @param orderId String readable RD order id.
  * @param successCb Object function for success
  *
  */
  getProductById: function(productId, res, store, successCb) {

      var Item = Parse.Object.extend('dbCatalogItem');
      var query = new Parse.Query(Item);

      query.get(productId, {
          success: function(result) {
              if (!result) {
                res.render('index.jade', store);
              } else {
                successCb(result.attributes);
              }
          },
          error: function(error) {
            res.render('index.jade', store);
          }
      });
  },

  /** Sort a dictionary by param **/
  sortDict: function(array, param) {

      // Sort the array based on a parameter contained within its
      // items.
      return array.sort(function(a,b) {
          if (a[param] < b[param]) {
              return -1;
          }
          if (a[param] > b[param]) {
              return 1;
          }
          return 0;
      });
  }
};
