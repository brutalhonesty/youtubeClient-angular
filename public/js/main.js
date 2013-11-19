var youtubeApp = angular.module('youtubeApp', ['ngRoute']);
youtubeApp.config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
	$routeProvider.when('/', {
      controller: 'MainCtrl'
    }).when('/search/:query', {
      controller: 'SearchCtrl'
    }).when('/video/:id', {
      controller: 'VideCtrl'
    }).otherwise({
      redirectTo: '/'
    });
}]);