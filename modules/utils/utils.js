export default {
	getLink( file ) {
		chrome.runtime.sendMessage( 'ighfojbcgjhekfgpkjojjadnodmlcgpa', {
			file
		}, function( response ) {
			console.log( response.link );
			return response.link;
		} )
	},
	isEmpty( obj ) {
		return typeof obj === 'object' && Object.getOwnPropertyNames( obj ).length === 0;
	}
}