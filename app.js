import Team from "./modules/team.model.js";
import Match from "./modules/match.model.js";
import DomUtils from "./modules/utils/dom.utils.js";
import Storage from "./modules/storage.js";

// console.log("app.js");
// console.log(getTableDict());
const N_ARROWS = 5;
let highlight = false;
let obj = {};
let team = "";
let globalEvent = "";
let tableName = "";
let previousTableName = "";
let objID = window.location.pathname.replace(/\//g, "");
let competitionId =
  document
    .querySelector(".cfecha")
    ?.getAttribute("onclick")
    ?.match(/'1_(\d+)'/)[1] || 0;

initObj();
obj = getObj(objID) || initObj();
// updateObj(obj);
saveObj(obj, objID);
mouseOver();
mouseLeave();
// mouseDown();
mouseOverTd();
mouseLeaveTd();
mouseKeyDown();
unselectSpans();
getTables();

setTimeout(() => {
  const teams = getTeams();
  const teamCodes = {};
  teams.forEach((team) => {
    teamCodes[team] = getTeam(team).id;
  });
  saveObj(teamCodes, `${objID}_codes`);
}, 0);

function saveObj(obj, objID) {
  if (Object.keys(obj).length) {
    // console.log("save", objID, obj);
    localStorage.setItem(objID, JSON.stringify(obj));
  }
}

function getObj(objID) {
  return JSON.parse(localStorage.getItem(objID));
}

// function mouseDown() {
//   document
//     .querySelectorAll("#flechaatr, #flechaad, .cfecha, .cfechact, #principal")
//     .forEach((node) =>
//       node.addEventListener("mousedown", mouseDownHandler, false)
//     );
// }

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
      node.addEventListener("mouseleave", mouseLeaveHandler, false)
    );
}

function mouseOverTd() {
  document
    .querySelectorAll("div#fixturein > table > tbody > tr[id^='_'] > td")
    .forEach((node) =>
      node.addEventListener("mouseover", mouseOverTdHandler, false)
    );
}

function mouseLeaveTd() {
  document
    .querySelectorAll("div#fixturein > table > tbody > tr[id^='_'] > td")
    .forEach((node) =>
      node.addEventListener(
        "mouseleave",
        () => {
          unselectSpans();
          removeHighlight();
        },
        false
      )
    );
}

function mouseKeyDown() {
  document.body.addEventListener(
    "keypress",
    (e) => {
      if (e.key == "n") {
        highlight = !highlight;
        if (highlight) {
          addHighlight(getNextRivals(team));
        } else {
          removeHighlight();
          const rival = getRival(team);
          highlightTeams([rival]);
        }
      }
    },
    false
  );
}

function mouseOverTdHandler(e) {
  e.stopPropagation();
  e.preventDefault();
  // console.log(e.target.lastElementChild, e.target.lastElementChild.innerText);
  // console.log(e.target, e.target.innerText);
  let element = e.target.localName == "span" ? e.target : e.target.children[2];
  if (element) {
    team = element.innerText.replace(/\*/g, "").trim();
    let rival = getRival(team);
    changeColor([team, rival]);
    highlightTeams([team, rival]);
    // console.log(team, "vs", rival);
  }
}

window.addEventListener("scroll", scrollHandler, false);

