(function() {
	
	var MAP_DIV_ID 			= 'map';
	var API_URI_CARS 		= '/api/cars';
	var API_URI_CAR_STOPS 	= '/api/car_stops';
  var TIME_LABEL_ID   = 'time_label';

  var whiteMarkerIcon = {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: '#FFF',
    strokeColor: '#000',
    strokeWeight: 1,
    scale: 5,
    fillOpacity: 1.0,
  };
  var blueMarkerIcon  = {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: '#3333FF',
    strokeColor: '#000',
    strokeWeight: 1,
    scale: 7,
    fillOpacity: 1.0,
  };
  var $timeLabel      = $('#' + TIME_LABEL_ID);
	
	function init_map(cb) {
		var map_opts = {
			center: { lat: 52.365066, lng: 4.890100 },
			zoom: 13
		};
		var map = new google.maps.Map($('#' + MAP_DIV_ID)[0], map_opts);
		var def = $.Deferred();
		return def.resolve(map);
	}
	
	$(function() {
		init_map().then(function(map) {
			$.getJSON(API_URI_CARS).then(function(json_data_cars) {
				$.getJSON(API_URI_CAR_STOPS).then(function(json_data_car_stops) {
					var car_tuples = {};
					$.each(json_data_cars, function(_, car) {
						car_tuples[car.id] = {
							car:      car,
							timeline: []
						};
					});
					$.each(json_data_car_stops, function(_, car_stop) {
						var car_id = car_stop.car_id;
						if (!car_tuples[car_id]) {
							console.warn('No car with id %d found', car_id);
							return;
						}
						var timeline = car_tuples[car_id].timeline;
						timeline.push(car_stop);
					});
					
					var timeline = new Timeline({
						speed: 1000.0,
            animation_speed: 1.0,
            // animation_duration: 2000,
            tick: function() {
              $timeLabel.text(moment(this.time * 1000).format('DD MMM, HH:mm:ss'));
            }
					});

					var minTimestamp = null;

					$.each(car_tuples, function(car_id, car_tuple) {
						var firstPos = car_tuple.timeline[0]; // FIXME
            if (!firstPos) {
              return;
            };
						var marker = new google.maps.Marker({
							map: map,
							position: {
								lat: firstPos.lon,
								lng: firstPos.lat,
							},
              icon: whiteMarkerIcon,
						});
            google.maps.event.addListener(marker, 'click', function() {
              console.log("car_id: ", car_id);
            })
						var sequence = [];
						$.each(car_tuple.timeline, function(_, timeline_obj) {
							var timestamp = timeline_obj.timestamp;
							if (!minTimestamp || (minTimestamp > timestamp)) {
								minTimestamp = timestamp;
							}
              var pos = {
                lat:  timeline_obj.lon,
                lon:  timeline_obj.lat,
              };
							sequence.push({
								time:    timestamp,
								pos:     pos,
                start:   function() {
                  marker.setIcon(blueMarkerIcon);
                },
								step:    function(pos) {
                  marker.setPosition({ lat: this.lat, lng: this.lon });
								},
                finish:  function() {
                  marker.setIcon(whiteMarkerIcon);
                },
							});
						});
						timeline.addSequence(sequence);
					});
					timeline.setStartTime(minTimestamp);
					timeline.play();
				});
			})
		});
	});
	
})();
