import Team from "./modules/team.model.js";
import Match from "./modules/match.model.js";
import DomUtils from "./modules/utils/dom.utils.js";
import Storage from "./modules/storage.js";

console.log("app.js");
console.log(getTableDict());
const N_ARROWS = 5;
let obj = {};
let team = "";
let globalEvent;
let tableName = "";
let previousTableName = "";
let objID = window.location.pathname.replace(/\//g, "");
initObj();
obj = getObj(objID) || initObj();
updateObj(obj);
saveObj(obj, objID);
mouseOver();
mouseLeave();
mouseDown();
mouseOverTd();
unselectSpans();

function saveObj(obj, objID) {
	if (Object.keys(obj).length) {
		console.log("save", objID, obj);
		localStorage.setItem(objID, JSON.stringify(obj));
	}
}

function getObj(objID) {
	return JSON.parse(localStorage.getItem(objID));
}

function mouseDown() {
	document
		.querySelectorAll("#flechaatr, #flechaad, .cfecha, .cfechact, #principal")
		.forEach((node) =>
			node.addEventListener("mousedown", mouseDownHandler, false)
		);
}

function mouseOver() {
	document
		.querySelectorAll("#posiciones tbody tr")
		.forEach((node) =>
			node.addEventListener("mouseover", mouseOverHandler, false)
		);
}

function mouseLeave() {
	document
		.querySelectorAll("#posiciones tbody")
		.forEach((node) =>
			node.addEventListener("mouseleave", mouseLevaeHandler, false)
		);
}

function mouseOverTd() {
	document
		.querySelectorAll("div#fixturein > table > tbody > tr[id^='_'] > td")
		.forEach((node) =>
			node.addEventListener("mouseover", mouseOverHandlerTd, false)
		);
}

function mouseOverHandlerTd(e) {
	e.stopPropagation();
	e.preventDefault();
	// console.log(e.target.lastElementChild, e.target.lastElementChild.innerText);
	// console.log(e.target, e.target.innerText);
	let element = e.target.localName == "span" ? e.target : e.target.children[2];
	if (element) {
		team = element.innerText.replace(/\*/g, "").trim();
		console.log(team);
	}
}

window.addEventListener("scroll", scrollHandler, false);

function mouseDownHandler(e) {
	e.stopPropagation();
	e.preventDefault();
	let element =
		globalEvent.target.parentElement.localName == "tr"
			? globalEvent.target.parentElement
			: globalEvent.target.parentElement.parentElement;
	setTimeout(function () {
		updateObj();
		if (window.location.pathname.replace(/\//g, "")) {
			objID = window.location.pathname.replace(/\//g, "");
			saveObj(obj, objID);
		}
		if (team && element) {
			// Storage.save( obj );
			// Storage.get( team );
			obj = getObj(objID);
			if (obj) {
				showArrows(obj, team, element);
			}
		}
	}, 600);
}

function mouseOverHandler(e) {
	e.preventDefault();
	e.stopPropagation();
	globalEvent = e;
	let element =
		globalEvent.target.parentElement.localName == "tr"
			? e.target.parentElement
			: e.target.parentElement.parentElement;
	if (e) {
		if (e.target.parentElement.localName == "tr") {
			team = e.target.parentElement.children[1].innerText
				.replace(/\*/g, "")
				.trim();
			objID = objID || window.location.pathname.replace(/\//g, "");
			obj = getObj(objID);
			if (obj) {
				showArrows(obj, team, element);
				changeColor(team);
				console.log(`${team}: `, getNextRivalsAvg(team));
			}
		}
	}
}

function showArrows(obj, team, element) {
	DomUtils.arrows(
		element,
		obj[team]
			? obj[team].result.filter((el) => el != null).slice(-N_ARROWS)
			: obj[team].result,
		obj[team]
			? obj[team].score.filter((el) => el != null).slice(-N_ARROWS)
			: obj[team].score,
		obj[team]
			? obj[team].vs.filter((el) => el != null).slice(-N_ARROWS)
			: obj[team].vs,
		obj[team]
			? obj[team].homeOrAway.filter((el) => el != null).slice(-N_ARROWS)
			: obj[team].homeOrAway
	);
}

function mouseLevaeHandler(e) {
	e.stopPropagation();
	e.preventDefault();
	resetColor();
	let tableDimensions =
		globalEvent.target.parentElement.parentElement.getBoundingClientRect();
	const prevDiv = document.querySelector("div.arrows");
	if (prevDiv) {
		setTimeout(() => {
			if (
				!(
					e.clientY > tableDimensions.top &&
					e.clientY < tableDimensions.bottom &&
					e.clientX < tableDimensions.right + 50 &&
					e.clientX > tableDimensions.left
				)
			) {
				prevDiv.remove();
			}
		}, 1000);
	}
}

function scrollHandler(e) {
	const prevDiv = document.querySelector("div.arrows");
	if (prevDiv) prevDiv.remove();
}

function getTeam(name) {
	const row = getRow(name)[0];
	return new Team(
		parseInt(row.getAttribute("name")),
		name,
		parseInt(row.children[0].innerText),
		parseInt(row.children[4].innerText),
		parseInt(row.children[6].innerText),
		parseInt(row.children[5].innerText),
		parseInt(row.children[7].innerText),
		parseInt(row.children[8].innerText)
	);
}

function getTeams() {
	const tables = document.querySelectorAll("table#posiciones");
	const names = [];
	tables.forEach((table) => {
		const namesColumn = table.querySelectorAll("tbody tr td:nth-child(2)");
		namesColumn.forEach((el) =>
			names.push(el.innerText.replace(/\*/g, "").trim())
		);
	});
	return [...new Set(names)];
}

function getRow(name) {
	const matches = [];
	for (const table of document.querySelectorAll("table#posiciones tbody tr")) {
		if (table.textContent.includes(name)) {
			matches.push(table);
		}
	}
	return matches;
}

function getTableDict() {
	const table = {};
	const names = getTeams();
	names.forEach((name) => {
		let team = getTeam(name);
		let key = team.id;
		table[key] = team;
	});
	return table;
}

function getTable() {
	const table = {};
	const teams = getTeams();
	teams.forEach((team) => {
		let teamData = getTeam(team);
		table[team] = teamData;
	});
	return table;
}

function getMatchWeek() {
	const matchWeek = getMatchWeekNumber();
	const nodes = document.querySelectorAll(
		"div#fixturein > table > tbody > tr[id^='_']"
	);
	const arr = [];
	nodes.forEach((row) =>
		arr.push(
			new Match([
				matchWeek, //matchweek number
				row.children[1].children[2].innerText, //home team
				row.children[2].innerText, //home goales
				row.children[3].innerText, //away goales
				row.children[4].children[2].innerText, //away team
				row.children[0].innerText == "Final" ? true : false, //match ended
			])
		)
	);
	return arr;
}

function getMatchWeekNumber() {
	const weekNumberElement = document.getElementById("fechmedio");
	if (weekNumberElement)
		return weekNumberElement.innerText.split("\n")[0].split(" ")[1];
}

async function showTable(competition) {
	const tabPos = document.querySelectorAll(".tabPos");
	if (!isEmpty(tabPos)) tabPos.forEach((el) => el.remove());
	const div = document.createElement("div");
	div.classList.add("tabPos");
	div.innerHTML = await getPositionTable(competition);
	if (div.innerHTML != "undefined") {
		console.log(div.innerHTML);
		div.style.position = "absolute";
		div.style.width = "380px";
		div.style.left = getRightMargin() + "px";
		div.style.top = -document.body.getBoundingClientRect().top + 20 + "px";
		document.body.appendChild(div);
	}
}

async function getPositionTable(competition) {
	try {
		let response = await fetch(`https://www.promiedos.com.ar/${competition}`);
		let html = await response.text();
		let parser = new DOMParser();
		let doc = parser.parseFromString(html, "text/html");
		let table = doc.querySelector("#posiciones").parentElement.innerHTML;
		return table;
	} catch (err) {
		console.warn(err);
	}
}

function getRightMargin() {
	const element = document.querySelector("tr.tituloin > td > a");
	const messures = element.children[1].parentElement.getBoundingClientRect();
	return messures.right + (window.innerWidth - messures.right - 380) / 4;
}

function initObj() {
	getTeams().forEach(
		(el) =>
			(obj[el] = {
				result: [],
				score: [],
				vs: [],
				homeOrAway: [],
			})
	);
	return obj;
}

function updateObj() {
	const week = isEmpty(getGroupWeek()) ? getMatchWeek() : getGroupWeek(); //asignar el array no vacío   getMatchWeek() || getGroupWeek()
	const arr = [];
	week.forEach((game) => {
		arr.push([
			game._week,
			game.homeTeam,
			game._resMatch,
			game._finished,
			`${game.homeGoal} - ${game.awayGoal}`,
			game.awayTeam,
			"L",
		]);
		arr.push([
			game._week,
			game.awayTeam,
			-1 * game._resMatch,
			game._finished,
			`${game.awayGoal} - ${game.homeGoal}`,
			game.homeTeam,
			"V",
		]);
	});
	if (obj) {
		Object.keys(obj).forEach((key) => {
			let matches = arr.filter((el) => el[1] == key);
			matches.forEach((match) => {
				if (match) {
					let weekNum = match[0];
					let result = match[2];
					let score = match[4];
					let vs = match[5];
					let homeOrAway = match[6];
					if (match[3]) {
						obj[key].result[weekNum - 1] = result;
						obj[key].score[weekNum - 1] = score;
						obj[key].vs[weekNum - 1] = vs;
						obj[key].homeOrAway[weekNum - 1] = homeOrAway;
					}
				}
			});
		});
	}
	return obj;
}

document
	.querySelectorAll(".tituloin")
	.forEach((node) => node.addEventListener("mouseover", tituloHandler, false));

function tituloHandler(e) {
	e.preventDefault();
	e.stopPropagation();
	let element = e.target;
	if (element.localName === "a") {
		tableName = element.href.split("/")[3];
		if (tableName !== previousTableName) {
			showTable(tableName);
			setTimeout(() => {
				mouseOver();
				mouseLeave();
				objID = tableName;
			}, 1000);
			previousTableName = tableName;
		}
	}
}

function getGroupWeek() {
	const fechas = document.querySelectorAll("#fixgrupo");
	let arr = [];
	const dict = setDict();
	// const dict = getTableDict();
	fechas.forEach((fecha) => {
		let num = fecha.children[0].innerText.split(" ")[1];
		let matches = fecha.querySelectorAll(".grtr");
		matches.forEach((match) => {
			arr.push(
				new Match([
					num,
					dict[
						match.children[0].lastElementChild.src
							.replace(/^.*[\\\/]/, "")
							.split(".")[0]
					],
					match.children[1].innerText.split("-")[0],
					match.children[1].innerText.split("-")[1],
					dict[
						match.children[2].lastElementChild.src
							.replace(/^.*[\\\/]/, "")
							.split(".")[0]
					],
					match.children[1].innerText.split("-")[0] ? true : false,
				])
			);
		});
	});
	return arr;
}

function teamDict() {
	const teams = getTeams();
	const dict = {};
	teams.forEach((team) => {
		let teamName = team.replace(/\W|Dep/g, "");
		return (dict[teamName.slice(0, 3).toUpperCase()] = team);
	});
	return dict;
}

function setDict() {
	const dict = {};
	const rows = document.querySelectorAll("#posiciones > tbody > tr");
	rows.forEach((row) => {
		let team = row.children[1].innerText.replace(/^\s/g, "");
		let imgs = row.querySelectorAll("img");
		let code = imgs[imgs.length - 1].src.replace(/^.*[\\\/]/, "").split(".")[0];
		return (dict[code] = team);
	});
	return dict;
}

// function that chek if an array is empty
function isEmpty(arr) {
	return arr.length === 0;
}

function getNextRivals(team) {
	const teams = getTeams();
	const objID = window.location.pathname.replace(/\//g, "");
	const week = getObj(objID);
	const arr = [...week[team].vs, team];
	const filtered = teams.filter((el) => !arr.includes(el));
	return filtered;
}

// get average of pts for the next rivals of a team
function getNextRivalsAvg(team) {
	const nextRivals = getNextRivals(team);
	const table = getTable();
	let sum = 0;
	nextRivals.forEach((rival) => {
		return (sum += table[rival].pts);
	});
	return Math.round((sum * 100) / nextRivals.length) / 100;
}

// function that change backgroud color of td wich contains a span element with innerText = team and reset color for non selected team
function changeColor(team) {
	const spans = unselectSpans();

	const selectedSpan = [...spans].filter((el) => el.innerText == team)[0];
	selectedSpan.parentElement.classList.remove("unselected");
	selectedSpan.parentElement.classList.add("selected");
}

function resetColor() {
	const spans = document.querySelectorAll(
		"div#fixturein > table > tbody > tr[id^='_'] > td > span.datoequipo"
	);
	[...spans].forEach((span) => {
		span.parentElement.classList.replace("selected", "unselected");
		// span.parentElement.classList.add("unselected");
	});
}

function unselectSpans() {
	const spans = document.querySelectorAll(
		"div#fixturein > table > tbody > tr[id^='_'] > td > span.datoequipo"
	);
	[...spans].forEach((span) => {
		span.parentElement.classList.remove("selected");
		span.parentElement.classList.add("unselected");
	});
	return spans;
}
