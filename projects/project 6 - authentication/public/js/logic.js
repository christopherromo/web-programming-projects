/**
 * logic.js
 *
 * Handles logic for iklafari.mooo.com.
 *
 * Author: Christopher Romo
 * Created: 2025-03-03
 */

// fills the list on index.html
async function fillList() {
  // fetch all recipients
  const response = await fetch("/api");
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
    let recipientName = recipient.name;
    let recipientEmail = recipient.email;
    let recipientId = recipient.id;
    let element = document.createElement("p");

    // css styling
    element.style.borderTop = "2px double black";
    element.style.borderBottom = "2px double black";
    element.style.textAlign = "center";

    // innerHTML for each entry
    element.innerHTML = `<p>name: ${recipientName}</p><p>email: ${recipientEmail}</p><p>recipient id: ${recipientId}</p><p><button onclick="editRecipient('${recipientId}')">edit</button> <button onclick="deleteRecipient('${recipientId}')">delete</button></p>`;

    // append element to DOM
    theList.append(element);
  });
} // fillList()

// updates a recipient in the mailing list
async function editRecipient(id) {
  // fetch specified user and edit
  const editedName = prompt("edit recipient's name (empty for no change):");
  const editedEmail = prompt("edit recipient's email (empty for no change):");

  const response = await fetch(`/api/recipient/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: editedName, email: editedEmail }),
  });

  // refresh the list on index.html
  if (response.ok) {
    alert("recipient updated successfully!");

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
  }
} // deleteRecipient

// adds a recipient to the mailing list
async function addRecipient() {
  // specify elements on HTML
  const name = document.getElementById("name");
  const email = document.getElementById("email");

  // post recipient
  const response = await fetch("/api", {
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

// refresh the list on index.html
fillList();
