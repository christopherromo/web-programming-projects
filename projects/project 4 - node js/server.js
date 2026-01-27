const fs = require("fs");
const http = require("http");
const path = require("path");
const querystring = require("querystring");
const url = require("url");

const mailList = [];
let idCounter = 0;

const handleRequest = (req, res) => {
  // get the url and the url parts
  const parsedUrl = url.parse(req.url, true);
  const urlParts = parsedUrl.pathname.split("/").filter(Boolean);

  if (
    req.method === "GET" &&
    (parsedUrl.pathname === "/" ||
      parsedUrl.pathname.startsWith("/styles") ||
      parsedUrl.pathname.startsWith("/js"))
  ) {
    // static file handling

    // find the correct file
    let filePath;

    if (parsedUrl.pathname === "/") {
      filePath = path.join(__dirname, "public", "index.html");
    } else {
      filePath = path.join(__dirname, "public", parsedUrl.pathname);
    }

    // find the content type
    const ext = path.extname(filePath);
    let contentType;

    if (ext === ".html") {
      contentType = "text/html";
    } else if (ext === ".css") {
      contentType = "text/css";
    } else if (ext === ".js") {
      contentType = "text/javascript";
    } else {
      contentType = "application/octet-stream";
    }

    // read the file and display
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("file not found.");
        return;
      }

      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    });
  } else if (req.method === "POST" && parsedUrl.pathname === "/api") {
    // get the input
    let body = "";
    req.on("data", (data) => {
      body += data;
    });

    // process the input
    req.on("end", () => {
      try {
        let params;

        // parse the input
        if (req.headers["content-type"] === "application/json") {
          params = JSON.parse(body);
        } else {
          params = querystring.parse(body);
        }

        if (!params.name || !params.email) {
          // provide error message if input is incomplete
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "please enter all fields." }));
          return;
        }

        // give recipient an id, and then add recipient to the mail list
        idCounter += 1;
        params.id = idCounter;
        mailList.push(params);
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            message: "you've joined the email list!",
            entry: params,
          }),
        );
      } catch (err) {
        // provide error message if request is invalid
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "invalid request format." }));
      }
    });
  } else if (req.method === "GET" && parsedUrl.pathname === "/api") {
    const { name, email, id } = parsedUrl.query;

    if (!name && !email && !id) {
      // all entries
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(mailList));
    } else {
      // filters list if URL parameters are present
      const filteredList = mailList.filter(
        (entry) =>
          (name && entry.name === name) ||
          (email && entry.email === email) ||
          (id && entry.id === parseInt(id)),
      );

      if (filteredList.length > 0) {
        // return all matching recipients
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(filteredList));
      } else {
        // provide error message if there are no matching recipients
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "no matching recipients found." }));
      }
    }
  } else if (
    req.method === "GET" &&
    urlParts[0] === "api" &&
    urlParts[1] === "recipient" &&
    urlParts[2]
  ) {
    // get the requested id and find within the mail list
    const id = parseInt(decodeURIComponent(urlParts[2]));
    const recipient = mailList.find((entry) => entry.id === id);

    if (recipient) {
      // return the recipient with the requested id
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(recipient));
    } else {
      // provide error message if requested id is not within the mail list
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "recipient not found." }));
    }
  } else {
    // endpoint not implemented
    res.writeHead(501, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "not implemented." }));
  }
};

// create the server
const server = http.createServer(handleRequest);

// run the server on local host 3000
server.listen(3000, "127.0.0.1", () => {
  console.log("Server running at http://localhost:3000");
});
