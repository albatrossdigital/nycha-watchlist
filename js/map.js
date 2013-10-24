
// Google api key
var key = "AIzaSyBkpY07SAQb2K0qZIFBsoPy9E4EIWH4DE8";

// Fusion tables table
var mapTable = '1iN1T8x_WjDqWMcBpsaRpAjMhfOUovvQR7XDT5C8';

// Mapbox map id
var mapId = 'albatrossdigital.map-yaq188c8';

var map, timeout, data;
var markers = [];
var playing = true;
var currentMarker = 0;
setView = false;


function fusionTables(id, callback) {
  function response(x) {
    if (!x || !x.rows) return [];
    return callback(x);
  }
  // enter  enter your google fusion tables api key below
  
  activeCategory = (activeCategory == undefined) ? '' : activeCategory
  var query = 'SELECT development_name, geo_latitude, geo_longitude, street_address, borough, total, avg_days, total_old, avg_days_old FROM '+ id +" WHERE categories = '" + activeCategory + "' ORDER BY total DESC";
  var url = 'https://www.googleapis.com/fusiontables/v1/query?sql='+encodeURIComponent(query)+'&key=' + key + '&typed=false&callback=jsonp';

  $.ajax({
    url: url,
    dataType: 'jsonp',
    jsonpCallback: 'jsonp',
    success: response,
    error: response
  });
}


var drawMarkers = function(newData) {
  if (newData != undefined) {
    data = newData;
  }
  
  var j = 0;
  jQuery('#building-list').html('');
  var scaler = (activeCategory == 'undefined' || activeCategory == '') ? scaler = 150 : scaler = 40;
  for (var i = 0; i < data.rows.length; i++) {
    var entry = data.rows[i];
    if (activeBorough == undefined || activeBorough == 'All' || activeBorough == '' || activeBorough == entry[4]) {
      var deltaTotal = entry[5] - entry[7];
      var totalText = (activeCategory == undefined || activeCategory == '') ? 'Total' : '';
      deltaTotal = deltaTotal > 0 ? '<span class="red"><span class="icon icon-arrow-up"></span>' + deltaTotal +"</span>" : '<span class="green"><span class="icon icon-arrow-down"></span>' + Math.abs(deltaTotal) +"</span>";
      var deltaAvg = parseInt(entry[6] - entry[8]);
      deltaAvg = deltaAvg >= 0 ? '<span class="red"><span class="icon icon-arrow-up"></span>' + deltaAvg +"</span>" : '<span class="green"><span class="icon icon-arrow-down"></span>' + Math.abs(deltaAvg) +"</span>";
      var description = '<div class="popupWrapper" onclick="showData();stopCycle();">'
        + '<div class="item addressWrapper"><div class="ranking pull-right"><span>#</span>'+(j+1)+'</div><h2>'+entry[0]+'</h2>'+entry[3]+'<br/>'+entry[4]+'<button class="btn btn-small btn-primary pull-right" id="showData">See Details</button></div>'
        + '<div class="imageWrapper pull-left"><img src="http://maps.googleapis.com/maps/api/streetview?size=150x122&location='+encodeURIComponent(entry[3]+','+entry[4])+'&sensor=false" height="122" width="150" alt="Google StreetView Image @copy Google" /></div>'
        + '<div class="item dataItem"><span class="dataTitle">'+ totalText +' Outstanding Requests: <span>Change since 2/15/13</span></span> <span class="dataValue highlighted">' + entry[5] + '<span class="deltaDataValue">' + deltaTotal + '</span></span></div>'
        + '<div class="item dataItem daysWrapper"><span class="dataTitle">Average Days Outstanding: <span>Change since 2/15/13</span></span> <span class="dataValue">' + parseInt(entry[6]) + '<span class="deltaDataValue">' + deltaAvg + '</span></span></div>'
        + '</div>';
      var size = Math.round(entry[5]/scaler) + 5;

      var marker = L.marker(new L.LatLng(parseFloat(entry[1]), parseFloat(entry[2])), {
        icon: L.icon({
          iconUrl: 'circle.png',
          iconSize:   [size, size],
          iconAnchor:   [size/2, size/2],
          popupAnchor:  [0, -(size/2 + 5)]
        }),
        title: entry[0]+', '+entry[5]+' outstanding requests',
        name: entry[0],
        address: entry[3]+', '+entry[4],
        i: j,
        opacity: .7,
        size: size
      }).bindPopup(description,{
        closeButton: true
      }).on('popupopen', function(e) {
        jQuery('#building-list .item').removeClass('active');
        jQuery('#building-list #building-' + this.options.i).addClass('active');
        updateData(this.options.name, this.options.address);
      }).on('popupclose', function(e) {
        jQuery('#building-list .item').removeClass('active');
      }).on('mouseover', function(e) {
        var size = this.options.size + 5;
        this.setOpacity(1);
        this.setIcon(L.icon({
          iconUrl: 'circle.png',
          iconSize:   [size, size],
          iconAnchor:   [size/2, size/2],
          popupAnchor:  [0, -(size/2 + 5)]
        }));
      }).on('mouseout', function(m) {
        var size = this.options.size;
        this.setOpacity(.8);
        this.setIcon(L.icon({
          iconUrl: 'circle.png',
          iconSize:   [size, size],
          iconAnchor:   [size/2, size/2],
          popupAnchor:  [0, -(size/2 + 5)]
        }));
      }).addTo(map);
      markers.push(marker);

      // Add data to the
      if (j < 20) {
        var stripe = (Math.round(j/2) == j/2) ? 'even' : 'odd';
        $('<div class="item addressWrapper '+ stripe +'" id="building-'+ j +'"><div class="ranking pull-left dataValue highlighted">'+entry[5]+'</div><strong>'+entry[0]+'</strong><br/>'+entry[3]+'<br/>'+entry[4]).appendTo('#building-list');
        jQuery('#building-list .item').bind('click', function() {
          currentMarker = parseInt(jQuery(this).attr('id').replace('building-', ''));
          showMarker();
          stopCycle();
          return false;
        })
      }
      j++;
    }
  } //for


  currentMarker = 0;
  nextMarker(0);
  setView = true;
  jQuery('#map').animate({opacity: 1}, 'slow');
};


