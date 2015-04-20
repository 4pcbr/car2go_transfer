(function() {
	
	var MAP_DIV_ID 			= 'map';
	var API_URI_CARS 		= '/api/cars';
	var API_URI_CAR_STOPS 	= '/api/car_stops';
	
	function init_map(cb) {
		var map_opts = {
			center: { lat: 52.365066, lng: 4.890100 },
			zoom: 13
		};
		var map = new google.maps.Map($('#' + MAP_DIV_ID)[0], map_opts);
		var def = $.Deferred();
		return def.resolve();
	}
	
	$(function() {
		init_map().then(function() {
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
					
					console.log(car_tuples);
				});
			})
		});
	});
	
})();