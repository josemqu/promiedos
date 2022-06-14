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
obj = getObj( objID ) || initObj();
updateObj( obj );
saveObj( obj, objID );
console.log( obj );

function saveObj( obj, objID ) {
	if ( Object.keys( obj ).length ) {
		localStorage.setItem( objID, JSON.stringify( obj ) )
	}
}

function getObj( objID ) {
	return JSON.parse( localStorage.getItem( objID ) );
}

document.querySelectorAll( '#flechaatr, #flechaad, .cfecha, .cfechact, #principal' )
	.forEach( node => node.addEventListener( 'mousedown', mouseDownHandler, false ) );

document.querySelectorAll( '#posiciones tbody tr' )
	.forEach( node => node.addEventListener( 'mouseover', mouseOverHandler, false ) );

document.querySelectorAll( '#posiciones tbody' )
	.forEach( node => node.addEventListener( 'mouseleave', mouseLevaeHandler, false ) );

window.addEventListener( 'scroll', scrollHandler, false );

function mouseDownHandler( e ) {
	e.stopPropagation();
	e.preventDefault();
	let element = globalEvent.target.parentElement.localName == 'tr' ? globalEvent.target.parentElement : globalEvent.target.parentElement.parentElement;
	setTimeout( function() {
		updateObj();
		saveObj( obj, objID );
		objID = window.location.pathname.replace( /\//g, '' );
		if ( team && element ) {
			// Storage.save( obj );
			// Storage.get( team );
			obj = getObj( objID );
			if ( obj ) {
				showArrows( obj, team, element );
			}
		}
	}, 600 );
}

function mouseOverHandler( e ) {
	e.stopPropagation();
	e.preventDefault();
	globalEvent = e;
	let element = globalEvent.target.parentElement.localName == 'tr' ? e.target.parentElement : e.target.parentElement.parentElement;
	if ( e ) {
		if ( e.target.parentElement.localName == 'tr' ) {
			team = e.target.parentElement.children[ 1 ].innerText.replace( /\*/g, '' ).trim();
			objID = window.location.pathname.replace( /\//g, '' );
			obj = getObj( objID );
			if ( obj )
				showArrows( obj, team, element );
		}
	}
}

function showArrows( obj, team, element ) {
	DomUtils.arrows(
		element,
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

function scrollHandler( e ) {
	const prevDiv = document.querySelector( 'div.arrows' );
	if ( prevDiv ) prevDiv.remove();
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
	return [ ...new Set( names ) ]
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

await showTable( 'primera' )

async function showTable( competition ) {
	const tabPos = document.querySelector( '.tabPos' );
	tabPos ? tabPos.remove() : false;
	const div = document.createElement( 'div' );
	div.classList.add( 'tabPos' );
	div.innerHTML = await getPosTable( competition );
	div.style.position = 'fixed';
	div.style.left = '1300px';
	document.body.appendChild( div );
}

async function getPosTable( competition ) {
	try {
		let response = await fetch( `https://www.promiedos.com.ar/${competition}` );
		let html = await response.text();
		let parser = new DOMParser();
		let doc = parser.parseFromString( html, 'text/html' );
		let table = doc.querySelector( "#posiciones" ).parentElement.innerHTML;
		return table
	} catch ( err ) {
		console.warn( err );
	}
}

function getPositionsTable( competition ) {
	fetch( `https://www.promiedos.com.ar/${competition}` ).then( function( response ) {
		// The API call was successful!
		return response.text();
	} ).then( function( html ) {

		// Convert the HTML string into a document object
		var parser = new DOMParser();
		var doc = parser.parseFromString( html, 'text/html' );

		// Get table innerHTML
		let table = doc.querySelector( "#posiciones" ).innerHTML;
		return table;

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
	return obj
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