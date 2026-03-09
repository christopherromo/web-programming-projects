/**
 * logic.js
 *
 * handles logic for iklafari.mooo.com.
 *
 * author: christopher romo
 */

class BusinessCard extends HTMLElement {
  // the BusinessCard class defines a business card custom element.

  // constructor for business card custom element.
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });

    const card = document.createElement("div");

    card.innerHTML = `
      <h1><slot name="header">default h1 text</slot></h1>
      <p><slot name="text">default p text</slot></p>
    `;

    shadow.appendChild(card);
  }
} // BusinessCard

function addBusinessCard() {
  // adds a business card to the list.

  // specify elements on HTML
  const name = document.getElementById("name");
  const email = document.getElementById("email");
  const theList = document.getElementById("the-list");

  // create a business card
  const card = document.createElement("div");
  const businessCard = document.createElement("business-card");

  if (name.value.trim() !== "") {
    const headerSpan = document.createElement("span");
    headerSpan.slot = "header";
    headerSpan.textContent = name.value;
    businessCard.append(headerSpan);
  }

  if (email.value.trim() !== "") {
    const textSpan = document.createElement("span");
    textSpan.slot = "text";
    textSpan.textContent = email.value;
    businessCard.append(textSpan);
  }

  card.append(document.createElement("br"));
  card.append(businessCard);

  // clear the input fields
  name.value = "";
  email.value = "";

  // append the card to the list
  theList.append(card);
} // addBusinessCard

function main() {
  // defines the business card custom element.
  customElements.define("business-card", BusinessCard);
} // main

main();
