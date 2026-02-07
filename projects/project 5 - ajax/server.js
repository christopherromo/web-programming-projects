const fs = require("fs");
const http = require("http");
const path = require("path");
const querystring = require("querystring");
const url = require("url");

const mailList = [];
let idCounter = 0;

// handles incoming requests, incoming 'req', and outgoing 'res'
const handleRequest = (req, res) => {
  // get the url and the url parts
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const pathParts = pathname.split("/").filter(Boolean);

  if (
    req.method === "GET" &&
    (pathname === "/" ||
      pathname.startsWith("/styles") ||
      pathname.startsWith("/js"))
  ) {
    // static file handling

    // find the correct file
    let filePath;

    if (pathname === "/") {
      filePath = path.join(__dirname, "public", "index.html");
    } else {
      filePath = path.join(__dirname, "public", pathname);
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
        // provide error message if file cannot be found (404 = not found)
        res.writeHead(404);
        res.end("file not found.");
        return;
      }

      // return content (200 = ok)
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    });
  } else if (pathname === "/api") {
    if (req.method === "GET") {
      const { name, email, id } = parsedUrl.query;

      if (!name && !email && !id) {
        // return all recipients (200 = ok)
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
          // return all matching recipients (200 = ok)
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(filteredList));
        } else {
          // provide error message if there are no matching recipients (404 = not found)
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "no matching recipients found." }));
        }
      }
    } else if (req.method === "POST") {
      // save request info to body
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
            // provide error message if input is incomplete (400 = bad request)
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "please enter all fields." }));
            return;
          }

          // give recipient an id, and then add recipient to the mail list
          idCounter += 1;
          params.id = idCounter;
          mailList.push(params);

          // return a message stating recipient has been added (201 = created)
          res.writeHead(201, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              message: "you've joined the email list!",
              entry: params,
            }),
          );
        } catch (err) {
          // provide error message if request is invalid (400 = bad request)
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "invalid request format." }));
        }
      });
    }
  } else if (
    pathParts[0] === "api" &&
    pathParts[1] === "recipient" &&
    pathParts[2]
  ) {
    // get the requested id and find within the mail list
    const id = parseInt(decodeURIComponent(pathParts[2]));
    const recipient = mailList.find((recipient) => recipient.id === id);
    const index = mailList.findIndex((recipient) => recipient.id === id);

    // check for recipient
    if (!recipient || index === -1) {
      // provide error message if requested id is not within the mail list (404 = not found)
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "no such recipient." }));
      return;
    }

    if (req.method === "GET") {
      // return the recipient with the requested id (200 = ok)
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(recipient));
    } else if (req.method === "PUT") {
      // save request info to body
      let body = "";
      req.on("data", (data) => {
        body += data;
      });

      // process input
      req.on("end", () => {
        try {
          const { name, email } = JSON.parse(body);

          // save the new name and email
          if (name) recipient.name = name;
          if (email) recipient.email = email;

          // return the updated recipient (200 = ok)
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ message: "recipient updated successfully!" }),
          );
        } catch (err) {
          // provide an error message if the recipient cannot be updated (400 = bad request)
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "request failed." }));
        }
      });
    } else if (req.method === "DELETE") {
      // remove recipient from array
      mailList.splice(index, 1);

      // return a message stating the recipient has been removed (200 = ok)
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "recipient has been removed from the mailing list.",
        }),
      );
    }
  } else {
    // endpoint not implemented (501 = not implemented)
    res.writeHead(501, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "not implemented." }));
  }
};

// create the server
const server = http.createServer(handleRequest);

// run the server on local host 3000
server.listen(3000, "127.0.0.1", () => {
  console.log("server running at http://localhost:3000");
});
