
// Google api key
var key = "AIzaSyBkpY07SAQb2K0qZIFBsoPy9E4EIWH4DE8";

// Fusion tables table
var mapTable = '1dc8sSSIkvJa-Q7zDNz1VAHZaaKvZyfLWzRP1vtM';

// Mapbox map id
var mapId = 'albatrossdigital.map-yaq188c8';

var map, timeout;
var markers = [];
var playing = true;


function fusionTables(id, callback) {
    function response(x) {
        if (!x || !x.rows) return [];
        return callback(x);
    }
    // enter  enter your google fusion tables api key below
    
    var query = 'SELECT development_name, geo_latitude, geo_longitude, street_address, borough, total, avg_days FROM ' + id + ' ORDER BY total DESC';
    var url = 'https://www.googleapis.com/fusiontables/v1/query?sql='+encodeURIComponent(query)+'&key=' + key + '&typed=false&callback=jsonp';
    console.log(url);
    $.ajax({
        url: url,
        dataType: 'jsonp',
        jsonpCallback: 'jsonp',
        success: response,
        error: response
    });
}

   
fusionTables(mapTable, function(data) {

    map = L.mapbox.map('map', mapId, {
        scrollWheelZoom: false
    })
    map
        .setView([40.7146, -74.0066], 13)
        .addControl(L.mapbox.geocoderControl(mapTable))
        //.on('zoomstart', function(e){
        //    if (!init) {
        //       stopCycle(); 
        //    }
        //    init = true;
        //});

    for (var i = 0; i < data.rows.length; i++) {
        var entry = data.rows[i];
        var description = '<div class="popupWrapper">'
            + '<div class="item addressWrapper"><div class="ranking pull-right"><span>#</span>'+i+'</div><h2>'+entry[0]+'</h2>'+entry[3]+'<br/>'+entry[4]+'<button class="btn btn-small pull-right" onclick="showData();stopCycle();" id="showData">See Details</button></div>'
            + '<div class="imageWrapper pull-left"><img src="http://maps.googleapis.com/maps/api/streetview?size=150x120&location='+entry[1]+','+entry[2]+'&sensor=false" alt="Google StreetView Image @copy Google" /></div>'
            + '<div class="item dataItem"><span class="dataTitle">Total Outstanding Requests:</span> <span class="dataValue highlighted">' + entry[5] + '</span></div>'
            + '<div class="item dataItem daysWrapper"><span class="dataTitle">Average Days Outstanding:</span> <span class="dataValue">' + parseInt(entry[6]) + '</span></div>'
            + '</div>';
        var size = Math.round(entry[5]/200) + 5;

        var marker = L.marker(new L.LatLng(parseFloat(entry[1]), parseFloat(entry[2])), {
            icon: L.icon({
                iconUrl: 'circle.png',
                iconSize:     [size, size],
                iconAnchor:   [size/2, size/2],
                popupAnchor:  [0, -(size/2 + 5)]
            }),
            title: entry[0]+', '+entry[5]+' outstanding requests',
            name: entry[0],
            opacity: .7,
            size: size
        }).bindPopup(description,{
            closeButton: true
        }).on('popupopen', function(e) {
            updateData(this.options.name);
        }).on('mouseover', function(e) {
            var size = this.options.size + 5;
            this.setOpacity(1);
            this.setIcon(L.icon({
                iconUrl: 'circle.png',
                iconSize:     [size, size],
                iconAnchor:   [size/2, size/2],
                popupAnchor:  [0, -(size/2 + 5)]
            }));
        }).on('mouseout', function(m) {
            var size = this.options.size;
            this.setOpacity(.8);
            this.setIcon(L.icon({
                iconUrl: 'circle.png',
                iconSize:     [size, size],
                iconAnchor:   [size/2, size/2],
                popupAnchor:  [0, -(size/2 + 5)]
            }));
        }).addTo(map);
        markers.push(marker);
    }

    cycle();
});

jQuery('#pausePlay').bind('click', function(){
    jQuery(this).toggleClass('active');
    if (jQuery(this).hasClass('active')) {
        cycle();
    }
    else {
        stopCycle();
    }
})


// Open popup when user mouses over a marker
function cycle() {
    var i = 0;
    function run() {
        if (++i > markers.length - 1) i = 0;
        map.setView(markers[i].getLatLng(), 12);
        markers[i].openPopup();
        timeout = window.setTimeout(run, 5000);
    }
    run();
}

function stopCycle() {
    console.log('stop');
    window.clearTimeout(timeout);
    jQuery('#pausePlay').removeClass('active');
}
