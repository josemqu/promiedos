import Storage from './modules/storage.js'

function getItem( market, id ) {
	return fetch( `https://api.mercadolibre.com/items/${market || 'MLA'}${id}` ).then( function( res ) {
		return res.json()
	} )
}

Storage.get()
	.then( items => items.forEach( update ) )
	.catch( console.log )

function update( item ) {
	return getItem( item.market, item.id )
		.then( data => item.addHistory( data ) )
		.then( () => saveItem( item ) )
}

function saveData( data ) {
	return Storage.saveItem( data.itemId )
		.then( success => console.info( success.message ) )
}

chrome.runtime.onMessage.addListener( function( request, sender, sendResponse ) {
	if ( request ) {
		console.log( request );
		if ( request.cmd == 'fetch' ) {
			const data = request.data
			if ( !data || !data.itemId ) {
				return sendResponse( {
					sender: 'background.js',
					data: null
				} );
			}
			saveData( data ).then( function( result ) {
				sendResponse( {
					sender: 'background.js',
					data: result
				} );
			} ).catch( function( error ) {
				console.warn( `There was an error trying to fetch article ${data.marketId}${data.itemId}`, error )
				sendResponse( {
					sender: 'background.js',
					data: null
				} );
			} )
		}
	}
	return true
} );