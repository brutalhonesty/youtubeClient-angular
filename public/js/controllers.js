youtubeApp.controller('MainCtrl', ['$scope', 'Index', 'OauthAng', '$location', function ($scope, Index, OauthAng, $location) {
	if(!localStorage.getItem('oauth_key')) {
		OauthAng.getKey().success(function (data) {
			localStorage.setItem('oauth_key', data.key);
		}).error(function (data) {
			$scope.error = data.error;
		});
	} else if(!localStorage.getItem('oauth_token')) {
		$scope.tokenerror = 'Need to re-authenticate to Google, popup in ';
	} else {
		Index.success(function (data) {
			$scope.videos = data.videos;
		}).error(function (data) {
			$scope.tokenerror = data.error;
		});
	}
	$scope.displayVideo = function(event, videoID) {
		$location.path('/video/' + videoID);
	};
}]);
youtubeApp.controller('SearchCtrl', ['$scope', 'SearchYoutube', '$routeParams', function ($scope, SearchYoutube, $routeParams) {
	var query = $routeParams.query;
	SearchYoutube.search(query).success(function (data) {
		if(data.videos.length === 0) {
			$scope.error = 'No results found.';
		} else {
			$scope.videos = data.videos;
		}
	}).error(function (data) {
		$scope.error = data.message;
	});
	$scope.displayVideo = function(event, videoID) {
		$location.path('/video/' + videoID);
	};
}]);
youtubeApp.controller('VideoCtrl', ['$scope', '$routeParams', function ($scope, $routeParams) {
	var videoID = $routeParams.id;
	$scope.videoID = videoID;
}]);