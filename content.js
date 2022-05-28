console.log( 'content.js' );

const scriptNames = [
	"app.js",
]

const myTimeout = setTimeout( start, 1000 );

function start() {
	scriptNames.map( scriptName => {
		console.log( "Se cargó el script " + scriptName );
		let elem = document.createElement( 'script' );
		elem.setAttribute( "src", chrome.runtime.getURL( scriptName ) );
		if ( scriptName == "app.js" ) elem.setAttribute( "type", "module" );
		elem.onload = () => elem.remove();
		( document.head || document.documentElement ).appendChild( elem );
	} )
}