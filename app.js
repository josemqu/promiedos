import Team from './modules/team.model.js'
import Match from './modules/match.model.js'

console.log( 'app.js' );
console.log( getTableDict() );
console.log( getMatchWeek() );
addBtnAction();

function addBtnAction() {
	document.querySelectorAll( '#flechaatr, #flechaad, .cfecha, .cfechact, #principal' )
		.forEach( node => node.addEventListener( 'mousedown', actions, false ) );
}

function actions( e ) {
	e.stopPropagation();
	e.preventDefault();
	setTimeout( function() {
		console.log( getMatchWeek() );
		addBtnAction();
	}, 600 );
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
		namesColumn.forEach( el => names.push( el.innerText ) );
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