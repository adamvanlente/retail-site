// Config module.
var config 				= require('./config');

// Init parse.
var Parse 				= require('parse').Parse;
Parse.initialize(config.key, config.token);

// Module for requests.
module.exports = {

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

        var storeObject 				    = {};
        storeObject.title 			    = store.store_title.store_title;;
        storeObject.keywords 		    = store.meta_keywords.meta_keywords;
        storeObject.description	    = store.meta_description.meta_description;
        storeObject.header 			    = store.header.header_body;
        storeObject.footer 			    = store.footer.footer_body;
        storeObject.body			      = store.homepage_body.homepage_body;
        storeObject.custom_pages    = store.custom_pages;
        storeObject.attributes      = store;

        // Return store object.
        successCb(storeObject);
      },
      error: function(result, error) {
        console.log(error.message)
      }
    });
  }

};
