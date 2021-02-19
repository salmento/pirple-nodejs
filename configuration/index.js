/*
* Primary file for the API 
* 
*/

// Dependencies
const http = require('http');
const url = require('url');
const {StringDecoder} = require('string_decoder');
const config = require('./config')

//The server should respond to all request with a string
const server = http.createServer((req, res) => {

   /*Get the URL and parse it 
   *Allow to split address into readable object
   *Result json object
   */
    const parseUrl = url.parse(req.url, true)

    /*get the pathname 
    *Example:  the path name of: localhost:3000/salmento/software
    *is /salmento/software
    *the query is not included
    */
    const path = parseUrl.pathname

    //return salmento/software
    const trimmedPath = path.replace(/^\/+|\/+$/g, '') 

    /*Get the query string as an object
    *Put all the query content into an object
    *localhost:3000?query= salmento 
    *result { query: 'salmento' }
    */
    const queryStringObject = parseUrl.query
 
    //Get the headers as an object
    const headers = req.headers

    //Get method
    const method = req.method.toLowerCase() 
    
    //Get Payload if is an
    const decoder= new StringDecoder("utf8")
    let buffer=  ""
    req.on("data", (data) =>{
        buffer+= decoder.write(data)
    })
    req.on("end", () =>{
        buffer+=decoder.end()
        
        //Choose the handler this request should go to. if is not, use the not found handler 
        let chosenHandler = router[trimmedPath] || handlers.notFound;

        //Construct the object to send to the  handler
        const data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': buffer,
        }
        //Route the request to the handler specified oin the router
        chosenHandler(data, (statusCode, payload)=>{
            //Use the status code returned by the handler or, use default status code 200
            statusCode = typeof(statusCode) === 'number' ? statusCode : 200;

            // Use the payload returned from the handler, or set the default payload to an empty object
            payload = typeof(payload) === 'object' ? payload : {};
            // Convert the payload to a string
            const payloadString = JSON.stringify(payload);

           // Return the response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
            console.log("Returning this response: ", statusCode, payloadString);

        });
    });
});

//Start the server
server.listen(config.port, ()=>{
    console.log("The server is listen on port "+config.port+" in "+config.envName +" mode")
})
//Define handlers 
let handlers ={}
//Sample handlers
handlers.sample= (data, callback)=>{
    //callback http status code, and a payload object 
    callback(406,{"name":"Sample handler"} )
}
//Not found handlers
handlers.notFound= (data, callback)=>{
    callback(404)
}

//Define the request routes
const router ={
    "sample": handlers.sample
}