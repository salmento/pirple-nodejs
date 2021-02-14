/*
* Primary file for the API 
* 
*/

// Dependencies
const http = require('http');
const url = require('url');

//The server should respond to all request with a string
const server = http.createServer((req, res) => {
   //Get the URL and parse it
    const parseUrl = url.parse(req.url, true)
    //get the path 
    const path = parseUrl.pathname
    const trimmedPath = path.replace(/^\/+|\/+$/g, '')
   //Send the response to
    res.end("Hello World!!!")
   //Log the request path
   console.log(trimmedPath)
 

})
//Start the server, and have it listen on port 3000
server.listen(3000, ()=>{
    console.log("The server is listen on port 3000 now")
})