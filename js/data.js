// Fusion Tables table id
var dataTable = '1hJrbnJVLKd6FnVABrp7r8zyzoUkq3nuM-j8lRgE';

// This is the Fusion Tables column that all of the lookups from the map are keyed on
var keyCol = "'DEVELOPMENT NAME'"

var vizColors = ['#394553', '#acacac', '#4aa6d7', '#c5dffa', '#ff792f', '#fdc689', '#7cc576', '#9476c5', '#f8b3d1'];


google.load('visualization', '1', { packages: ['table', 'controls'] });


// Placeholder
var dataActive = false;
var activeTab = 'pie';
var activeKey = '';
var googLoaded = false;

// This is called from map.js when a marker is clicked
function updateData(key, address) {
  if (dataActive) {
    drawData(key);
  }
  jQuery('#dataTitle').html('<h2>REQUEST DETAILS FOR '+key+'<span>, '+address+'</span></h2>');
  activeKey = key;
}

// Called from the onClick attribute in the show data button in map popups
function showData() {
  dataActive = true;
  var height = $(window).height();
  jQuery('#data').css('margin-top', height+'px').show().animate({'margin-top': Math.round(height*.65) +'px'}, 1000);
  drawData(activeKey);
}

// Data tabs
jQuery('#nav li a').bind('click', function() {
  activeTab = jQuery(this).attr('href').replace('#', '');
  drawData(activeKey);
  return false;
});


function drawData(key) {
  activeKey = key;

  if (activeTab == 'pie') {
    jQuery('#pieChart1, #pieChart2').show();
    if (jQuery('#pieChart1, #pieChart2').attr('data-key') !=key) {
      jQuery('#pieChart1, #pieChart2').attr('data-key', key);
      jQuery('#pieChart1').makeLoading();
      jQuery('#pieChart2').html('');
      drawPie(key);
    }
    jQuery('#dashboard').hide();
  }
  else {
    jQuery('#dashboard').show();
    if (jQuery('#pieChart1, #pieChart2').attr('data-key') !=key || jQuery('#pieChart1, #pieChart2').attr('data-tab') != activeTab) {
      drawTable();
    }
    jQuery('#pieChart1, #pieChart2').hide();
    jQuery('#dashboard').attr('data-key', key).attr('data-tab', activeTab);
  }
  jQuery('#nav li').removeClass('active');
  jQuery('#nav li a[href="#'+activeTab+'"]').parent().addClass('active');
}

jQuery.fn.makeLoading = function() {
  jQuery(this).html('Loading...');
}


// Hide data button in the data header
jQuery('#hideData').bind('click', function() {
  dataActive = false;
  jQuery('#data').animate({'margin-top': $(window).height()+'px'}, 1000).fadeOut();
})