// Draw the map and markers
this.map = L.mapbox.map('map', mapId, {
    scrollWheelZoom: false
  })
this.map
  .setView([40.84030757074791, -73.90108108520506], 12)
  .addControl(L.mapbox.shareControl());

// Add the geosearch control
new L.Control.GeoSearch({
    provider: new L.GeoSearch.Provider.Google(),
    zoomLevel: 15,
    searchLabel: 'Find buildings near you. Enter your address or zipcode.'
}).addTo(map);

// Add the locate button
jQuery('<button class="btn" id="geocode" onclick="locateUser();"><span class="icon-map-marker"></span>Get my location</button>').appendTo('#map .leaflet-top.leaflet-center');
function locateUser() {
  this.map.locate({setView: true});
}

// Make it faded out until the data arrives
jQuery().css({opacity: .1});


jQuery('#playPause').bind('click', function(){
  jQuery(this).toggleClass('active');
  if (jQuery(this).hasClass('active')) {
    cycle();
  }
  else {
    stopCycle();
  }
  return false;
});

jQuery('#prev').bind('click', function(){
  stopCycle();
  nextMarker(-1);
  return false;
})

jQuery('#next').bind('click', function(){
  stopCycle();
  nextMarker(1);
  return false;
})



// Open popup when user mouses over a marker

function cycle() {
  function run() {
    nextMarker(1);
    timeout = window.setTimeout(run, 5000);
  }
  run();
}

function nextMarker(direction) {
  currentMarker += direction;
  if (currentMarker > markers.length - 1) currentMarker = 0;
  if (currentMarker < 0) currentMarker = markers.length - 1;
  showMarker();
}

function showMarker() {
  if (setView == undefined || setView != false) {
    var latlon = markers[currentMarker].getLatLng();
    map.setView(latlon, 14);
  }
  markers[currentMarker].openPopup();
}

function stopCycle() {
  window.clearTimeout(timeout);
  jQuery('#pausePlay').removeClass('active');
}
