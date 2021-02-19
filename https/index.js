// Dependencies
const http = require('http');
const https = require('https')
const url = require('url');
const fs = require('fs');
const {StringDecoder} = require('string_decoder');
const config = require('./config')

 // Instantiate the HTTP server
const httpServer = http.createServer((req, res) => {
    unifiedServer(req, res)
});

httpServer.listen(config.httpPort, ()=>{
    console.log(`The HTTP server is running on port ${config.httpPort}`)
});


const httpsServerOptions = {
    'key': fs.readFileSync('./key.pem'),
    'cert': fs.readFileSync('./cert.pem')
}

const httpsServer =https.createServer(httpsServerOptions, (req, res) => {
    unifiedServer(req, res)
});

httpsServer.listen(config.httpsPort, ()=>{
    console.log(`The HTTPS server is running on port ${config.httpsPort}`)
});


const unifiedServer= (req, res) =>{

    // Parse the url
    const parsedUrl = url.parse(req.url, true);
      
    // Get the path
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');
      
    // Get the query string as an object
    const queryStringObject = parsedUrl.query;
      
    // Get the HTTP method
    const method = req.method.toLowerCase();
      
    //Get the headers as an object
    const headers = req.headers;
      
    // Get the payload,if any
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
        
    req.on('data', function(data) {
        buffer += decoder.write(data);
    });
    req.on('end', function() {
         buffer += decoder.end();
      
        // Check the router for a matching path for a handler. If one is not found, use the notFound handler instead.
        const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;
      
        // Construct the data object to send to the handler
        const data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'headers' : headers,
            'payload' : buffer
        };
      
        // Route the request to the handler specified in the router
        chosenHandler(data,(statusCode,payload)=>{
      
            // Use the status code returned from the handler, or set the default status code to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
        
            // Use the payload returned from the handler, or set the default payload to an empty object
            payload = typeof(payload) == 'object'? payload : {};
        
            // Convert the payload to a string
            const payloadString = JSON.stringify(payload);
        
            // Return the response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
            console.log("Returning this response: ",statusCode,payloadString);
        
        });
      
    });
};
      
// Define all the handlers
const handlers = {};
      
// Sample handler
handlers.sample = function(data,callback){
    callback(406,{'name':'sample handler'});
};
      
// Not found handler
handlers.notFound = function(data,callback){
    callback(404);
};
      
// Define the request router
const router = {
    'sample' : handlers.sample
};
