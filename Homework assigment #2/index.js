/**
 * Primary file for API
 */

// Dependencies
const server = require('./lib/server');

// Declare the app container
let app = {};

// Init function
app.init = ()=> {
    // Start the server
    server.init();
};

// Execute
app.init();

// Export the app
module.export = app;