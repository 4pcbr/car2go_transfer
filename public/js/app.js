(function() {
	require.config({
		baseUrl:   '/js/',
		paths: {
			jquery:    '//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min',
			bootstrap: '//maxcdn.bootstrapcdn.com/bootstrap/3.3.4/js/bootstrap.min',
		},
	});
	
	require(['jquery', 'bootstrap'], function() {
		require(['timeline', 'main']);
	});
})();