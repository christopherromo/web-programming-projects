/**
 * logic.js
 *
 * handles logic for iklafari.mooo.com.
 *
 * author: christopher romo
 */

function updateGeoBox() {
  // shows a button to show user's current coordinates if the geolocation API is available.

  let theDiv = document.createElement("div");
  let geoBox = document.getElementById("geo-box");

  if ("geolocation" in navigator) {
    theDiv.innerHTML = `<p>geolocation is available, click the button to continue</p><p><button onclick="getCurrentPos()">show my coordinates</button></p>`;
  } else {
    theDiv.innerHTML = "<p>geolocation is not available.</p>";
  }

  geoBox.append(theDiv);
} // updateGeoBox

function getCurrentPos() {
  // gets the user's current coordinates and sends them to displayCoords.
  navigator.geolocation.getCurrentPosition(displayCoords);
} // getCurrentPos

function displayCoords(position) {
  // displays the user's current coordinates and asks if the user would like to share them.

  let theDiv = document.createElement("div");
  let geoBox = document.getElementById("geo-box");

  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;

  geoBox.innerHTML = "";

  theDiv.innerHTML = `<p>latitude: ${latitude}, longitude: ${longitude}</p><p>click the button below to share your coordinates</p><p><button onclick="share(${latitude}, ${longitude})">share</button></p>`;
  geoBox.append(theDiv);
} // displayCoords

function share(latitude, longitude) {
  // shares the user's coordinates if the share API is available.

  let coordinateString = `latitude: ${latitude}, longitude: ${longitude}`;

  if (navigator.share) {
    navigator.share({ title: "my coordinates", text: `${coordinateString}` });
  } else {
    alert("sharing is not available.");
  }
} // share

function main() {
  // updates the geolocation box on index.html.
  updateGeoBox();
} // main

main();
