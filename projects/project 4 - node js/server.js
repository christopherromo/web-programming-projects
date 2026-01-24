const fs = require("fs");
const http = require("http");
const path = require("path");
const querystring = require("querystring");
const url = require("url");

const mailList = [];

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
        res.end("File not found");

        return;
      }

      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    });
  } else if (req.method === "POST" && parsedUrl.pathname === "/api") {
    let body = "";
    req.on("data", (data) => {
      body += data;
    });
    req.on("end", () => {
      try {
        let params;
        if (req.headers["content-type"] === "application/json") {
          params = JSON.parse(body);
        } else {
          params = querystring.parse(body);
        }
        if (!params.Name || !params.Email) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Please enter all fields." }));
          return;
        }
        mailList.push(params);
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "We added you!", entry: params }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid request format." }));
      }
    });
  } else if (req.method === "GET" && parsedUrl.pathname === "/api") {
    const { Name, Email } = parsedUrl.query;

    if (!Name && !Email) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(mailList));
    } else {
      const filteredList = mailList.filter(
        (entry) =>
          (Name && entry.Name === Name) || (Email && entry.Email === Email),
      );
      if (filteredList.length > 0) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(filteredList));
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "No matching entry found." }));
      }
    }
  } else if (
    req.method === "GET" &&
    urlParts[0] === "api" &&
    urlParts[1] === "user" &&
    urlParts[2]
  ) {
    const name = decodeURIComponent(urlParts[2]);
    const user = mailList.find((entry) => entry.Name === name);

    if (user) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(user));
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "User not found." }));
    }
  } else {
    res.writeHead(501, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not Implemented." }));
  }
};

const server = http.createServer(handleRequest);

server.listen(3000, "127.0.0.1", () => {
  console.log("Server running at http://localhost:3000");
});
