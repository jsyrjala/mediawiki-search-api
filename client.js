require.paths.unshift('.')
var url = require('url')

var client = require('mediawiki-search-api')
// http://en.wikipedia.org/w/api.php

function emptyCallback( error, result) {};
function logCallback(error, result) { 
	if (error) { console.log(error) }
	if (result) { console.log(result) }
}
	
var results = client.search('smash', logCallback)

