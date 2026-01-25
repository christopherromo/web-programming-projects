/**
 * logic.js
 *
 * Handles list maker logic.
 *
 * Author: Christopher Romo
 * Created: 2025-02-10
 */

let globalId = 0;

function updateListName(e) {
  // stop page from refreshing
  e.preventDefault();

  // initialize variables
  let listNameInputField = document.getElementById("listNameInputField");
  let currentListName = document.getElementById("theListName");

  // update list name
  currentListName.innerText = listNameInputField.value;

  // clear out input field
  listNameInputField.value = "";
} // updateListName

function addToList(e) {
  // stop page from refreshing
  e.preventDefault();

  // update global id
  globalId += 1;

  // initialize variables
  let objNameInputField = document.getElementById("objNameInputField");
  let theDiv = document.getElementById("theList");
  let element = document.createElement("p");

  // create element and append to the list
  element.id = globalId;
  element.innerHTML = `<form action='list-maker.html' id='theObjForm${element.id}'><label><b>${objNameInputField.value} </b></label><input type='submit' value='Delete' id='submitButton${element.id}'/></form>`;
  theDiv.append(element);

  // create an eventListener for this specific object
  document
    .querySelector(`#theObjForm${element.id}`)
    .addEventListener("submit", (e) => {
      deleteFromList(e, element.id);
    });

  // clear out input field
  objNameInputField.value = "";
} // addToList

function deleteFromList(e, id) {
  // stop page from refreshing
  e.preventDefault();

  // find element based on id and remove it
  let element = document.getElementById(id);
  element.remove();
} // deleteFromList

function updateBackground(e) {
  // stop page from refreshing
  e.preventDefault();

  // if statement to determine current background color and change accordingly
  if (document.body.style.backgroundColor == "darkblue") {
    document.body.style.backgroundColor = "lightcyan";
  } else {
    document.body.style.backgroundColor = "darkblue";
  }
} // updateBackground

function main() {
  // handle events

  // updates the list title
  document
    .querySelector("#theListNameForm")
    .addEventListener("submit", updateListName);

  // adds an object to the list
  document.querySelector("#theObjForm").addEventListener("submit", addToList);

  // updates the background
  document
    .querySelector("#backgroundButton")
    .addEventListener("click", updateBackground);
} // main

main();
