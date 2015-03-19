// RetroDuck namespace.
var retroduck = retroduck || {};

/**
 * Menu module
 * @module that contains some functions that help the menu behave properly.
 *
 */
retroduck.menu = {

  show: function() {
    $('.menuLinks').attr('class', 'menuLinks visible');
    $('.closeMobileMenu').show();
    $('.menuCartAndUser').hide();
    $(document.body).attr('class', 'modal-open');
    retroduck.utils.hideAllModals();
    setTimeout(function() {
      $('.whiteOut')
        .show()
        .click(function() {
          retroduck.menu.hide();
        });
    }, 300);
  },

  hide: function() {
    $('.menuLinks').attr('class', 'menuLinks hidden');
    $('.closeMobileMenu').hide();
    $('.whiteOut').hide();
    retroduck.utils.hideAllModals();
    $(document.body).attr('class', '');
    setTimeout(function() {
      $('.menuCartAndUser').show();
    }, 300);
  }

};


// Show menu when user clicks menu bars.
$('.fa-bars').click(function() {
  retroduck.menu.show();
});

// Hide menu when user clicks close button.
$('.closeMobileMenu').click(function() {
  retroduck.menu.hide();
});
