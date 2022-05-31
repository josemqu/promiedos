import Team from './modules/team.model.js'
import Match from './modules/match.model.js'
import DomUtils from './modules/utils/dom.utils.js'

// console.log( 'app.js' );
console.log( getTableDict() );
console.log( getMatchWeek() );
let obj = {};
let team = '';
let globalEvent;
initObj();
console.log( updateObj( obj ) );

addBtnAction();
addArrowsListener();
// removeArrowsListener();

function addBtnAction() {
	document.querySelectorAll( '#flechaatr, #flechaad, .cfecha, .cfechact, #principal' )
		.forEach( node => node.addEventListener( 'mousedown', actions, false ) );
}

function addArrowsListener() {
	document.querySelectorAll( '#posiciones tbody tr' )
		.forEach( node => node.addEventListener( 'mouseover', actions2, false ) );
}

function removeArrowsListener() {
	document.querySelectorAll( '#posiciones tbody tr' )
		.forEach( node => node.addEventListener( 'mouseleave', actions3, false ) );
}

function actions( e ) {
	e.stopPropagation();
	e.preventDefault();
	setTimeout( function() {
		updateObj();
		if ( team && globalEvent ) {
			const text = obj[ team ] ? obj[ team ].filter( el => el != null ).slice( -5 ) : obj[ team ];
			DomUtils.arrows( globalEvent, text )
		};
	}, 600 );
}

function actions2( e ) {
	e.stopPropagation();
	e.preventDefault();
	globalEvent = e;
	team = e.target.parentElement.children[ 1 ].innerText.replace( /\*/g, '' );
	const text = obj[ team ] ? obj[ team ].filter( el => el != null ).slice( -5 ) : obj[ team ];
	text.length ? DomUtils.arrows( e, text ) : false;

}

function actions3( e ) {
	e.stopPropagation();
	e.preventDefault();
	const prevDiv = document.querySelector( 'div.arrows' );
	if ( prevDiv ) setTimeout( () => prevDiv.remove(), 2000 );
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
		namesColumn.forEach( el => names.push( el.innerText.replace( /\*/g, '' ) ) );
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
	return document.getElementById( 'fechmedio' ).innerText.split( '\n' )[ 0 ].split( " " )[ 1 ];
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
	getTeams().forEach( el => obj[ el ] = [] );
}

function updateObj() {
	const week = getMatchWeek();
	const arr = [];
	week.forEach( game => {
		arr.push( [ game._week, game.homeTeam, game._resMatch, game._finished ] );
		arr.push( [ game._week, game.awayTeam, -1 * game._resMatch, game._finished ] );
	} );
	Object.keys( obj ).forEach( key => {
		let row = arr.filter( el => el[ 1 ] == key )[ 0 ];
		if ( row ) {
			let weekNum = row[ 0 ];
			let result = row[ 2 ];
			if ( row[ 3 ] )
				obj[ key ][ weekNum - 1 ] = result;
		}
	} );
	return obj
}