// console.log( 'content.js' );
const scriptNames = [
  "app.js",
  // "modules/storage.js",
];

const styleNames = ["./style/style.css"];

const imageNames = [
  "modules/utils/icons/up.svg",
  "modules/utils/icons/equal.svg",
  "modules/utils/icons/down.svg",
];

const div = document.createElement("div");
div.innerText = chrome.runtime.id;
div.classList.add("chromeExtensionID");
div.style.display = "none";
(document.body || document.documentElement).appendChild(div);

setTimeout(scriptsLoad, 1000);
setTimeout(stylesLoad, 1000);
setTimeout(imagesLoad, 1000);

function scriptsLoad() {
  scriptNames.map((scriptName) => {
    // console.log( "Se cargó el script " + scriptName );
    let elem = document.createElement("script");
    elem.setAttribute("src", chrome.runtime.getURL(scriptName));
    // if ( scriptName == "app.js" ) elem.setAttribute( "type", "module" );
    elem.setAttribute("type", "module");
    elem.onload = () => elem.remove();
    (document.head || document.documentElement).appendChild(elem);
  });
}

function stylesLoad() {
  styleNames.map((styleName) => {
    // console.log( "Se cargó el script " + styleName );
    let elem = document.createElement("style");
    elem.setAttribute("src", chrome.runtime.getURL(styleName));
    elem.onload = () => elem.remove();
    (document.head || document.documentElement).appendChild(elem);
  });
}

function imagesLoad() {
  imageNames.map((imageName) => {
    // console.log( "Se cargó el script " + styleName );
    let elem = document.createElement("img");
    elem.setAttribute("src", chrome.runtime.getURL(imageName));
    elem.onload = () => elem.remove();
    (document.head || document.documentElement).appendChild(elem);
  });
}
