youtubeApp.directive('search', ['SearchYoutube', function (SearchYoutube) {
	return {
		restrict: 'A',
		link: function($scope, element) {
			element.keyup(function(event){
		    	if(element.val().length > 0 && event.keyCode === 13){
		    		// Show the Searching... label
		    		element.siblings('label').fadeIn('fast', function () {
		    			element.siblings('label').text('Searching');
		    			var timeout = setInterval(function (){
		    				var searchText = element.siblings('label').text();
		    				element.siblings('label').text(searchText + '.');
		    				if(searchText.indexOf('..') !== -1) {
		    					clearTimeout(timeout);
		    				}
		    			}, 1000);
		    		});
		    		SearchYoutube.search(element.val()).success(function (data) {
		    			// Use search results to repopulate the cards
	    				$scope.videos = data;
	    				//$scope.youtube.searchResults = data;
		    			element.siblings('label').fadeOut('fast');
		    		}).error(function (error) {
		    			element.siblings('label').text(error.message);
		    		});
		    	}
		    });
		}
	}
}]);
youtubeApp.directive('videos', function () {
	return {
		restrict: 'A',
		link: function($scope, element, attrs) {
			$scope.$watch('videos', function (videoData) {
				if(videoData) {
					element.parent().children('.card:nth-child(even)').addClass('animated rotateInUpLeft');
					element.parent().children('.card:nth-child(odd)').addClass('animated rotateInUpRight');
					/* TODO: Fix this!
					element.parent().children('.card:nth-child(even)').removeClass('animated rotateInUpLeft');
					element.parent().children('.card:nth-child(odd)').removeClass('animated rotateInUpRight');
					element.parent().children('.card:nth-child(odd)').addClass('animated rotateOutUpLeft');
					element.parent().children('.card:nth-child(even)').addClass('animated rotateOutUpRight');
					 */
				}
			});
		}
	}
});
youtubeApp.directive('tokenStale', ['UpdateToken', function (UpdateToken) {
	return {
		restrict: 'A',
		link: function($scope, element) {
			$scope.$watch('tokenError', function () {
				var countdown = 3;
				var interval = setInterval(function () {
					if(countdown === 0) {
						clearInterval(interval);
						OAuth.initialize(localStorage.getItem('oauth_key'));
						OAuth.popup('youtube', function (error, oauthData){
							if(error) {
								$scope.error = error;
							} else {
								localStorage.setItem('oauth_token', oauthData.access_token);
								UpdateToken.update(oauthData.access_token).success(function (data) {
									console.log(data);	
								}).error(function (error) {
									console.log(error);
								});
							}
						});
					}
					element.children('span').text(countdown--);
				}, 1000);
			});
		}
	}
}]);