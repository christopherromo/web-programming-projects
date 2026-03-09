/**
 * logic.js
 *
 * handles list maker logic.
 *
 * author: christopher romo
 * created: 2025-02-10
 */

let globalId = 0;

function updateListName(event) {
  // updates the list name

  // stop page from refreshing
  event.preventDefault();

  let listNameFormInputField = document.getElementById(
    "list-name-form-input-field",
  );
  let listName = document.getElementById("list-name");

  // update list name
  listName.textContent = listNameFormInputField.value;

  // clear out input field
  listNameFormInputField.value = "";
} // updateListName

function addToList(event) {
  // adds an item to the list

  event.preventDefault();

  globalId += 1;

  let itemFormInputField = document.getElementById("item-form-input-field");
  let theList = document.getElementById("the-list");

  // create element and append to the list
  let item = document.createElement("div");
  item.id = globalId;

  let form = document.createElement("form");

  let label = document.createElement("label");
  let bold = document.createElement("b");
  bold.textContent = itemFormInputField.value;
  label.append(bold);

  let deleteButton = document.createElement("button");
  deleteButton.type = "submit";
  deleteButton.textContent = "delete";

  // append elements to form
  form.append(label);
  form.append(" ");
  form.append(deleteButton);
  item.append(form);
  item.append(document.createElement("br"));
  theList.append(item);

  // create an eventListener
  form.addEventListener("submit", (event) => {
    deleteFromList(event, item.id);
  });

  // clear out input field
  itemFormInputField.value = "";
} // addToList

function deleteFromList(event, id) {
  // deletes an item from the list

  event.preventDefault();

  // find element based on id and remove it
  let item = document.getElementById(id);

  // remove the item
  item.remove();
} // deleteFromList

function updateBackground(event) {
  // updates the background color of the page

  event.preventDefault();

  // determine current background color and change accordingly
  if (document.body.style.backgroundColor == "darkblue") {
    document.body.style.backgroundColor = "lightcyan";
  } else {
    document.body.style.backgroundColor = "darkblue";
  }
} // updateBackground

function main() {
  // handles events

  // update the list name
  document
    .querySelector("#list-name-form")
    .addEventListener("submit", updateListName);

  // add an item to the list
  document.querySelector("#item-form").addEventListener("submit", addToList);

  // update the background color of the page
  document
    .querySelector("#background-button")
    .addEventListener("click", updateBackground);
} // main

main();
