/*
* Primary file for the API 
* 
*/

// Dependencies
const http = require('http');
const url = require('url');
const {StringDecoder} = require('string_decoder');

//The server should respond to all request with a string
const server = http.createServer((req, res) => {

   //Get the URL and parse it
    const parseUrl = url.parse(req.url, true)

    //get the path 
    const path = parseUrl.pathname
    const trimmedPath = path.replace(/^\/+|\/+$/g, '')

    //Get the query string as an object
    const queryStringObject = parseUrl.query

    //Get the headers as an object
    const headers = parseUrl.headers;

    //Get Payload if is an
    const decoder= new StringDecoder("utf8")
    let buffer=  ""
    req.on("data", (data) =>{
        buffer+= decoder.write(data)
    })
    req.on("end", () =>{
        buffer+=decoder.end()
        
        //Send the response to
        res.end("Hello world!\n")

        //Log the request path
        console.log("Request received with this payload: " + buffer)

    })
    //Get method
    const method = req.method.toLowerCase() 

   
 

})
//Start the server, and have it listen on port 3000
server.listen(3000, ()=>{
    console.log("The server is listen on port 3000 now")
})