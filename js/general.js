var activeBorough;


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
  fusionTables(mapTable, drawMarkers);
  
}
