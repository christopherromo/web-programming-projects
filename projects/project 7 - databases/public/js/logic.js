/**
 * logic.js
 *
 * handles logic for iklafari.mooo.com.
 *
 * author: christopher romo
 */

async function fillList() {
  // fills the list on index.html.

  // fetch all recipients
  const response = await fetch("/api/recipient");
  const mailList = await response.json();

  // designate area to append
  let theList = document.getElementById("the-list");

  const existingButtons = theList.querySelectorAll("button");
  existingButtons.forEach((button) => {
    button.removeEventListener("click", button._clickHandler);
  });

  theList.innerHTML = "";

  // check if list is empty
  if (mailList.length === 0) {
    let message = document.createElement("p");
    message.textContent = "no recipients yet...";
    theList.append(message);
    return;
  }

  // create an entry on the list for each recipient of mailList
  mailList.forEach((recipient) => {
    let recipientCard = document.createElement("div");
    recipientCard.classList.add("recipient-card");

    const nameP = document.createElement("p");
    nameP.textContent = `name: ${recipient.name}`;

    const emailP = document.createElement("p");
    emailP.textContent = `email: ${recipient.email}`;

    const idP = document.createElement("p");
    idP.textContent = `recipient id: ${recipient.id}`;

    const editButton = document.createElement("button");
    editButton.textContent = "edit";
    editButton.addEventListener("click", () => {
      editRecipient(recipient.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "remove";
    deleteButton.addEventListener("click", () => {
      deleteRecipient(recipient.id);
    });

    const buttonP = document.createElement("p");
    buttonP.append(editButton);
    buttonP.append(" ");
    buttonP.append(deleteButton);

    recipientCard.append(nameP, emailP, idP, buttonP);

    // append element to DOM
    theList.append(recipientCard);
  });
} // fillList

async function editRecipient(id) {
  // updates recipient within the mail list.

  // fetch specified user and edit
  const editedName = prompt("edit recipient's name:");
  const editedEmail = prompt("edit recipient's email:");

  const response = await fetch(`/api/recipient/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: editedName, email: editedEmail }),
  });

  // refresh the list on index.html
  if (response.ok) {
    const data = await response.json();
    alert(data.message);

    await fillList();
  } else {
    const error = await response.json();
    alert(error.error);
  }
} // editRecipient

async function deleteRecipient(id) {
  // removes recipient from the mail list.

  // fetch specified recipient and delete
  const response = await fetch(`/api/recipient/${id}`, {
    method: "DELETE",
  });

  // refresh the list on index.html
  if (response.ok) {
    const data = await response.json();
    alert(data.message);

    await fillList();
  } else {
    const error = await response.json();
    alert(error.error);
  }
} // deleteRecipient

async function addRecipient() {
  // posts recipient to the mail list.

  // specify elements on HTML
  const name = document.getElementById("name");
  const email = document.getElementById("email");

  // post recipient
  const response = await fetch("/api/recipient", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: name.value, email: email.value }),
  });

  // refresh the list on index.html
  if (response.ok) {
    const data = await response.json();
    alert(data.message);

    name.value = "";
    email.value = "";

    await fillList();
  } else {
    const error = await response.json();
    alert(error.error);
  }
} // addRecipient

async function addAccount() {
  // posts account to the account list.

  // specify elements on HTML
  const username = document.getElementById("username");
  const password = document.getElementById("password");

  // post account
  const response = await fetch("/api/account", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: username.value,
      password: password.value,
    }),
  });

  // add account or provide error message
  if (response.ok) {
    const data = await response.json();
    alert(data.message);

    username.value = "";
    password.value = "";
  } else {
    const error = await response.json();
    alert(error.error);
  }
} // addAccount

function main() {
  // calls fillList to populate the list on index.html.
  fillList();
} // main

main();
