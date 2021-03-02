/**
 * Primary file for the API
 *
 */

// Dependencies
const http = require("http");
const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;
const config = require("./config");
var cluster = require("cluster");
var os = require("os");
let queryStringObject;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Keep track of http requests
  // let numReqs = 0;
  // setInterval(() => {
  //   console.log(`Number of request = ${numReqs}`);
  // }, 1000);

  // Count requests
  // function messageHandler(msg, worker) {
  //   if (msg.cmd && msg.cmd === "notifyRequest") {
  //     numReqs += 1;
  //   }
  // }

  // Fork workers.
  for (let i = 0; i < os.cpus().length; i++) {
    cluster.fork();
  }

  for (const id in cluster.workers) {
    cluster.workers[id].on("message", msg => {
      console.log(
        `Worker id ${cluster.workers[id].process.pid} handles the request`
      );
      // messageHandler(msg);
    });
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
  });
} else {
  // Instantiate the HTTP server
  const httpServer = http
    .createServer((request, response) => {
      unifiedServer(request, response);
    })
    .listen(config.httpPort, () => {
      console.log(`The server is listening on port ${config.httpPort} in ${
        config.envName
      } now. Worker ${process.pid} started
    `);
    });
}

// Define handler
let handlers = {};

// Ping handler
handlers.hello = (data, callback) => {
  callback(200, helloOutput());
};

// Not found handler
handlers.notFound = (data, callback) => {
  callback(404);
};

// Define a request router
const router = {
  hello: handlers.hello
};

// All the server logic for both http
const unifiedServer = (request, response) => {
  // Get the URL and parse it
  const parsedURL = url.parse(request.url, true);

  // Get the path
  const path = parsedURL.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, "");

  // Get the query string as an object
  queryStringObject = parsedURL.query;

  // Get the HTTP method
  const method = request.method.toLowerCase();

  // Get the Headers as an object
  const headers = request.headers;

  // Get the payload, if any
  const decoder = new StringDecoder("utf-8");
  let buffer = "";

  request.on("data", data => {
    buffer += decoder.write(data);
  });

  request.on("end", () => {
    buffer += decoder.end();

    // Choose the handler this request should go to, if one is not found, use the not found handler
    const chosenHandler =
      typeof router[trimmedPath] !== "undefined"
        ? router[trimmedPath]
        : handlers.notFound;

    // Construct the data object to send to the handler
    const data = {
      trimmedPath,
      queryStringObject,
      method,
      headers,
      payload: buffer
    };

    // Route the request to the handler specify in the router
    chosenHandler(data, (statusCode, payload) => {
      // Use the status code called back by the handler, or default to 200
      statusCode = typeof statusCode === "number" ? statusCode : 200;

      // Use the payload called back by the handler or default to an empty object
      payload = typeof payload === "object" ? payload : {};

      // Convert the payload to a string
      const payloadString = JSON.stringify(payload);

      // Return the response
      response.setHeader("Content-Type", "application/json");
      response.writeHead(statusCode);

      // notify master about the request
      process.send({ cmd: "notifyRequest" });

      response.end(payloadString);
    });
  });
};

const helloOutput = () => {
  const messages = ["Hello World", "Hello There", "Hello Internet"];
  // short circuit, set to 1 if param is undefined
  const total = queryStringObject.count == 0 ? 1 : queryStringObject.count || 1;
  let output = {};
  if (total <= 3) {
    for (var i = 0; i < total; i++) {
      output[i] = messages[i];
    }
    return output;
  }
  return {
    error: "Count must be less than or equal to 3"
  };
};
