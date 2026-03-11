# Web Programming Projects

##### Created by Christopher Romo
##### CS 3110 Programming the Mobile Web : Spring 2025

---

This is a collection of web programming projects from my "Programming the Mobile Web" class. They focus on the fundamentals of web programming, including front-end and back-end components. The class started by focusing on using JavaScript, HTML, and CSS to create web pages. We then transitioned to web development, which involved configuring a web server. Finally, concepts like APIs, authentication, and databases were explored.

## Technologies 💻

   - JavaScript
   - Node.js
   - SQLite
   - HTML
   - CSS
   - APIs
   - nginx
   - Linode

## Features 📄

   - **Web Programming Projects:** The actual code created for the class. Other than slight polishing, these remain functionally identical to what I turned in. Each project is housed in its own folder.

## Reflection 💭

**The Process:** These projects were created sequentially. Each one built on the previous and introduced new concepts. Initial concepts explored include HTML, CSS, and JavaScript. We then setup a web server. This consisted of spinning up a virtual private server (Linode), setting up a web server (nginx), securing a domain (FreeDNS), and implementing HTTPS (Certbot). After setting up my website, *iklafari.mooo.com*, I then installed Node.js for server-side development. Further concepts explored include REST API creation, AJAX, authentication, databases (SQLite), polling, browser-based APIs, and web components. Each project was usually completed in a 1-2 week period.

**Key Takeaways:** This class introduced me to core concepts of web development. To start, JavaScript is a multi-paradigm language, meaning many concepts can be applied to and from other languages. I had been familiar with JavaScript, HTML, and CSS through other projects, but this was the first time I focused on them specifically. They form the backbone of the web, so taking this class proved valuable. I learned many things about web development, like server architecture, API request handling, and asynchronous programming. I expanded my knowledge of authentication and databases, building upon what I already knew from previous courses. Overall, these projects helped me better understand how actual websites are created and maintained.

## Running the Projects 🎬

1. Clone the repository.

2. Ensure Node.js is installed on your computer.

3. Each project is ran differently:

   *For projects 1, 2, 3, and 10:*  
      1. Open `index.html` to run the project.
   
   *For projects 4, 5, 6, 7, 8, and 9:* 
      1. Open a terminal in the desired project directory.
      2. Install dependencies:
         ```bash
         npm install
         ```
      3. Run the server:
         ```bash
         npm start
         ```
      4. Access the project at `http://localhost:3000`.
