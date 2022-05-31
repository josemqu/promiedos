export default {
	arrows( e, arr, sco ) {
		const div = document.createElement( 'div' );
		const prevDiv = document.querySelector( 'div.arrows' );
		div.classList.add( 'arrows' );
		// div.classList.add( 'tooltip' );
		div.innerHTML = `<div class="arrows"></div>`;
		if ( prevDiv ) prevDiv.remove();
		document.body.appendChild( div );
		arr.forEach( ( el, i ) => {
			let x = el == 1 ? 'up' : el == -1 ? 'down' : 'equal'
			let div = document.createElement( "div" );
			let image = document.createElement( "img" );
			let span = document.createElement( 'span' );
			image.src = `chrome-extension://ighfojbcgjhekfgpkjojjadnodmlcgpa/modules/utils/icons/${x}.svg`;
			image.setAttribute( "style", "float:left" );
			div.classList.add( 'tooltip' );
			div.classList.add( 'top' );
			span.classList.add( 'tiptext' );
			span.innerText = `${sco[i]}`;
			document.querySelector( "div.arrows" ).append( div );
			div.append( image );
			div.append( span );
		} );
		div.style.position = 'fixed';
		div.style.zIndex = '10';
		div.style.borderRadius = '2px 2px 2px 2px';
		// div.style.padding = '1px';
		div.style.color = 'rgb(20, 20, 20, 1)';
		div.style.backgroundColor = 'rgb(49, 45, 44, 1)';
		div.style.border = '1px solid #FFFFFF';
		div.style.borderRadius = '3px';
		const messures = e.target.parentElement.children[ 1 ].parentElement.getBoundingClientRect()
		let x = messures.x + messures.width + 10
		let y = messures.y - 2
		div.style.left = `${x}px`;
		div.style.top = `${y}px`;
	}
}