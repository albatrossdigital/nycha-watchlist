
// Google api key
var key = "AIzaSyBkpY07SAQb2K0qZIFBsoPy9E4EIWH4DE8";

// Fusion tables table
var mapTable = '1i9RyaduL6-eh9MC5dq1e49-4MN1bvHG8hX0bt4A';

// Mapbox map id
var mapId = 'albatrossdigital.map-yaq188c8';

var map, timeout, data;
var markers = [];
var playing = true;
var currentMarker = 0;



function fusionTables(id, callback) {
  function response(x) {
    if (!x || !x.rows) return [];
    return callback(x);
  }
  // enter  enter your google fusion tables api key below
  
  var query = 'SELECT development_name, geo_latitude, geo_longitude, street_address, borough, total, avg_days FROM '+ id +' ORDER BY total DESC';
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
  for (var i = 0; i < data.rows.length; i++) {
    var entry = data.rows[i];
    if (activeBorough == undefined || activeBorough == 'All' || activeBorough == '' || activeBorough == entry[4]) {
      var description = '<div class="popupWrapper" onclick="showData();stopCycle();">'
        + '<div class="item addressWrapper"><div class="ranking pull-right"><span>#</span>'+(j+1)+'</div><h2>'+entry[0]+'</h2>'+entry[3]+'<br/>'+entry[4]+'<button class="btn btn-small pull-right" id="showData">See Details</button></div>'
        + '<div class="imageWrapper pull-left"><img src="http://maps.googleapis.com/maps/api/streetview?size=150x122&location='+entry[1]+','+entry[2]+'&sensor=false" height="122" width="150" alt="Google StreetView Image @copy Google" /></div>'
        + '<div class="item dataItem"><span class="dataTitle">Total Outstanding Requests:</span> <span class="dataValue highlighted">' + entry[5] + '</span></div>'
        + '<div class="item dataItem daysWrapper"><span class="dataTitle">Average Days Outstanding:</span> <span class="dataValue">' + parseInt(entry[6]) + '</span></div>'
        + '</div>';
      var size = Math.round(entry[5]/200) + 5;

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
          markers[parseInt(jQuery(this).attr('id').replace('building-', ''))].openPopup();
          stopCycle();
          return false;
        })
      }
      j++;
    }
  } //for


  currentMarker = 0;
  nextMarker(0);
};


// Draw the map and markers
map = L.mapbox.map('map', mapId, {
    scrollWheelZoom: false
  })
map
  .setView([40.7146, -74.0066], 13)
  .addControl(L.mapbox.geocoderControl(mapTable))
  //.on('zoomstart', function(e){
  //  if (!init) {
  //     stopCycle(); 
  //  }
  //  init = true;
  //});


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
  map.setView(markers[currentMarker].getLatLng(), 12);
  markers[currentMarker].openPopup();
}

function stopCycle() {
  window.clearTimeout(timeout);
  jQuery('#pausePlay').removeClass('active');
}
