// RetroDuck namespace.
var retroduck = retroduck || {};

/**
 * Products module
 * @module that contains helper functions for product pages.
 *
 */
retroduck.product = {


};

/** Add listeners to all product buttons that are found. **/
$('.rsProduct--addItemButton__addToCart').each(function() {
  $(this).click(function(e) {
    retroduck.cart.addItemToCart(e);
  });
});
