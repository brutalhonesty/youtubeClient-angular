youtubeApp.service('SearchYoutube', ['$http', function ($http) {
	return {
		search: function(query) {
			return $http.post('/youtube/searchYoutube', {'q': query});
		}
	}
}]);
youtubeApp.service('UpdateToken', ['$http', function ($http) {
	return {
		update: function(token) {
			return $http.post('/youtube/updateToken', {'oauth': token});
		}
	}
}]);
youtubeApp.service('Index', ['$http', function ($http) {
	return $http.get('/youtube/index');
}]);