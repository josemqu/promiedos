// console.log( 'content.js' );

const scriptNames = [
	"app.js",
]

const styleNames = [
	"style/style.css",
]

setTimeout( scriptsLoad, 1000 );
setTimeout( stylesLoad, 1000 );

function scriptsLoad() {
	scriptNames.map( scriptName => {
		// console.log( "Se cargó el script " + scriptName );
		let elem = document.createElement( 'script' );
		elem.setAttribute( "src", chrome.runtime.getURL( scriptName ) );
		if ( scriptName == "app.js" ) elem.setAttribute( "type", "module" );
		elem.onload = () => elem.remove();
		( document.head || document.documentElement ).appendChild( elem );
	} )
}

function stylesLoad() {
	styleNames.map( styleName => {
		// console.log( "Se cargó el script " + styleName );
		let elem = document.createElement( 'style' );
		elem.setAttribute( "src", chrome.runtime.getURL( styleName ) );
		elem.onload = () => elem.remove();
		( document.head || document.documentElement ).appendChild( elem );
	} )
}