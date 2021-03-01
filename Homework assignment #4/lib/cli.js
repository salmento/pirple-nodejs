/*
 * CLI-related tasks
 *
 */

// Dependencies
var readline = require("readline");
var util = require("util");
var debug = util.debuglog("cli");
var events = require("events");
class _events extends events {}
var e = new _events();
var os = require("os");
var v8 = require("v8");
var _data = require("./data");
var _logs = require("./logs");
var helpers = require("./helpers");

// Instantiate the cli module object
var cli = {};

// Input handlers
e.on("help", function(str) {
  cli.responders.help();
});

e.on("exit", function(str) {
  cli.responders.exit();
});

e.on("view menus", function(str) {
  cli.responders.viewMenus();
});

e.on("view orders", function(str) {
  cli.responders.viewOrders(str);
});

e.on("list users", function(str) {
  cli.responders.listUsers(str);
});

// Responders object
cli.responders = {};

// Create a vertical space
cli.verticalSpace = function(lines) {
  lines = typeof lines == "number" && lines > 0 ? lines : 1;
  for (i = 0; i < lines; i++) {
    console.log("");
  }
};

// Create a horizontal line across the screen
cli.horizontalLine = function() {
  // Get the available screen size
  var width = process.stdout.columns;

  // Put in enough dashes to go across the screen
  var line = "";
  for (i = 0; i < width; i++) {
    line += "-";
  }
  console.log(line);
};

// Create centered text on the screen
cli.centered = function(str) {
  str = typeof str == "string" && str.trim().length > 0 ? str.trim() : "";

  // Get the available screen size
  var width = process.stdout.columns;

  // Calculate the left padding there should be
  var leftPadding = Math.floor((width - str.length) / 2);

  // Put in left padded spaces before the string itself
  var line = "";
  for (i = 0; i < leftPadding; i++) {
    line += " ";
  }
  line += str;
  console.log(line);
};

// Exit
cli.responders.exit = function() {
  process.exit(0);
};

// Help / Man
cli.responders.help = function() {
  // Codify the commands and their explanations
  var commands = {
    exit: "Kill the CLI (and the rest of the application)",
    help: "Show this help page",
    "View menus": "View all the menus",
    "View orders":
      "View orders. Available parameters --24|all|id. Usage example: view orders --all or view orders --id orderId",
    "List users":
      "List users. Available parameters --24|all|email. Usage example: list users --all or list users --email syahrul@test.com"
  };

  // Show a header for the help page that is as wide as the screen
  cli.horizontalLine();
  cli.centered("CLI MANUAL");
  cli.horizontalLine();
  cli.verticalSpace(2);

  // Show each command, followed by its explanation, in white and yellow respectively
  for (var key in commands) {
    if (commands.hasOwnProperty(key)) {
      var value = commands[key];
      var line = "      \x1b[33m " + key + "      \x1b[0m";
      var padding = 60 - line.length;
      for (i = 0; i < padding; i++) {
        line += " ";
      }
      line += value;
      console.log(line);
      cli.verticalSpace();
    }
  }
  cli.verticalSpace(1);

  // End with another horizontal line
  cli.horizontalLine();
};

// View menus
cli.responders.viewMenus = function() {
  // Available menu
  const listOfMenu = {
    1: {
      name: "Margherita",
      price: 2.99,
      description: "Tomato sauce, mozzarella, and oregano"
    },
    2: {
      name: "Marinara.",
      price: 4.99,
      description: "Tomato sauce, garlic and basil"
    },
    3: {
      name: "Quattro Stagioni.",
      price: 5.99,
      description:
        "Tomato sauce, mozzarella, mushrooms, ham, artichokes, olives, and oregano"
    },
    4: {
      name: "Carbonara.",
      price: 6.99,
      description: "Tomato sauce, mozzarella, parmesan, eggs, and bacon"
    },
    5: {
      name: "Frutti di Mare.",
      price: 4.99,
      description: "Tomato sauce and seafood"
    },
    6: {
      name: "Quattro Formaggi.",
      price: 5.99,
      description:
        "Tomato sauce, mozzarella, parmesan, gorgonzola cheese, artichokes, and oregano"
    },
    7: {
      name: "Crudo.",
      price: 3.99,
      description: "Tomato sauce, mozzarella and Parma ham"
    },
    8: {
      name: "Napoletana or Napoli.",
      price: 6.99,
      description: "Tomato sauce, mozzarella, oregano, anchovies"
    },
    9: {
      name: "Pugliese.",
      price: 12.99,
      description: "Tomato sauce, mozzarella, oregano, and onions"
    },
    10: {
      name: "Montanara.",
      price: 15.99,
      description:
        "Tomato sauce, mozzarella, mushrooms, pepperoni, and Stracchino (soft cheese)"
    }
  };
  console.log(JSON.stringify(listOfMenu, null, 4));
};