function mouseDownHandler(e) {
  e.stopPropagation();
  e.preventDefault();
  let element;
  if (globalEvent) {
    element =
      globalEvent.target.parentElement.localName == "tr"
        ? globalEvent.target.parentElement
        : globalEvent.target.parentElement.parentElement;
  }
  setTimeout(function () {
    // printTables();
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
      objID = objID || window.location.pathname.replace(/\//g, "") || tableName;
      obj = getObj(objID);
      if (obj) {
        const rival = getRival(team);
        showArrows(obj, team, element);
        changeColor([team, rival]);
        highlightTeams([rival]);
        if (highlight) highlightTeams(getNextRivals(team));
        // console.log(`${team}: `, getNextRivalsAvg(team));
      }
    }
  }
}

function showArrows(obj, team, element) {
  DomUtils.arrows(
    element,
    obj[team]
      ? obj[team]?.result.filter((el) => el != null).slice(-N_ARROWS)
      : obj[team]?.result,
    obj[team]
      ? obj[team]?.score.filter((el) => el != null).slice(-N_ARROWS)
      : obj[team]?.score,
    obj[team]
      ? obj[team]?.vs.filter((el) => el != null).slice(-N_ARROWS)
      : obj[team]?.vs,
    obj[team]
      ? obj[team]?.homeOrAway.filter((el) => el != null).slice(-N_ARROWS)
      : obj[team]?.homeOrAway
  );
}

function mouseLeaveHandler(e) {
  e.stopPropagation();
  e.preventDefault();
  resetColor();
  removeHighlight();
  let tableDimensions =
    globalEvent?.target?.parentElement?.parentElement?.getBoundingClientRect();
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

function getTeamsOfTable(tableName) {
  const table = document.querySelector(`table.${tableName}`);
  const namesColumn = table.querySelectorAll("tbody tr td:nth-child(2)");
  const names = [];
  namesColumn.forEach((el) =>
    names.push(el.innerText.replace(/\*/g, "").trim())
  );
  return [...new Set(names)];
}

function getTables() {
  const tableNames = getTablesCodes();
  const tables = {};
  tableNames.forEach((tableName) => {
    const table = getTable(tableName);
    tables[tableName] = {
      name: table.name,
      table: table.table,
    };
  });
  // console.log(tables);
  return tables;
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

function getTable(tableCode) {
  const table = {};
  const name = document
    .querySelector(`table.${tableCode}`)
    .previousSibling.textContent.replace(/arrow_upward/g, "")
    .trim();
  const teams = getTeamsOfTable(tableCode);
  teams.forEach((team) => {
    let teamData = getTeam(team);
    table[team] = teamData;
  });
  return { name, table };
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
    // console.log(div.innerHTML);
    div.style.position = "absolute";
    div.style.width = "380px";
    div.style.left = getRightMargin() + "px";
    div.style.top = -document.body.getBoundingClientRect().top + 20 + "px";
    document.body.appendChild(div);
  }
}

function showTablesOfTeams(teams, competition) {
  getPositionTables(competition).then((tables) => {
    const selectedTables = selectTablesWithTeams(teams, tables);

    selectedTables.forEach((selectedTable) => {
      const table = tables[selectedTable.tableIndex];
      const tableContainer = document.createElement("div");
      tableContainer.classList.add("table-container");
      tableContainer.innerHTML = table.outerHTML;

      document.body.appendChild(tableContainer);
    });
  });
}

async function showTables(teams, competition) {
  const tabPos = document.querySelectorAll(".tabPos");
  if (!isEmpty(tabPos)) tabPos.forEach((el) => el.remove());
  const div = document.createElement("div");
  div.classList.add("tabPos");
  const allTables = await getPositionTables(competition);
  const selectedTablesIndexes = selectTablesWithTeams(teams, allTables);
  selectedTablesIndexes.forEach((index) => {
    return (div.innerHTML += allTables[index].outerHTML);
  });
  if (div.innerHTML != "undefined") {
    div.style.position = "absolute";
    div.style.width = "380px";
    div.style.left = getRightMargin() + "px";
    div.style.top = -document.body.getBoundingClientRect().top + 20 + "px";
    document.body.appendChild(div);
  }
}

async function getPositionTables(competition) {
  try {
    let response = await fetch(`https://www.promiedos.com.ar/${competition}`);
    let html = await response.text();
    let parser = new DOMParser();
    let doc = parser.parseFromString(html, "text/html");
    let tables = doc.querySelectorAll("table#posiciones");
    let tablesArray = Array.from(tables);
    let zonas = tablesArray.map((table) => table.parentElement);
    // console.log({ zonas });
    return zonas;
  } catch (err) {
    console.warn(err);
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

// async function getPositionTables(competition) {
//   try {
//     let response = await fetch(`https://www.promiedos.com.ar/${competition}`);
//     let html = await response.text();
//     let parser = new DOMParser();
//     let doc = parser.parseFromString(html, "text/html");
//     let tables = doc.querySelectorAll("table#posiciones");
//     return tables;
//   } catch (err) {
//     console.warn(err);
//   }
// }

function selectTablesWithTeams(teams, tables) {
  const selectedTables = [];

  tables.forEach((table, index) => {
    const tableBody = table.querySelector("tbody");
    if (!tableBody) return;

    const rows = tableBody.querySelectorAll("tr");
    const presentTeams = new Set();

    rows.forEach((row) => {
      const teamCell = row.querySelector("td:nth-child(2)");
      if (!teamCell) return;

      const teamName = teamCell.textContent.trim();

      teams.forEach((team) => {
        if (teamName.includes(team)) {
          presentTeams.add(team);
        }
      });
    });

    if (presentTeams.size > 0) {
      selectedTables.push({
        tableIndex: index,
        teams: Array.from(presentTeams),
      });
    }
  });

  const tableIndexes = selectedTables.map((table) => table.tableIndex);
  return tableIndexes;
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
        teamCode: 0,
      })
  );
  return obj;
}

function updateObj() {
  const week = isEmpty(getGroupWeek()) ? getMatchWeek() : getGroupWeek(); //asignar el array no vacío   getMatchWeek() || getGroupWeek()
  // console.log({ week });
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
  const teamCodes = getObj(`${objID}_codes`);
  // console.log({ teamCodes });
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
            obj[key].teamCode = teamCodes ? teamCodes[key] : 0;
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

// function tituloHandler(e) {
//   e.preventDefault();
//   e.stopPropagation();
//   let element = e.target;
//   if (element.localName === "a") {
//     tableName = element.href.split("/")[3];
//     if (tableName !== previousTableName) {
//       showTable(tableName);
//       setTimeout(() => {
//         mouseOver();
//         mouseLeave();
//         objID = tableName;
//         console.log(tableName);
//         console.log(objID);
//       }, 500);
//       previousTableName = tableName;
//     }
//   }
// }

function getTeamsOfElementTableName(element) {
  const table = element.parentElement.parentElement.parentElement.parentElement;
  const teams = [];
  table.querySelectorAll(".game-t1 span").forEach((team) => {
    teams.push(team.innerText);
  });
  return teams;
}

function tituloHandler(e) {
  e.preventDefault();
  e.stopPropagation();
  let element = e.target;
  if (element.localName === "a") {
    tableName = element.href.split("/")[3];
    const teams = getTeamsOfElementTableName(element);
    if (tableName !== previousTableName) {
      // showTablesOfTeams(teams, tableName);
      showTables(teams, tableName);
      setTimeout(() => {
        mouseOver();
        mouseLeave();
        objID = tableName;
        // console.log(tableName);
        // console.log(objID);
      }, 500);
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

/*
'result' is an array of numbers, each number belongs to a week day.
The value -1 count as a lost
The value 0 count as a draw
The value 1 count as a win

The function countPoints summarize each win, lost, draw, played matches and
calculated points given a week day of the first week match days
*/

function countPoints(result, weekDay) {
  let matches = result.slice(0, weekDay);
  let played = matches.length;
  let won = matches.filter((el) => el == 1).length;
  let lost = matches.filter((el) => el == -1).length;
  let draw = matches.filter((el) => el == 0).length;
  let pts = won * 3 + draw;
  return {
    played,
    won,
    lost,
    draw,
    pts,
  };
}

/*
'score' is an array of strings, where each string has the scores of each week match

The function countGoals summarize each goal, received and scored, and the goal difference
*/

function countGoals(score, weekDay) {
  let goals = score.slice(0, weekDay);
  let scored = goals.reduce(
    (acc, el) => acc + parseInt(el?.split(" - ")[0] || 0),
    0
  );
  let received = goals.reduce(
    (acc, el) => acc + parseInt(el?.split(" - ")[1] || 0),
    0
  );
  let difference = scored - received;
  return {
    scored,
    received,
    difference,
  };
}

/**
 * 'getTableAtWeekDay' construct all position table at a given weekday
 * starts getting the obj of teams of the tournament
 */

function getTableAtWeekDay(tableCode) {
  const weekDay = getMatchWeekNumber();
  const teams = getObj(objID); // list of teams of the tournament with all its matches results
  // console.log(teams, objID);
  const table = [];
  Object.keys(teams).forEach((team) => {
    let points = countPoints(teams[team].result, weekDay);
    let goals = countGoals(teams[team].score, weekDay);
    table.push({
      team,
      teamCode: teams[team].teamCode,
      pts: points.pts,
      played: points.played,
      won: points.won,
      draw: points.draw,
      lost: points.lost,
      scored: goals.scored,
      received: goals.received,
      difference: goals.difference,
    });
  });

  // sort table with next rules:
  // 1. points
  // 2. goal difference
  // 3. scored goals
  // 4. received goals
  // 5. team name

  const sortedTable = table.sort((a, b) => {
    if (a.pts > b.pts) return -1;
    if (a.pts < b.pts) return 1;
    if (a.difference > b.difference) return -1;
    if (a.difference < b.difference) return 1;
    if (a.scored > b.scored) return -1;
    if (a.scored < b.scored) return 1;
    if (a.received < b.received) return -1;
    if (a.received > b.received) return 1;
    if (a.team < b.team) return -1;
    if (a.team > b.team) return 1;
  });

  console.table(sortedTable);
  return sortedTable;
}

function getTablesAtWeekDay() {
  const tables = {};
  const tablesNames = getTablesCodes();
  // console.log(tablesNames);
  tablesNames.forEach((table) => {
    tableName = table;
    obj = getObj(objID);
    tables[tableName] = getTableAtWeekDay();
  });

  return tables;
}

function getTablesCodes() {
  const tables = document.querySelectorAll("#posiciones");
  const codes = [];
  tables.forEach((table) => {
    codes.push(table.classList[0]);
  });
  return [...new Set(codes)];
}

function printTable(tableCode) {
  // console.log({ tableCode });
  const table = getTableAtWeekDay(tableCode);
  const tableBody = document.querySelector(`table.${tableCode} > tbody`);
  table.forEach((team, index) => {
    let row = tableBody.children[index];
    row.setAttribute("name", `${team.teamCode}`);
    row.children[0].innerText = index + 1;
    row.children[1].innerHTML = `<img src="images/18/${team.teamCode}.png" />${team.team}`;
    row.children[2].innerText = team.pts;
    row.children[3].innerText = team.played;
    row.children[4].innerText = team.won;
    row.children[5].innerText = team.draw;
    row.children[6].innerText = team.lost;
    row.children[7].innerText = team.scored;
    row.children[8].innerText = team.received;
    row.children[9].innerText = team.difference;
  });
}

function printTables() {
  const tablesNames = getTablesCodes();
  // console.log(tablesNames);
  tablesNames.forEach((table) => {
    tableName = table;
    obj = getObj(objID);
    printTable(table);
  });
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

// function that check if an array is empty
function isEmpty(arr) {
  return arr.length === 0;
}

function getNextRivals(team) {
  const teams = getTeams();
  objID = window.location.pathname.replace(/\//g, "") || objID;
  const week = getObj(objID);
  const arr = [...week[team].vs, team];
  const filtered = teams.filter((el) => !arr.includes(el));
  return filtered;
}

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
function changeColor(teams) {
  const spans = unselectSpans();
  const selectedSpans = [...spans].filter(
    (el) => el.innerText == teams[0] || el.innerText == teams[1]
  );
  selectedSpans.forEach((span) => {
    if (span) {
      span.parentElement.classList.remove("unselected");
      span.parentElement.classList.add("selected");
    }
  });
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

function highlightTeams(teams = []) {
  if (isEmpty(teams)) return;
  removeHighlight();
  addHighlight(teams);
}

function removeHighlight() {
  const trCollection = document.querySelectorAll("#posiciones > tbody > tr");
  [...trCollection].forEach((tr) => {
    tr.classList.remove("highlight");
  });
}

function addHighlight(teams) {
  const trCollection = document.querySelectorAll("#posiciones > tbody > tr");
  teams.forEach((team) => {
    const tr = [...trCollection].filter(
      (el) => el.children[1].innerText == team
    )[0];
    tr ? tr.classList.add("highlight") : null;
  });
}

function getRival(team) {
  const week = getMatchWeek();
  if (isEmpty(week)) {
    return;
  }
  let match = week.filter((el) => el.homeTeam == team || el.awayTeam == team);
  if (isEmpty(match)) {
    return;
  }
  let rival = match[0].homeTeam == team ? match[0].awayTeam : match[0].homeTeam;
  return rival;
}

// Create the progress bar container
const progressBarContainer = document.createElement("div");
progressBarContainer.id = "progressBarContainer";

// Create the progress bar itself
const progressBar = document.createElement("div");
progressBar.id = "progressBar";

// Append the progress bar to the container and the container to the body
progressBarContainer.appendChild(progressBar);
document.body.appendChild(progressBarContainer);

// Function to update progress
function updateProgress(percent) {
  progressBar.style.width = `${percent}%`;
  if (percent >= 100) {
    // Smoothly hide the progress bar after finishing
    setTimeout(() => {
      progressBarContainer.style.opacity = "0";
      setTimeout(() => {
        progressBarContainer.remove();
      }, 500); // Allow fade-out before removing
    }, 500);
  }
}

const getAllMatchWeeks = async () => {
  //get last week number
  const lastWeek = +document
    .querySelector("#fechmedio")
    ?.innerText.split("\n")[0]
    ?.split(" ")[1];

  //get all match weeks
  const allMatchWeeks = {};
  for (let i = 1; i <= lastWeek; i++) {
    allMatchWeeks[i] = await requestMatchWeek(i);

    // progress bar update
    updateProgress((i / lastWeek) * 100);
  }
  // console.log(allMatchWeeks);
  return allMatchWeeks;
};

const requestMatchWeek = async (week) => {
  // Select the element with the class 'cfecha'
  const element = document.querySelector(".cfecha");

  const endpoint = `https://www.promiedos.com.ar/verfecha.php?fecha=${week}_${competitionId}`;
  const matchWeek = await fetch(endpoint)
    .then((res) => res.text())
    .then((html) => {
      //get match week
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const matches = doc.querySelectorAll(
        "div#fixturein > table > tbody > tr[id^='_']"
      );
      const arr = [];
      matches.forEach((match) => {
        arr.push(
          new Match([
            week,
            match.children[1].children[2].innerText,
            match.children[2].innerText,
            match.children[3].innerText,
            match.children[4].children[2].innerText,
            match.children[0].innerText == "Final" ? true : false,
            ,
          ])
        );
      });
      return arr;
    });
  return matchWeek;
};

const convertMatchWeeksToTeamsData = (weeksData) => {
  // Prepare the structure for obj.json
  const teamsData = {};

  //get team codes
  const teamCodes = getObj(`${objID}_codes`);

  // Define function to get team codes
  const getTeamCode = (teamName) => {
    return teamCodes ? teamCodes[teamName] : 0;
  };

  // Process each week's matches
  Object.values(weeksData).forEach((weekMatches) => {
    weekMatches.forEach((match) => {
      const { homeTeam, homeGoal, awayTeam, awayGoal, _resMatch, _finished } =
        match;

      const scoreHome = `${homeGoal} - ${awayGoal}`;
      const scoreAway = `${awayGoal} - ${homeGoal}`;

      // Initialize home team data if not present
      if (!teamsData[homeTeam]) {
        teamsData[homeTeam] = {
          result: [],
          score: [],
          vs: [],
          homeOrAway: [],
          teamCode: getTeamCode(homeTeam),
        };
      }
      // Add data for home team, for unfinished put nulls
      teamsData[homeTeam].result.push(_finished ? _resMatch : null);
      teamsData[homeTeam].score.push(_finished ? scoreHome : null);
      teamsData[homeTeam].vs.push(_finished ? awayTeam : null);
      teamsData[homeTeam].homeOrAway.push(_finished ? "L" : null);

      // Initialize away team data if not present
      if (!teamsData[awayTeam]) {
        teamsData[awayTeam] = {
          result: [],
          score: [],
          vs: [],
          homeOrAway: [],
          teamCode: getTeamCode(awayTeam),
        };
      }
      // Add data for away team, for unfinished put nulls
      teamsData[awayTeam].result.push(_finished ? -1 * _resMatch : null);
      teamsData[awayTeam].score.push(_finished ? scoreAway : null);
      teamsData[awayTeam].vs.push(_finished ? homeTeam : null);
      teamsData[awayTeam].homeOrAway.push(_finished ? "V" : null);
    });
  });

  // console.log(teamsData);

  // save teamsData to local storage
  saveObj(teamsData, objID);

  return teamsData;
};

convertMatchWeeksToTeamsData(await getAllMatchWeeks());
