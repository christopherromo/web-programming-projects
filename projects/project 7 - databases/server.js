const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
const path = require("path");
const querystring = require("querystring");
const sqlite3 = require("sqlite3");
const url = require("url");

const databaseDirectory = path.join(__dirname, "data");

if (!fs.existsSync(databaseDirectory)) {
  fs.mkdirSync(databaseDirectory, { recursive: true });
}

const databasePath = path.join(databaseDirectory, "database.db");

// create the database and the functions for accessing the recipients and accounts tables
const database = new sqlite3.Database(databasePath);

let recipients = {};
let accounts = {};

database.serialize(() => {
  // create the recipients table if it doesn't already exist
  database.run(`
    CREATE TABLE IF NOT EXISTS recipients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL
    )
  `);

  // define the prepared statements for the recipients table
  const selectRecipient = database.prepare(
    `SELECT * FROM recipients WHERE id = ?`,
  );

  const insertRecipient = database.prepare(
    `INSERT INTO recipients (name, email) VALUES (?, ?)`,
  );

  const updateRecipient = database.prepare(
    `UPDATE recipients SET name = ?, email = ? WHERE id = ?`,
  );

  const deleteRecipient = database.prepare(
    `DELETE FROM recipients WHERE id = ?`,
  );

  // promisify the sqlite functions, so that they can be used with async/await
  recipients.select = (id) =>
    new Promise((resolve, reject) => {
      selectRecipient.get(id, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

  recipients.selectAll = () =>
    new Promise((resolve, reject) => {
      database.all("SELECT * FROM recipients", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

  recipients.insert = (name, email) =>
    new Promise((resolve, reject) => {
      insertRecipient.run(name, email, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID });
      });
    });

  recipients.update = (name, email, id) =>
    new Promise((resolve, reject) => {
      updateRecipient.run(name, email, id, function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });

  recipients.delete = (id) =>
    new Promise((resolve, reject) => {
      deleteRecipient.run(id, function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });

  // create the accounts table if it doesn't already exist
  database.run(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )
  `);

  // define the prepared statements for the accounts table
  const selectAccount = database.prepare(
    `SELECT * FROM accounts WHERE username = ?`,
  );

  const insertAccount = database.prepare(
    `INSERT INTO accounts (username, password) VALUES (?, ?)`,
  );

  // promisify the sqlite functions, so that they can be used with async/await
  accounts.select = (username) =>
    new Promise((resolve, reject) => {
      selectAccount.get(username, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

  accounts.insert = (username, password) =>
    new Promise((resolve, reject) => {
      insertAccount.run(username, password, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID });
      });
    });
});

// export the database and the functions for accessing the recipients and accounts tables
module.exports = { database, recipients, accounts };

// create a hash of the password passed in
const hashPassword = (password) =>
  crypto.createHash("sha256").update(password).digest("hex");

// verify the login
const verifyLogin = async (username, password) => {
  if (!username || !password) return false;
  const row = await accounts.select(username);
  return row && row.password === hashPassword(password);
};

// parse the authorization header
const parseBasicAuthHeader = (req) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Basic ")) {
    return null;
  }

  const decoded = Buffer.from(header.slice(6), "base64").toString();
  const index = decoded.indexOf(":");
  if (index === -1) return null;

  const username = decoded.slice(0, index);
  const password = decoded.slice(index + 1);

  if (!username || !password) return null;

  return [username, password];
};

// provide error message stating the user couldn't be authenticated
const sendUnauthorizedRequest = (res) => {
  res.writeHead(401, {
    "WWW-Authenticate": 'Basic realm="project7-databases"',
    "Content-Type": "application/json",
  });
  res.end(JSON.stringify({ error: "we couldn't authenticate you." }));
};

// authenticates user
const authenticateRequest = async (req, res) => {
  const account = parseBasicAuthHeader(req);
  if (!account) {
    sendUnauthorizedRequest(res);
    return null;
  }

  const [username, password] = account;
  const valid = await verifyLogin(username, password);

  if (!valid) {
    sendUnauthorizedRequest(res);
    return null;
  }

  return username;
};

// handles incoming requests, incoming 'req', and outgoing 'res'
const handleRequest = async (req, res) => {
  // get the url and the url parts
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const pathParts = pathname.split("/").filter(Boolean);

  if (
    req.method === "GET" &&
    (pathname === "/" ||
      pathname.startsWith("/js") ||
      pathname.startsWith("/styles") ||
      pathname.endsWith(".html"))
  ) {
    // static file handling

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
        ".json": "application/json",
      };

      const contentType = mimeTypes[ext] || "application/octet-stream";

      // return content (200 = ok)
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    });
    return;
  } else if (
    pathParts[0] === "api" &&
    pathParts[1] === "recipient" &&
    pathParts[2]
  ) {
    // get the requested id
    const id = Number(pathParts[2]);
    if (!Number.isInteger(id)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "invalid recipient id." }));
      return;
    }

    // get the recipient from the database
    const recipient = await recipients.select(id);

    // check for recipient
    if (!recipient) {
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
      // authenticate the user
      const username = await authenticateRequest(req, res);
      if (!username) return;

      // save request info to body
      let body = "";
      req.on("data", (data) => {
        body += data;
      });

      // process input
      req.on("end", async () => {
        try {
          const { name, email } = JSON.parse(body);

          // save the new name and email
          if (!name || !email) {
            // provide an error message if the fields aren't complete (400 = bad request)
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "please enter all fields." }));
            return;
          }

          // update the recipient in the database
          await recipients.update(name, email, id);
          const updatedRecipient = await recipients.select(id);

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
      // authenticate the user
      const username = await authenticateRequest(req, res);
      if (!username) return;

      // remove recipient from array
      await recipients.delete(id);

      // return a message stating the recipient has been removed (200 = ok)
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "recipient has been removed from the mailing list.",
        }),
      );
    }
  } else if (pathParts[0] === "api" && pathParts[1] === "recipient") {
    if (req.method === "GET") {
      // return all recipients (200 = ok)
      const recipientsList = await recipients.selectAll();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(recipientsList));
    } else if (req.method === "POST") {
      // authenticate the user
      const username = await authenticateRequest(req, res);
      if (!username) return;

      // save request info to body
      let body = "";
      req.on("data", (data) => {
        body += data;
      });

      // process the input
      req.on("end", async () => {
        try {
          let params;

          // parse the input
          if (req.headers["content-type"]?.includes("application/json")) {
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

          const result = await recipients.insert(params.name, params.email);

          // return a message stating recipient has been added (201 = created)
          res.writeHead(201, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              message: "you've joined the email list!",
              id: result.lastID,
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
  } else if (pathParts[0] === "api" && pathParts[1] === "account") {
    if (req.method === "GET") {
      // provide an error message if users try to get an account
      res.writeHead(405, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "not allowed." }));
    } else if (req.method === "POST") {
      // save request info to body
      let body = "";
      req.on("data", (data) => {
        body += data;
      });

      // process the input
      req.on("end", async () => {
        try {
          let params;

          // parse the input
          if (req.headers["content-type"]?.includes("application/json")) {
            params = JSON.parse(body);
          } else {
            params = querystring.parse(body);
          }

          if (!params.username || !params.password) {
            // provide error message if input is incomplete (400 = bad request)
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "please enter all fields." }));
            return;
          }

          // check to see if the username is already taken
          const userCheck = await accounts.select(params.username);

          if (userCheck) {
            // provide an error message if the username is taken (409 = conflict)
            res.writeHead(409, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ error: "this username is already taken." }),
            );
            return;
          }

          await accounts.insert(params.username, hashPassword(params.password));

          // return a message stating recipient has been added (201 = created)
          res.writeHead(201, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              message: "your account has been registered!",
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
  } else if (pathname === "/api") {
    // return a general message stating the fields
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "welcome to the API. current fields: 'recipient' & 'account'.",
      }),
    );
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
