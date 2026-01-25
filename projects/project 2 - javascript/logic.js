/**
 * logic.js
 *
 * Handles list maker logic.
 *
 * Author: Christopher Romo
 * Created: 2025-02-10
 */

let globalId = 0;

function updateListName(event) {
  // stop page from refreshing
  event.preventDefault();

  // initialize variables
  let listNameFormInputField = document.getElementById(
    "listNameFormInputField",
  );
  let listName = document.getElementById("listName");

  // update list name
  listName.innerText = listNameFormInputField.value;

  // clear out input field
  listNameFormInputField.value = "";
} // updateListName

function addToList(event) {
  // stop page from refreshing
  event.preventDefault();

  // update global id
  globalId += 1;

  // initialize variables
  let objFormInputField = document.getElementById("objFormInputField");
  let theList = document.getElementById("theList");
  let element = document.createElement("p");

  // create element and append to the list
  element.id = globalId;
  element.innerHTML = `<form action='index.html' id='obj${element.id}'><label><b>${objFormInputField.value} </b></label><input type='submit' value='Delete' id='objSubmitButton${element.id}'/></form>`;
  theList.append(element);

  // create an eventListener for this specific object
  document
    .querySelector(`#obj${element.id}`)
    .addEventListener("submit", (event) => {
      deleteFromList(event, element.id);
    });

  // clear out input field
  objFormInputField.value = "";
} // addToList

function deleteFromList(event, id) {
  // stop page from refreshing
  event.preventDefault();

  // find element based on id and remove it
  let element = document.getElementById(id);

  // remove the event listener
  const form = document.getElementById(`obj${id}`);
  if (form) {
    form.removeEventListener("submit", deleteFromList);
  }

  element.remove();
} // deleteFromList

function updateBackground(event) {
  // stop page from refreshing
  event.preventDefault();

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
    .querySelector("#listNameForm")
    .addEventListener("submit", updateListName);

  // adds an object to the list
  document.querySelector("#objForm").addEventListener("submit", addToList);

  // updates the background
  document
    .querySelector("#backgroundButton")
    .addEventListener("click", updateBackground);
} // main

main();
