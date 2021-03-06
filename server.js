var express = require('express')
, Youtube = require('youtube-api')
, iso8601 = require('./iso8601')
, ini = require('ini')
, fs = require('fs')
, app = express()
, configuration_handler = require('./lib/configuration-handler')
, config = ini.parse(fs.readFileSync('./configuration/config.ini', 'utf-8'));
var ipAddr = '127.0.0.1';
var serverPort = '3000';

app.use(express.compress());
app.use(express.urlencoded());
app.use(express.json());
app.use(express.logger('dev'));
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(__dirname + '/public', {maxAge: 86400000}));

app.get('/youtube/index', function (request, response, next) {
	Youtube.authenticate({
		type: "oauth",
		token: config.oauth
	});
	// TODO Currently uses most popular videos to display because getting personal activity feed has no view counts
	Youtube.videos.list({"part": "snippet,statistics,contentDetails", "chart": "mostPopular", "maxResults": 50}, function (error, activityData) {
		if( error instanceof Error ) {
			console.log('Error searching Youtube', error);
			response.json(500, {"error":'Problem getting content from YouTube.'});
			return;
		} else if(error) {
			response.json(500, {"error":'Need to re-authenticate to Google, popup in '});
			return;
		}
		parseVideoData(activityData, function (videos) {
			response.json({"videos": videos});
		});
	});
});
app.post('/youtube/updateToken', function (request, response, next) {
	config.oauth = request.body.oauth;
	configuration_handler.saveSettings(config, function () {
		response.json({message: 'Success'});
	});
});
app.post('/youtube/searchYoutube', function (request, response, next) {
	searchYoutube(request, function (error, searchResults) {
		if(error) {
			response.json({message: error}, 500);
		} else {
			parseVideoData(searchResults, function (videos) {
				response.json({'videos': videos});
			});
		}
	});
});
app.get('/youtube/getVideo', function (request, response, next) {
	getVideo(request, function (error, videoResult) {
		if(error) {
			response.json({message: error}, 500);
		} else {
			parseVideoData(videoResult, function (video) {
				response.json({'videos': video});
			});
		}
	});
});
app.get('/getKey', function (request, response, next) {
	if(config.oauthKey) {
		response.json({key: config.oauthKey});
	} else {
		response.json(500, {error: 'Oauth key missing in config file, please update!'});
	}
})
app.listen(serverPort, ipAddr, function () {
	console.log("Server has started on ip " + ipAddr + " on port " + serverPort);
});

/**
 * Searches youtube given the query as the input parameter from the POST request
 * @param  {Object}   req      The request from the user
 * @param  {Function} callback Callback function to send back
 * @return {Function} callback ^
 */
function searchYoutube(request, callback) {
	Youtube.authenticate({
		type: "oauth",
		token: config.oauth
	});
	Youtube.search.list({q: request.body.q, part: 'snippet', maxResults: 50}, function (error, result) {
		if(error) {
			return callback(error);
		}
		//return callback(null, );
		var videoArray = [];
		for(var videoCounter in result.items) {
			var videoId = result.items[videoCounter].id.videoId;
			videoArray.push(videoId);
		}
		Youtube.videos.list({part: 'snippet,statistics,contentDetails', id: videoArray.join(',')}, function (error, result) {
			return callback(null, result);
		});
	});
}

function getVideo(request, callback) {
	if(!request.query.id) {
		return callback('Missing ID');
	}
	Youtube.authenticate({
		type: "oauth",
		token: config.oauth
	});
	Youtube.videos.list({part: 'snippet,statistics,contentDetails', id: request.query.id}, function (error, result) {
		return callback(null, result);
	});
}

/*http://stackoverflow.com/a/8363049/1612721*/
function createDateString(createdDate) {
	return createdDate.getUTCFullYear() +"/"+
	("0" + (createdDate.getUTCMonth()+1)).slice(-2) +"/"+
	("0" + createdDate.getUTCDate()).slice(-2) + " " +
	("0" + createdDate.getUTCHours()).slice(-2) + ":" +
	("0" + createdDate.getUTCMinutes()).slice(-2) + ":" +
	("0" + createdDate.getUTCSeconds()).slice(-2) + " UTC";
}

function getDuration(iso8601Duration) {
	var durationInSeconds = iso8601.parseToTotalSeconds(iso8601Duration);
	return Math.floor(durationInSeconds/60) + ':' + ('0' + durationInSeconds%60).slice(-2);
}

function parseVideoData(data, callback) {
	var videos = [];
	for(var videoCounter in data.items) {
		var createdDate = new Date(data.items[videoCounter].snippet.publishedAt);
		var dateString = createDateString(createdDate);
		var videoObj = {
			"title": data.items[videoCounter].snippet.title,
			"synopsis": data.items[videoCounter].snippet.description,
			"image": data.items[videoCounter].snippet.thumbnails.high.url,
			"channelTitle": data.items[videoCounter].snippet.channelTitle,
			"videoID": data.items[videoCounter].id,
			"viewCount": data.items[videoCounter].statistics.viewCount,
			"duration": getDuration(data.items[videoCounter].contentDetails.duration),
			"createdDate": dateString
		};
		videos.push(videoObj);
	}
	return callback(videos);
}