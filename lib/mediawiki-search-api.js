var http = require('http')
var url = require('url')
var _ = require('underscore')
var querystring = require('querystring')
var defaultApiUrl = url.parse('http://en.wikipedia.org/w/api.php')

// http://www.mediawiki.org/wiki/API:Opensearch
function search(query, callback, limit, mediaWikiApiUrl) {
	var params = [] 
	var apiUrl = mediaWikiApiUrl || defaultApiUrl

	var queryParams = {
		action: 'opensearch',
		search: query,
		limit: (limit || 3),
		format: 'json'
	}
	var queryString = querystring.stringify(queryParams)
	try {
		makeQuery(apiUrl, queryString, function(data) {
			var results = data[1]
			var links = _(results).map(function( pagename) { 
					return {'page' : pagename, 'url' : linkify(apiUrl, pagename) }
				})
			callback(null, links)
		}, function(error) {
			callback(error)
		});
	} catch (e) {
		callback(e)
	}
}

function linkify(apiUrl, pageName) {
	var path = '/wiki/' + pageName.replace(/ /g, '_')
	var port = ''
	if(apiUrl.port) {
		port = ':' + port;
	}
	var link = url.parse(apiUrl.protocol + '//' + apiUrl.hostname + port + path)
	return link
}

function QueryFailedException(statusCode) {
	this.statusCode = statusCode
}

function getPort(url) {
	if(url.port) {
		return port
	}
	if(url.protocol == 'https:') {
		return 443
	}
	return 80
}

function makeQuery(apiUrl, query, onSuccess, onError) {
	var path = apiUrl.pathname + '?' + query
	var requestParams = {
		host: apiUrl.host,
		port: getPort(apiUrl),
		path: path,
		method: 'GET',
		headers: {'User-agent': 'Node.js WikiMedia API/0.1' }
	}
	var req = http.request(requestParams, function(resp) {
		if(resp.statusCode == 200) {
			var message = ''
			resp.on('data', function(chunk) {
				message += chunk
			})
			resp.on('end', function() {
				onSuccess(JSON.parse(message))
			})
		} else {
			onError( new QueryFailedException(resp.statusCode))
		}
	});
	
	req.on('error', function(e) {
		onError(e)
	});
	req.end();
}

exports.search = search