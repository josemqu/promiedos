import Team from './modules/team.model.js'
import Match from './modules/match.model.js'
import DomUtils from './modules/utils/dom.utils.js'
import Storage from './modules/storage.js'

console.log( 'app.js' );
console.log( getTableDict() );
console.log( getMatchWeek() );
let obj = {};
let team = '';
let globalEvent;
let objID = window.location.pathname.replace( /\//g, '' )
initObj();
updateObj( obj );
obj = getObj( objID );
console.log( obj );

addBtnAction();
addArrowsListener();
removeArrowsListener();

function saveObj( obj, objID ) {
	localStorage.setItem( objID, JSON.stringify( obj ) )
}

function getObj( objID ) {
	return JSON.parse( localStorage.getItem( objID ) );
}

function addBtnAction() {
	document.querySelectorAll( '#flechaatr, #flechaad, .cfecha, .cfechact, #principal' )
		.forEach( node => node.addEventListener( 'mousedown', mouseDownHandler, false ) );
}

function addArrowsListener() {
	document.querySelectorAll( '#posiciones tbody tr' )
		.forEach( node => node.addEventListener( 'mouseover', mouseOverHandler, false ) );
}

function removeArrowsListener() {
	document.querySelectorAll( '#posiciones tbody' )
		.forEach( node => node.addEventListener( 'mouseleave', mouseLevaeHandler, false ) );
}

window.addEventListener( 'scroll', ( event ) => {
	const prevDiv = document.querySelector( 'div.arrows' );
	if ( prevDiv ) prevDiv.remove();
} );

function mouseDownHandler( e ) {
	e.stopPropagation();
	e.preventDefault();
	setTimeout( function() {
		updateObj();
		saveObj( obj, objID );
		objID = window.location.pathname.replace( /\//g, '' );
		if ( team && globalEvent ) {
			// Storage.save( obj );
			// Storage.get( team );
			obj = getObj( objID );
			if ( obj )
				showArrows( obj, team, globalEvent );
		}
	}, 600 );
}

function mouseOverHandler( e ) {
	e.stopPropagation();
	e.preventDefault();
	globalEvent = e;
	if ( e )
		if ( e.target.parentElement.localName == 'tr' ) {
			team = e.target.parentElement.children[ 1 ].innerText.replace( /\*/g, '' ).trim();
		}
	objID = window.location.pathname.replace( /\//g, '' );
	obj = getObj( objID );
	if ( obj )
		showArrows( obj, team, globalEvent );
}

function showArrows( obj, team, event ) {
	DomUtils.arrows(
		event,
		obj[ team ] ? obj[ team ].result.filter( el => el != null ).slice( -5 ) : obj[ team ].result,
		obj[ team ] ? obj[ team ].score.filter( el => el != null ).slice( -5 ) : obj[ team ].score,
		obj[ team ] ? obj[ team ].vs.filter( el => el != null ).slice( -5 ) : obj[ team ].vs,
		obj[ team ] ? obj[ team ].homeOrAway.filter( el => el != null ).slice( -5 ) : obj[ team ].homeOrAway )
}

function mouseLevaeHandler( e ) {
	e.stopPropagation();
	e.preventDefault();
	let tableDimensions = globalEvent.target.parentElement.parentElement.getBoundingClientRect()
	const prevDiv = document.querySelector( 'div.arrows' );
	if ( prevDiv ) {
		setTimeout( () => {
			if ( !( e.clientY > tableDimensions.top &&
					e.clientY < tableDimensions.bottom &&
					e.clientX < tableDimensions.right + 50 &&
					e.clientX > tableDimensions.left
				) ) {
				prevDiv.remove()
			}
		}, 1000 );
	}
}

function getTeam( name ) {
	const row = getRow( name )[ 0 ];
	return new Team(
		parseInt( row.getAttribute( 'name' ) ),
		name,
		parseInt( row.children[ 0 ].innerText ),
		parseInt( row.children[ 4 ].innerText ),
		parseInt( row.children[ 6 ].innerText ),
		parseInt( row.children[ 5 ].innerText ),
		parseInt( row.children[ 7 ].innerText ),
		parseInt( row.children[ 8 ].innerText )
	)
}

function getTeams() {
	const tables = document.querySelectorAll( 'table#posiciones' );
	const names = []
	tables.forEach( table => {
		const namesColumn = table.querySelectorAll( 'tbody tr td:nth-child(2)' )
		namesColumn.forEach( el => names.push( el.innerText.replace( /\*/g, '' ).trim() ) );
	} )
	return names
}

function getRow( name ) {
	const matches = [];
	for ( const table of document.querySelectorAll( 'table#posiciones tbody tr' ) ) {
		if ( table.textContent.includes( name ) ) {
			matches.push( table );
		}
	}
	return matches
}

function getTableDict() {
	const table = {};
	const names = getTeams();
	names.forEach( name => {
		let team = getTeam( name );
		let key = team.id
		table[ key ] = team
	} )
	return table
}

function getMatchWeek() {
	const matchWeek = getMatchWeekNumber();
	const nodes = document.querySelectorAll( "div#fixturein > table > tbody > tr[id^='_']" );
	const arr = [];
	nodes.forEach( row => arr.push( new Match(
		[
			matchWeek, //matchweek number
			row.children[ 1 ].children[ 2 ].innerText, //home team
			row.children[ 2 ].innerText, //home goales
			row.children[ 3 ].innerText, //away goales
			row.children[ 4 ].children[ 2 ].innerText, //away team
			row.children[ 0 ].innerText == 'Final' ? true : false //match ended
		]
	) ) )
	return arr;
}

function getMatchWeekNumber() {
	const weekNumberElement = document.getElementById( 'fechmedio' );
	if ( weekNumberElement )
		return weekNumberElement.innerText.split( '\n' )[ 0 ].split( " " )[ 1 ];
}

function fetch( num ) {
	fetch( `https://www.promiedos.com.ar/club=${num}` ).then( function( response ) {
		// The API call was successful!
		return response.text();
	} ).then( function( html ) {

		// Convert the HTML string into a document object
		var parser = new DOMParser();
		var doc = parser.parseFromString( html, 'text/html' );

		// Get the image file
		var club = doc.querySelector( '.clubder' ).textContent.split( 'Nombre completo' )[ 0 ];
		console.log( club );

	} ).catch( function( err ) {
		// There was an error
		console.warn( 'Something went wrong.', err );
	} );
}

function initObj() {
	getTeams().forEach( el => obj[ el ] = {
		result: [],
		score: [],
		vs: [],
		homeOrAway: []
	} );
}

function updateObj() {
	const week = getMatchWeek();
	const arr = [];
	week.forEach( game => {
		arr.push( [ game._week, game.homeTeam, game._resMatch, game._finished, `${game.homeGoal} - ${game.awayGoal}`, game.awayTeam, 'L' ] );
		arr.push( [ game._week, game.awayTeam, -1 * game._resMatch, game._finished, `${game.awayGoal} - ${game.homeGoal}`, game.homeTeam, 'V' ] );
	} );
	if ( obj ) {
		Object.keys( obj ).forEach( key => {
			let row = arr.filter( el => el[ 1 ] == key )[ 0 ];
			if ( row ) {
				let weekNum = row[ 0 ];
				let result = row[ 2 ];
				let score = row[ 4 ];
				let vs = row[ 5 ];
				let homeOrAway = row[ 6 ];
				if ( row[ 3 ] ) {
					obj[ key ].result[ weekNum - 1 ] = result;
					obj[ key ].score[ weekNum - 1 ] = score;
					obj[ key ].vs[ weekNum - 1 ] = vs;
					obj[ key ].homeOrAway[ weekNum - 1 ] = homeOrAway;
				}
			}
		} );
	}
	return obj
}

// const [ itemId ] = window.location.pathname.replace( /\//g, '' )
// const extensionID = document.querySelector( 'div.chromeExtensionID' ).innerText;

// setTimeout( () => {
// 	window.chrome.runtime.sendMessage( extensionID, {
// 		cmd: 'fetch',
// 		data: {
// 			itemId,
// 			obj
// 		}
// 	}, ( response ) => {
// 		if ( response && response.data ) {
// 			console.log( response );
// 		}
// 	} )
// }, 1500 )


// function saveObj( obj ) {
// 	if ( !obj ) throw `No obj fetched with id ${itemId}`;
// 	return Storage.saveItem( item )
// 		.then( () => Graph.show( {
// 			item,
// 			elem: $chartSiblin,
// 			itemId,
// 			marketId
// 		} ) )
// }