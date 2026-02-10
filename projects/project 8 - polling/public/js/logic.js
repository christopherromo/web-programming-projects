/**
 * logic.js
 *
 * Handles logic for iklafari.mooo.com.
 *
 * Author: Christopher Romo
 */

// fills the list on index.html
async function fillList() {
  // fetch all recipients
  const response = await fetch("/api/recipient");
  const mailList = await response.json();

  // designate area to append
  let theList = document.getElementById("theList");
  theList.innerHTML = "";

  // check if list is empty
  if (mailList.length === 0) {
    let element = document.createElement("p");
    element.textContent = "no recipients yet...";
    theList.append(element);
    return;
  }

  // for each recipient of mailList, create an entry on list
  mailList.forEach((recipient) => {
    // initialize variables
    const { id, name, email } = recipient;
    let element = document.createElement("p");

    // css styling
    element.style.borderTop = "2px double black";
    element.style.borderBottom = "2px double black";
    element.style.textAlign = "center";

    // innerHTML for each entry
    element.innerHTML = `<p>name: ${name}</p><p>email: ${email}</p><p>recipient id: ${id}</p><p><button onclick="editRecipient('${id}')">edit</button> <button onclick="deleteRecipient('${id}')">remove</button></p>`;

    // append element to DOM
    theList.append(element);
  });
} // fillList()

// updates a recipient in the mailing list
async function editRecipient(id) {
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

// deletes a recipient from the mailing list
async function deleteRecipient(id) {
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

// adds a recipient to the mailing list
async function addRecipient() {
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

// adds an account to the API
async function addAccount() {
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

// refresh the list on index.html
setInterval(fillList(), 5000);
