var activeBorough;
var activeCategory;
var filter = '';

// Look and see if we need to limit queries
/*if (window.location.search) {
  var querystring = window.location.search.replace('?', '');
  if (isNumeric(querysring)) {
    filter = ''
  }
}*/


// Draw initial markers
if(window.location.hash) {
  setActiveBorough(window.location.hash.replace('#', ''));
}
else {
  setActiveBorough('');
}

jQuery('#borough-tabs li a').bind('click', function(){
  setActiveBorough($(this).attr('href').replace('#', ''), $(this).text());
})

function setActiveBorough(borough) {
  activeBorough = borough.toUpperCase();
  activeCategory = jQuery('#category').val();
  jQuery('#borough-tabs li a').removeClass('active');
  jQuery('#borough-tabs li a[href="#'+ borough +'"]').addClass('active');
  _.each(markers, function(marker, index) {
    map.removeLayer(marker);
    markers[index] = undefined;
  });
  markers = [];
  var title = (activeBorough == '') ? "NYC" : (activeBorough == 'BRONX') ? 'THE BRONX' : activeBorough;
  title = (title == 'QUEENS') ? title + "'" : title + "'s";
  jQuery('#right-bar-location').text(title);
  jQuery('#right-bar-category').text(activeCategory == '' ? 'All repair categories' : 'Filtered by ' + activeCategory.toLowerCase() + ' repairs');
  fusionTables(mapTable, drawMarkers);
}

jQuery('#category').bind('change', function(){
  setActiveBorough(activeBorough);
})


// Add AD attribution
jQuery('<span>Built by <a href="http://albatrossdigital.com" title="Albatross Digital">Albatross Digital</a> | </span>').prependTo('.leaflet-control-attribution')

// Responsive media queries for mobile menu
var queries = [
{
  context: 'mobile',
    match: function() {
      jQuery('.outside-links, #borough-tabs').removeClass('nav-pills').addClass('nav-list');
    },
    unmatch: function() {
      jQuery('.outside-links, #borough-tabs').addClass('nav-pills').removeClass('nav-list');
      jQuery('.menu').show();
    }
}
];
MQ.init(queries);

jQuery('#show-menu').bind('click', function() {
  jQuery('.menu').slideToggle();
  jQuery(this).toggleClass('active');
})