// List Users
cli.responders.listUsers = function(str) {
  var arr = str.split("--");
  // return if user don't specify the parameters
  if (arr.length <= 1) return;
  var email = arr[1].split(" ");
  var check =
    typeof arr[1] == "string" && arr[1].trim().length > 0
      ? arr[1].trim()
      : false;
  if (check) {
    _data.list("users", function(err, userIds) {
      if (!err && userIds && userIds.length > 0) {
        cli.verticalSpace();
        userIds.forEach(function(userId) {
          _data.read("users", userId, function(err, userData) {
            if (!err && userData) {
              if (arr[1] == "all") {
                var line =
                  "Name: " +
                  userData.firstName +
                  " | " +
                  userData.lastName +
                  " | " +
                  "Email: " +
                  userData.email;
                console.log(line);
                cli.verticalSpace();
              }
              if (arr[1] == "24") {
                const time = userData.time;
                const futureTime = new Date();
                futureTime.setHours(-24); // past 24 hours
                if (time >= futureTime.getTime()) {
                  var line =
                    "Name: " +
                    userData.firstName +
                    " | " +
                    userData.lastName +
                    " | " +
                    "Email: " +
                    userData.email;
                  console.log(line);
                  cli.verticalSpace();
                }
              }
              if (email[0] == "email") {
                if (userData.email == email[1]) {
                  var line =
                    "Name: " +
                    userData.firstName +
                    " | " +
                    userData.lastName +
                    " | " +
                    "Email: " +
                    userData.email +
                    " | " +
                    "Phone: " +
                    userData.phone +
                    " | " +
                    "Address: " +
                    userData.address;
                  console.log(line);
                  cli.verticalSpace();
                }
              }
            }
          });
        });
      }
    });
  }
};

// View Orders
cli.responders.viewOrders = function(str) {
  // Get ID from string
  var arr = str.split("--");
  // return if user don't specify the parameters
  if (arr.length <= 1) return;
  var id = arr[1].split(" ");
  var check =
    typeof arr[1] == "string" && arr[1].trim().length > 0
      ? arr[1].trim()
      : false;
  if (check) {
    _data.list("orders", function(err, orders) {
      if (!err && orders && orders.length > 0) {
        cli.verticalSpace();
        orders.forEach(function(orderId) {
          _data.read("orders", orderId, function(err, userData) {
            if (!err && userData) {
              if (arr[1] == "all") {
                var line =
                  "Order ID: " +
                  orderId +
                  " | " +
                  "Email: " +
                  userData.email +
                  " | " +
                  "Item: " +
                  JSON.stringify(userData.item) +
                  " | " +
                  "Amount: " +
                  userData.amount;
                console.log(line);
                cli.verticalSpace();
              }
              if (arr[1] == "24") {
                const time = userData.time;
                const futureTime = new Date();
                futureTime.setHours(-24); // past 24 hours
                if (time >= futureTime.getTime()) {
                  var line =
                    "Order ID: " +
                    orderId +
                    " | " +
                    "Email: " +
                    userData.email +
                    " | " +
                    "Item: " +
                    JSON.stringify(userData.item) +
                    " | " +
                    "Amount: " +
                    userData.amount;
                  console.log(line);
                  cli.verticalSpace();
                }
              }
              if (id[0] == "id") {
                if (orderId == id[1]) {
                  var line =
                    "Order ID: " +
                    orderId +
                    " | " +
                    "Email: " +
                    userData.email +
                    " | " +
                    "Item: " +
                    JSON.stringify(userData.item) +
                    " | " +
                    "Amount: " +
                    userData.amount;
                  console.log(line);
                  cli.verticalSpace();
                }
              }
            }
          });
        });
      }
    });
  }
};

// Input processor
cli.processInput = function(str) {
  str = typeof str == "string" && str.trim().length > 0 ? str.trim() : false;
  // Only process the input if the user actually wrote something, otherwise ignore it
  if (str) {
    // Codify the unique strings that identify the different unique questions allowed be the asked
    var uniqueInputs = [
      "help",
      "exit",
      "view menus",
      "view orders",
      "list users"
    ];

    // Go through the possible inputs, emit event when a match is found
    var matchFound = false;
    var counter = 0;
    uniqueInputs.some(function(input) {
      if (str.toLowerCase().indexOf(input) > -1) {
        matchFound = true;
        // Emit event matching the unique input, and include the full string given
        e.emit(input, str);
        return true;
      }
    });

    // If no match is found, tell the user to try again
    if (!matchFound) {
      console.log("Sorry, try again");
    }
  }
};

// Init script
cli.init = function() {
  // Send to console, in dark blue
  console.log("\x1b[34m%s\x1b[0m", "The CLI is running");

  // Start the interface
  var _interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: ""
  });

  // Create an initial prompt
  _interface.prompt();

  // Handle each line of input separately
  _interface.on("line", function(str) {
    // Send to the input processor
    cli.processInput(str);

    // Re-initialize the prompt afterwards
    _interface.prompt();
  });

  // If the user stops the CLI, kill the associated process
  _interface.on("close", function() {
    process.exit(0);
  });
};

// Export the module
module.exports = cli;
