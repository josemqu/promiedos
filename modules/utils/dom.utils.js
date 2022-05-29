export default {
	toast( e, text ) {
		const div = document.createElement( 'div' );
		const prevDiv = document.querySelector( 'div.toast' );
		let myVar;
		div.classList.add( 'toast' );
		div.classList.add( 'animated' );
		div.classList.add( 'faster' );
		div.classList.add( 'fadeInDown' );
		div.innerHTML = `   <table class="toast">
                                <tbody>
									<tr>
										<td>
											<img class='logo'/>
                                    		<a>${text}</a>
										</td>
                                    </tr>
                                </tbody>
                            </table>
                        `;

		if ( prevDiv ) document.body.removeChild( prevDiv );
		document.body.appendChild( div );
		div.style.position = 'fixed';
		div.style.zIndex = '10';
		( div.style.fontFamily = 'Open Sans' ), 'Santander Text';
		div.style.fontSize = '14px';
		// div.style.align = 'center';
		div.style.fontWeight = 'bold';
		// div.style.letterSpacing = '-0.2px';
		div.style.padding = '2px';
		div.style.color = 'rgb(20, 20, 20, 1)';
		div.style.backgroundColor = 'rgb(234, 234, 234, 0.9)';
		div.style.border = '2px solid #FFFFFF';
		// div.style.borderRadius = '5px 5px 5px 5px';

		const messures = e.target.parentElement.children[ 1 ].parentElement.getBoundingClientRect()

		let x = messures.x + messures.width + 10
		let y = messures.y - 5
		div.style.left = `${x}px`;
		div.style.top = `${y}px`;

		function deleteDiv() {
			myVar = setTimeout( () => div.remove(), 1000 );
		}

		( () => {
			myVar = setTimeout( () => {
				div.classList.replace( 'fadeInDown', 'fadeOut' );
				deleteDiv();
			}, 3000 );
		} )();

		function myStopFunction() {
			clearTimeout( myVar );
		}

		div.addEventListener( 'mouseover', event => {
			event.preventDefault();
			myStopFunction();
			div.classList.replace( 'fadeOut', 'fadeIn' );
		} );

		div.addEventListener( 'mouseleave', event => {
			event.preventDefault();
			( function() {
				myVar = setTimeout( () => {
					div.classList.replace( 'faster', 'fast' );
					div.classList.replace( 'fadeInDown', 'fadeOut' );
					div.classList.replace( 'fadeIn', 'fadeOut' );
					deleteDiv();
				}, 200 );
			} )();
		} );
	},

	arrows( e, arr ) {
		const div = document.createElement( 'div' );
		const prevDiv = document.querySelector( 'div.toast' );
		div.classList.add( 'toast' );
		div.innerHTML = `   <div class="arrows">
                            </div>
	                    `
		if ( prevDiv ) document.body.removeChild( prevDiv );
		document.body.appendChild( div );
		arr.forEach( ( el ) => {
			let option = {};
			if ( el == 1 ) {
				option = {
					img: 'up',
				}
			} else if ( el == -1 ) {
				option = {
					img: 'down',
				}
			} else {
				option = {
					img: 'equal',
				}
			}

			let x = el == 1 ? 'up' : el == -1 ? 'down' : 'equal'
			let image = document.createElement( "img" );
			image.src = `chrome-extension://ighfojbcgjhekfgpkjojjadnodmlcgpa/modules/utils/icons/${option.img}.svg`;
			image.setAttribute( "style", "float:left" );
			document.querySelector( "div.arrows" ).appendChild( image );
		} );
		div.style.position = 'fixed';
		div.style.zIndex = '10';
		div.style.borderRadius = '2px 2px 2px 2px';
		div.style.padding = '1px';
		div.style.color = 'rgb(20, 20, 20, 1)';
		div.style.backgroundColor = 'rgb(49, 45, 44, 1)';
		// div.style.border = '2px solid #FFFFFF';
		const messures = e.target.parentElement.children[ 1 ].parentElement.getBoundingClientRect()

		let x = messures.x + messures.width + 10
		let y = messures.y - 2
		div.style.left = `${x}px`;
		div.style.top = `${y}px`;
	}
}