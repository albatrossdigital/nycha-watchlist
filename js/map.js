
// Google api key
var key = "AIzaSyBkpY07SAQb2K0qZIFBsoPy9E4EIWH4DE8";

// Fusion tables table
var tableId = '1a7r8aJvudLxTQbqvcRYXyy1LupwmCv8SaMgtie4';

// Mapbox map id
var mapId = 'albatrossdigital.map-yaq188c8';


function fusionTables(id, callback) {
    function response(x) {
        if (!x || !x.rows) return [];
        return callback(x);
    }
    // enter  enter your google fusion tables api key below
    
    var query = 'SELECT development_name, borough, geo_latitude, geo_longitude, street_address, number FROM ' + id + ' ORDER BY number DESC LIMIT 10';
    var url = 'https://www.googleapis.com/fusiontables/v1/query?sql='+encodeURIComponent(query)+'&key=' + key + '&typed=false&callback=jsonp';
    $.ajax({
        url: url,
        dataType: 'jsonp',
        jsonpCallback: 'jsonp',
        success: response,
        error: response
    });
}

// enter the id of the fusion table you want to show on the map
        
fusionTables(tableId, function(data) {
    // enter the MapBox map id you want to display on the page

    var map = L.mapbox.map('map', mapId)
        .setView([40.7146, -74.0066], 12);
console.log(data);
    for (var i = 0; i < data.rows.length; i++) {
        var entry = data.rows[i];
        var description = '<div class="popupWrapper">'
            + '<div class="item addressWrapper"><h2>'+entry[0]+'</h2>'+entry[4]+'<br/>'+entry[1]+'<button class="btn btn-small pull-right" onclick="showData()" id="showData">See Data</button></div>'
            + '<div class="imageWrapper pull-left"><img src="http://maps.googleapis.com/maps/api/streetview?size=150x120&location='+entry[2]+','+entry[3]+'&sensor=false" alt="Google StreetView Image @copy Google" /></div>'
            + '<div class="item dataItem"><span class="dataTitle">Total requests:</span> <span class="dataValue highlighted">' + entry[5] + '</span></div>'
            + '<div class="item dataItem daysWrapper"><span class="dataTitle">Average Days Outstanding:</span> <span class="dataValue">' + entry[5] + '</span></div>'
            + '</div>';
        var size = Math.round(entry[5]/25) + 1;

        var marker = L.marker(new L.LatLng(parseFloat(entry[2]), parseFloat(entry[3])), {
            icon: L.icon({
                iconUrl: 'circle.png',
                iconSize:     [size, size],
                iconAnchor:   [size/2, size/2],
                popupAnchor:  [0, -(size/2 + 5)]
            }),
            title: entry[0],
            opacity: .8,
            size: size
        }).bindPopup(description,{
            closeButton: true
        }).on('popupopen', function(e) {
            updateData(this.options.title);
        }).on('mouseover', function(e) {
            console.log(this);
            var size = this.options.size + 5;
            this.setOpacity(1);
            this.setIcon(L.icon({
                iconUrl: 'circle.png',
                iconSize:     [size, size],
                iconAnchor:   [size/2, size/2],
                popupAnchor:  [0, -(size/2 + 5)]
            }));
        }).on('mouseout', function(m) {
            console.log(this);
            var size = this.options.size;
            this.setOpacity(.8);
            this.setIcon(L.icon({
                iconUrl: 'circle.png',
                iconSize:     [size, size],
                iconAnchor:   [size/2, size/2],
                popupAnchor:  [0, -(size/2 + 5)]
            }));
        }).addTo(map);
        console.log(marker);
    }

});

