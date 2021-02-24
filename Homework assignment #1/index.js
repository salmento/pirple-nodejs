/*
 * Primary file for API
 *
 */

// Dependencies
const http = require('http');
const url = require('url');
//Port number
const port = 5000;

//The server should respond to all request with a string
const server = http.createServer((req, res) => {

    const parseUrl = url.parse(req.url, true)

    const trimmedPath = parseUrl.pathname.replace(/^\/+|\/+$/g, '') 

    const method = req.method.toLowerCase()

    let chosenHandler = handler.notFound;

    if(method === 'get' & typeof(router[trimmedPath]) !== 'undefined'){
        chosenHandler = router[trimmedPath];
    }
    //Route the request to the handler specified oin the router
    chosenHandler((statusCode, payload)=>{
             
             res.setHeader('Content-Type', 'application/json');
             res.writeHead(statusCode);
             res.end(JSON.stringify(payload));
             console.log("Returning this response: ", statusCode, payload);
 
         });
 })
 .listen(port, console.log(`The server is listen on port ${port}`));
 
 //handler object
let handler = {}

//not found handler with status code 404
handler.notFound = function(callback) {
	callback(404);
};

//hello handler with status code 200 and a greeting message
handler.hello = (callback) =>{
	callback(200, {'first': 'Hello World'});
};

// list of handlers
var router = {
	'hello' : handler.hello
}



