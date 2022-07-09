import Utils from "./utils.js";

export default {
	arrows(element, arr, sco, vs, homeOrAway) {
		const div = document.createElement("div");
		const prevDiv = document.querySelector("div.arrows");
		if (arr) {
			if (arr[0] == null) {
				div.style.display = "none";
			} else {
				const extensionID = document.querySelector(
					"div.chromeExtensionID"
				).innerText;
				div.classList.add("arrows");
				if (prevDiv) prevDiv.remove();
				document.body.appendChild(div);

				arr.forEach((el, i) => {
					let imgName = el == 1 ? "up" : el == -1 ? "down" : "equal";
					let div = document.createElement("div");
					let image = document.createElement("img");
					let span = document.createElement("span");
					image.src = `chrome-extension://${extensionID}/modules/utils/icons/${imgName}.svg`;
					image.setAttribute("style", "float:left");
					div.classList.add("tooltip");
					div.classList.add("top");
					span.classList.add("tiptext");
					span.innerHTML = `<strong>${sco[i]}</strong> vs ${vs[i]} (${homeOrAway[i]})`;
					document.querySelector("div.arrows").append(div);
					div.append(image);
					div.append(span);
				});
			}
			const messures =
				element.children[1].parentElement.getBoundingClientRect();
			console.log(messures);
			let x;
			if (
				window.innerWidth - messures.right >
				div.getBoundingClientRect().width + 30
			) {
				x = messures.right + 10;
			} else {
				x = messures.left - div.getBoundingClientRect().width - 10;
			}

			console.log(
				messures.right,
				window.innerWidth,
				messures.left - div.getBoundingClientRect().width - 10
			);
			let y = messures.y - 2;
			div.style.left = `${x}px`;
			div.style.top = `${y}px`;
		}
	},
};
