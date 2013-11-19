youtubeApp.controller('MainCtrl', ['$scope', 'Index', function ($scope, Index) {
	Index.success(function (data) {
		$scope.videos = data.videos;
	}).error(function (error) {
		$scope.error = error.error;
	});
}]);
youtubeApp.controller('SearchCtrl', ['$scope', function ($scope) {
	
}]);