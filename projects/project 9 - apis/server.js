const fs = require("fs");
const http = require("http");
const path = require("path");
const url = require("url");

const handleRequest = async (req, res) => {
  // handles incoming requests and sends response.

  // get the url and the url parts
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  if (
    req.method === "GET" &&
    (pathname === "/" ||
      pathname.startsWith("/js") ||
      pathname.startsWith("/styles") ||
      pathname.endsWith(".html"))
  ) {
    // static file handling.

    // find the correct file
    let filePath;

    if (pathname === "/") {
      filePath = path.join(__dirname, "public", "index.html");
    } else {
      filePath = path.join(__dirname, "public", pathname);
    }

    filePath = path.normalize(filePath);

    // read the file and display
    fs.readFile(filePath, (err, data) => {
      if (err) {
        // provide error message if file cannot be found (404 = not found)
        res.writeHead(404);
        res.end("file not found.");
        return;
      }

      // find the content type
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes = {
        ".html": "text/html",
        ".css": "text/css",
        ".js": "text/javascript",
      };

      const contentType = mimeTypes[ext] || "application/octet-stream";

      // return content (200 = ok)
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    });
    return;
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
