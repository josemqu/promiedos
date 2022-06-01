export default {
	getLink( file ) {
		chrome.runtime.sendMessage( {
			file
		}, function( response ) {
			console.log( response.link );
			return response.link;
		} )
	}
}