function drawTable() {
  var keyVal = activeKey;

  // Prepare the data                      
  var query = "SELECT * FROM " + dataTable;
  //
  if (key != undefined) {
    query += " WHERE "+keyCol+" = '" + keyVal + "'";
  }

  // enter  enter your google fusion tables api key below
  //var query = "SELECT 'REPAIR CATEGORY', COUNT(), SUM('DAYS OUTSTANDING') FROM " + dataTable + " WHERE "+keyCol+" = '" + keyVal + "' GROUP BY 'REPAIR CATEGORY'";
  var url = 'https://www.googleapis.com/fusiontables/v1/query';
  var data = {'key': key, 'sql': query};

  $.ajax({
    url: url,
    data: data,
    dataType: 'jsonp',
    jsonpCallback: 'jsonp',
    success: response,
    error: response
  });

  
  function response(x) {

    var data = new google.visualization.DataTable();

    _.each(x.columns, function(colName) {
      var type = (colName == 'DATE REPORTED') ? 'date' : (colName == 'DAYS OUTSTANDING') ? 'number' : 'string';
      data.addColumn(type, colName);
    })
    var compareDate = new Date(1950, 1, 1);
    for (var i = 0; i < x.rows.length; i++) {
      x.rows[i][5] = new Date(x.rows[i][5]);
      x.rows[i][5] = x.rows[i][5] < compareDate ? new Date(x.rows[i][5].setFullYear(x.rows[i][5].getFullYear() + 100)) : x.rows[i][5];
      x.rows[i][6] = parseInt(x.rows[i][6]);
    }
    data.addRows(x.rows);

    var daysPicker = new google.visualization.ControlWrapper({
      'controlType': 'NumberRangeFilter',
      'containerId': 'daysControl',
      'options': {
        'filterColumnLabel': 'DAYS OUTSTANDING',
        'ui': {
        'labelStacking': 'vertical',
          'allowTyping': false,
          'allowMultiple': false
        }
      }
    }); 

    var categoryPicker = new google.visualization.ControlWrapper({
      'controlType': 'CategoryFilter',
      'containerId': 'categoryControl',
      'options': {
        'filterColumnLabel': 'REPAIR CATEGORY',
        'ui': {
        'labelStacking': 'vertical',
          'allowTyping': false,
          'allowMultiple': true
        }
      }
    });

    var detailPicker = new google.visualization.ControlWrapper({
      'controlType': 'StringFilter',
      'containerId': 'detailControl',
      'options': {
        'filterColumnLabel': 'ITEM DETAIL',
        'ui': {
        'labelStacking': 'vertical',
          'allowTyping': true
        }
      }
    });

    // Define a Table
    var dataChart = new google.visualization.ChartWrapper({
      'chartType': 'Table',
      'containerId': 'dashboardData',
      'options': {
        //'height': 630,
        //'width': window.innerWidth -68,
        'page': 'enable',
        'pageSize': 25,
        'alternatingRowStyle': true,
        'sortColumn': 6,
        'sortAscending': false,
        'cssClassNames': {headerRow: 'table-header-background', tableRow: 'table-row', oddTableRow: 'odd-table-row', selectedTableRow: 'google-hover-table-row', hoverTableRow: 'google-hover-table-row', headerCell: 'table-header-background', tableCell: '', rowNumberCell: ''}
      },
      //'view': {'columns': [0, 1]}
    });

    // Create a dashboard
    new google.visualization.Dashboard(document.getElementById('dashboard')).
      bind(daysPicker, dataChart).
      bind(categoryPicker, dataChart).
      bind(detailPicker, dataChart).
      draw(data);

  }

}



function drawPie(keyValue) {

  function response(x) {
    if (!x || !x.rows) return [];
    var category = [['', '']];
    var outstanding = [['Category'], ['']];

    _.each(x.rows, function(value) {
      category.push([value[0], parseInt(value[1])]);
      outstanding[0].push(value[0]);
      outstanding[1].push(parseInt(value[2]/value[1]));
    });

    google.visualization.drawChart({
      containerId: 'pieChart1',
      dataTable: category,
      chartType: 'PieChart',
      options: {
        title: 'Oustanding Requests by Category',
        'width': 350,
        'height': 400,
        'is3D': true,
        'tooltip': {showColorCode: true},
        legend: {position: 'none'},
        chartArea: {width:"80%",height:"80%"},
        colors: vizColors
      }
    });
    google.visualization.drawChart({
      containerId: 'pieChart2',
      dataTable: outstanding,
      chartType: 'BarChart',
      options: {
        title: 'Average Days Outstanding per Category',
        'width': 650,
        'height': 400,
        'is3D': true,
        'tooltip': {showColorCode: true},
        pieSliceText: 'value',
        vAxis: {title: "Category"},
        hAxis: {title: "Average Days Outstanding"},
        chartArea: {width:"50%"},
        colors: vizColors
      }
    });

  }
  // enter  enter your google fusion tables api key below
  var query = "SELECT 'REPAIR CATEGORY', COUNT(), SUM('DAYS OUTSTANDING') FROM " + dataTable + " WHERE "+keyCol+" = '" + keyValue + "' GROUP BY 'REPAIR CATEGORY'";
  var url = 'https://www.googleapis.com/fusiontables/v1/query';
  var data = {'key': key, 'sql': query};

  $.ajax({
    url: url,
    data: data,
    dataType: 'jsonp',
    jsonpCallback: 'jsonp',
    success: response,
    error: response
  });

}

