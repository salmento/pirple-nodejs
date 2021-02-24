/**
 * Request handlers
 */

// Dependencies
const _data = require('./data');
const helpers = require('./helpers');


//menu items
let menuItemsData = [
    {"id": 1, "name": "Small Pizza", "price": 9.99 },
    {"id": 2, "name": "Medium Pizza", "price": 19.99 },
    {"id": 3, "name": "Large Pizza", "price": 29.99 },
    {"id": 4, "name": "Small Soda", "price": 2.50 },
    {"id": 5, "name": "Medium Soda", "price": 3.50 },
    {"id": 6, "name": "Large Soda", "price": 4.50 },
];

// Define handlers
let handlers = {};

// Users
handlers.users = (data, callback) =>{
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        callback(405);
    }
}

// Container for the users sub methods
handlers._users = {};

// Users - post
// Required data: firstName, lastName, phone, password, email, address
// Optional data: none
handlers._users.post = function(data, callback) {
    // Check that all required fields are filled out
    let firstName = typeof(data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    let lastName = typeof(data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    let phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    let password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    // Validate e-mail address with a regular expression: something@something.something is a valid e-mail
    let emailRegex = /\S+@\S+\.\S+/;
    let email = typeof(data.payload.email) === 'string' && emailRegex.test(data.payload.email) ? data.payload.email.trim() : false;
    let address = typeof(data.payload.address) === 'string' && data.payload.address.trim().length > 0 ? data.payload.address.trim() : false;

    if (firstName && lastName && phone & password && email && address) {
        // Make sure the users doesn't already exist
        _data.read('users', phone, (err, data)=>{
            if(err) {
                // Hash the password
                const hashedPassword = helpers.hash(password);

                if (hashedPassword) {
                    // Create the user object
                    const userObject = {
                        'firstName' : firstName,
                        'lastName' : lastName,
                        'phone' : phone,
                        'hashedPassword' : hashedPassword,
                        'email' : email,
                        'address' : address
                    };

                    // Store the user
                    _data.create('users', phone, userObject, err => {
                        if (!err) {
                            callback(200);
                        } else {
                            callback(500, {'Error' : 'Could not create the new user.'})
                        }
                    });
                } else {
                    callback(500, {'Error' : 'Could not hash the user\'s password.'});
                }    
            } else {
                // User already exists
                callback(400, {'Error': 'A user with that phone number already exists.'});
            }
        });
    } else {
        callback(400, {'Error' : 'Missing required fields.'});
    }
};

// Users - get
// Required data: phone
// Optional data: none
handlers._users.get = (data, callback)=> {
    // Check that the phone number is valid
    const phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length === 10 ? data.queryStringObject.phone.trim() : false;
    if (phone) {
        // Get the token from the headers
        const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
        // Verify that the given token is valid for the phone number
        handlers._tokens.verifyToken(token, phone, tokenIsValid => {
            if (tokenIsValid) {
                // Lookup the user
                _data.read('users', phone, (err, data) =>{
                    if(!err && data) {
                        // Remove the hashed password before returning it to the requester
                        delete data.hashedPassword;
                        callback(200, data);
                    } else {
                        callback(404);
                    }        
                });
            } else {
                callback(403, {'Error' : 'Missing required token in header, or token is invalid.'})
            }
        });
    } else {
        callback(400, {'Error': 'Missing required field.'});
    }
};

// Users - put
// Required data: phone 
// Optional data: firstName, lastName, password, email, address (at least one must be specified)
handlers._users.put = (data, callback)=> {
    const phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

    const firstName = typeof(data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    const lastName = typeof(data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    const password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    // Validate e-mail address with a regular expression: something@something.something is a valid e-mail
    const emailRegex = /\S+@\S+\.\S+/;
    const email = typeof(data.payload.email) === 'string' && emailRegex.test(email) ? data.payload.email.trim() : false;
    const address = typeof(data.payload.address) === 'string' && data.payload.address.trim().length > 0 ? data.payload.address.trim() : false;

    // Error if the phone is invalid
    if (phone) {
        if (firstName || lastName || password || email || address) {
            // Get the token from the headers
            const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
            // Verify that the given token is valid for the phone number
            handlers._tokens.verifyToken(token, phone, tokenIsValid => {
                if (tokenIsValid) {
                    // Lookup the user
                    _data.read('users', phone, (err, userData) => {
                        if (!err && userData) {
                            // Update the necessary fields
                            if (firstName) {
                                userData.firstName = firstName;
                            }

                            if (lastName) {
                                userData.lastName = lastName;
                            }

                            if (password) {
                                userData.hashedPassword = helpers.hash(password);
                            }

                            if (email) {
                                userData.email = email;
                            }

                            if (address) {
                                userData.address = address;
                            }

                            // Store the new updates
                            _data.update('users', phone, userData, err => {
                                if (!err) {
                                    callback(200);
                                } else {
                                    console.log(err);
                                    callback(500, {'Error' : 'Could not update the user.'})
                                }
                            });

                        } else {
                            callback(400, {'Error' : 'The specified user does not exist.'});
                        }
                    });
                } else {
                    callback(403, {'Error' : 'Missing required token in header, or token is invalid.'})
                }
            });           
        } else {
            callback(400, {'Error': 'Missing fields to update'});
        }
    } else {
        callback(400, {'Error': 'Missing required field'});
    }
};

// Users -delete
// Required data: phone
handlers._users.delete = (data, callback)=> {
    // Check that the phone number is valid
    const phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;

    if (phone) {
        // Get the token from the headers
        const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
        // Verify that the given token is valid for the phone number
        handlers._tokens.verifyToken(token, phone, tokenIsValid => {
            if (tokenIsValid) {
                // Lookup the user
                _data.read('users', phone, (err, userData) => {
                    if (!err && userData) {
                        _data.delete('users', phone, err => {
                            if (!err) {
                                // Delete each of the checks associated with the user
                                const userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                                const checksToDelete = userChecks.length;
                                if (checksToDelete > 0) {
                                    const checksDeleted = 0;
                                    const deletionErrors = false;
                                    userChecks.forEach(checkId => {
                                        // Delete the check
                                        _data.delete('checks', checkId, err => {
                                            if (err) {
                                                deletionErrors = true;
                                            }
                                            checksDeleted++;

                                            if (checksDeleted == checksToDelete) {
                                                if (!deletionErrors) {
                                                    callback(200);
                                                } else {
                                                    callback(500, {'Error': 'Errors encountered while attempting to delete all of the user\'s checks. All checks may not have been deleted from the system successfully.'});
                                                }
                                            }
                                        });
                                    });
                                } else {
                                    callback(200);
                                }
                            } else {
                                callback(500, {'Error':'Could not delete the specified user.'});
                            }
                        });
                    } else {
                        callback(400, {'Error' : 'The specified user does not exist.'});
                    }
                });
            } else {
                callback(403, {'Error' : 'Missing required token in header, or token is invalid.'})
            }
        });    
    } else {
        callback(400, {'Error' : 'Missing required field.'});
    }
};

// Tokens
handlers.tokens = (data, callback) =>{
    var acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback);
    } else {
        callback(405);
    }
}

// Container for all the tokens methods
handlers._tokens = {}


// Tokens - post
// Required data: phone, password
// Optional data: nome
handlers._tokens.post = (data, callback) =>{
    const  phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    const password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    if (phone && password) {
        // Lookup the user that matches that phone number
        _data.read('users', phone, (err, userData) => {
            if (!err && userData) {
                // Hash the sent password and compare it to the password stored in the user object
                const hashedPassword = helpers.hash(password);
                if (hashedPassword == userData.hashedPassword) {
                    // If valid create a new token with a random name. Set expiration date 1 hour into the future
                    const tokenId = helpers.createRandomString(20);
                    const expires = Date.now() + 1000 * 60 * 60;
                    const tokenObject = {
                        'phone' : phone,
                        'id': tokenId,
                        'expires': expires
                    };

                    // Store the token
                    _data.create('tokens', tokenId, tokenObject, err => {
                        if (!err) {
                            callback(200, tokenObject);
                        } else {
                            callback(500, {'Error': 'Could not create the new token.'})
                        }
                    });
                } else {
                    callback(400, {'Error': 'Password did not match specified user\'s stored password'});
                }
            } else {
                callback(400, {'Error': 'Could not find the specified user.'})
            }
        });
    } else {
        callback(400, {'Error': 'Missing required field(s).'})
    }
};

// Tokens - get
// Required data: id
// Optional data: none
handlers._tokens.get = (data, callback)=> {
    // Check that the phone number is valid
    const id = typeof(data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length === 20 ? data.queryStringObject.id.trim() : false;
    if (id) {
        // Lookup the user
        _data.read('tokens', id, (err, tokenData) =>{
            if(!err && tokenData) {
                callback(200, tokenData);
            } else {
                callback(404);
            }        
        });
    } else {
        callback(400, {'Error': 'Missing required field.'});
    }    
};

// Tokens - put
// Required data: id, extend
// Optional data: none
handlers._tokens.put = (data, callback)=> {
    const id = typeof(data.payload.id) === 'string' && data.payload.id.trim().length === 20 ? data.payload.id.trim() : false;
    const extend = typeof(data.payload.extend) === 'boolean' && data.payload.extend === true ? true : false;
    
    if (id && extend) {
        // Lookup the token
        _data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                // Check to make sure the token isn't already expired
                if (tokenData.expires > Date.now()) {
                    // Set the expiration date an hour from now
                    tokenData.expires = Date.now() + 1000 * 60 * 60;

                    // Store the new updates
                    _data.update('tokens', id, tokenData, err => {
                        if (!err) {
                            callback(200);
                        } else {
                            callback(500, {'Error' : 'Could not update the token\'s expiration'});
                        }
                    });
                } else {
                    callback(400, {'Error': 'The token is already expired, and cannot be extended.'});
                }
            } else {
                callback(400, {'Error' : 'Specified token does not exist.'});
            }
        });
    } else {
        callback(400, {'Error' : 'Missing required field(s) or fields are invalid.'});
    }
};

// Tokens - delete
handlers._tokens.delete = (data, callback)=> {
    // Check that the id is valid
    const id = typeof(data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;

    if (id) {
        // Lookup the user
        _data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                _data.delete('tokens', id, err => {
                    if (!err) {
                        callback(200);
                    } else {
                        callback(500, {'Error':'Could not delete the specified token.'});
                    }
                });
            } else {
                callback(400, {'Error' : 'The specified token does not exist.'});
            }
        });
    } else {
        callback(400, {'Error' : 'Missing required field.'});
    }    
};

// Verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = (id, phone, callback)=> {
    // Lookup the token
    _data.read('tokens', id, (err, tokenData) => {
        if (!err && tokenData) {
            // Check that the token is for a given user and has not expired
            if (tokenData.phone == phone && tokenData.expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
}


// Ping handler
handlers.ping = (data, callback)=> {
    callback(200);
};

// Menu Items
handlers.menuItems = (data, callback) => {
    var acceptableMethods = ['get'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._menuItems[data.method](data, callback);
    } else {
        callback(405);
    }
}

// Container for all the menu items methods
handlers._menuItems = {};

// Checks - get
// When a user is logged in, they should be able to GET all the possible menu items 
// (these items can be hardcoded into the system). 
// Required data : phone
// Optional data : none
handlers._menuItems.get = (data, callback) => {
    
    // Check that the phone number is valid
    let phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length === 10 ? data.queryStringObject.phone.trim() : false;
    if (phone) {
        // Get the token from the headers
        let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
        // Verify that the given token is valid
        handlers._tokens.verifyToken(token, phone, tokenIsValid => {
            if (tokenIsValid) {
                // Return the menu items data
                callback(200, menuItemsData);
            } else {
                callback(403)
            }
        });
    } else {
        callback(400, {'Error': 'Missing required field.'});
    }
};

// Cart Items
handlers.cartItems = (data, callback) => {
    var acceptableMethods = ['post', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._cartItems[data.method](data, callback);
    } else {
        callback(405);
    }
}

// Container for all the cart items methods
handlers._cartItems = {};

// Cart items - post
// Required data: menuitem id, quantity
// Optional data: none
handlers._cartItems.post = (data, callback) =>  {
    // validate inputs
    let menuItemId = typeof(data.payload.menuItemId) === 'number' && data.payload.menuItemId % 1 == 0 ? data.payload.menuItemId : false;
    let quantity = typeof(data.payload.quantity) === 'number' && data.payload.quantity % 1 == 0 && data.payload.quantity > 0 ? data.payload.quantity : false;

    if (menuItemId && quantity) {
        // Get the token from the headers
        let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

        // Lookup the user by reading the token
        _data.read('tokens', token, (err, tokenData)=> {
            if (!err && tokenData) {
                let userPhone = tokenData.phone;

                // Lookup the user data
                _data.read('users', userPhone, (err, userData) => {
                    if (!err && userData) {
                        let cartItems = typeof(userData.cartItems) == 'object' && userData.cartItems instanceof Array ? userData.cartItems : [];
                        
                        newCartItem = {
                            "menuItemId": menuItemId,
                            "quantity": quantity 
                        };

                        // Add the item to user's cart
                        userData.cartItems = cartItems;
                        userData.cartItems.push(newCartItem);

                        // Save the new user data
                        _data.update('users', userPhone, userData, err => {
                            if (!err) {
                                // Return the data about the new check
                                callback(200);
                            } else {
                                callback(500, {'Error': 'Could not update the user with the new cart item.'});
                            }
                        });
                        
                    } else {
                        callback(403);
                    }
                });
            } else {
                callback(403);
            }
        });
    } else {
        callback(400, {'Error' : 'Missing required inputs, or inputs are invalid.'});
    }
};

// Tokens - delete
handlers._cartItems.delete = (data, callback) =>  {
    let menuItemId = parseInt(data.queryStringObject.menuItemId);
    // Check that the id is valid
    menuItemId = data.queryStringObject.menuItemId > 0 ? data.queryStringObject.menuItemId : false;

    if (menuItemId) {
        // Lookup the user
        // Get the token from the headers
        let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

        // Lookup the user by reading the token
        _data.read('tokens', token, (err, tokenData) => {
            if (!err && tokenData) {
                let userPhone = tokenData.phone;

                // Lookup the user data
                _data.read('users', userPhone, (err, userData) => {
                    if (!err && userData) {
                        let cartItems = typeof(userData.cartItems) == 'object' && userData.cartItems instanceof Array ? userData.cartItems : [];
                        if (cartItems.length > 0) {

                            // Filter out this menu item from user's cart
                            updatedCartItems = cartItems.filter(item => item.menuItemId != menuItemId);
                            userData.cartItems = updatedCartItems;
                            
                            // Save the new user data
                            _data.update('users', userPhone, userData, err => {
                                if (!err) {
                                    // Return the data about the new check
                                    callback(200);
                                } else {
                                    callback(500, {'Error': 'Could not update the user with the new cart item.'});
                                }
                            });
                        } else {
                            callback(400, {'Error' : 'Could not delete item because cart is already empty.'})
                        }
                    } else {
                        callback(403);
                    }
                });
            } else {
                callback(403);
            }
        });
    } else {
        callback(400, {'Error' : 'Missing required field.'});
    }    
};

// Orders
handlers.orders = (data, callback) => {
    var acceptableMethods = ['post'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._orders[data.method](data, callback);
    } else {
        callback(405);
    }
}

// Container for all the order methods
handlers._orders = {};

// Orders - post
// Required data: none
// Optional data: none
handlers._orders.post = (data, callback) =>  {

    // Get the token from the headers
    let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

    // Lookup the user by reading the token
    _data.read('tokens', token, (err, tokenData) => {
        if (!err && tokenData) {
            let userPhone = tokenData.phone;

            // Lookup the user data
            _data.read('users', userPhone, (err, userData) =>  {
                if (!err && userData) {
                    let cartItems = typeof(userData.cartItems) == 'object' && userData.cartItems instanceof Array ? userData.cartItems : [];

                    if (cartItems.length > 0) {
                        // Get item prices
                        let totalAmount = 0;
                        cartItems.forEach((cartItem)=>{
                            // Get the price for this item
                            menuItemsData.forEach(menuItemData => {
                                if(cartItem.menuItemId == menuItemData.id) {
                                    // Calculates the total of this item based on the quantity
                                    totalAmount += menuItemData.price * cartItem.quantity;
                                }
                            });
                        });

                        helpers.stripeCharge(totalAmount, err => {
                            if (!err) {
                                // Clean user's cart
                                userData.cartItems = [];
                                // Save the new user data
                                _data.update('users', userPhone, userData, err => {
                                    if (!err) {
                                        // Send e-mail with a receipt
                                        let toEmail = userData.email;
                                        let toName = userData.firstName + " " +userData.lastName; 
                                        let subject = "Your Pizza Receipt"; 
                                        let message = "Thank you "+toName+", you successfully purchased $"+totalAmount.toFixed(2)+" in Pizza.";

                                        helpers.mailgunSendEmail(toEmail, toName, subject, message, err => {
                                            if (!err) {
                                                callback(200);
                                            } else {
                                                callback(500, {'Error' : 'Unable to send receipt via e-mail'});        
                                            }
                                        });
                                    } else {
                                        callback(500, {'Error': 'Could not cleanup user\'s cart.'});
                                    }
                                });
                            } else {
                                callback(500, {'Error' : 'Unable to charge credit card in Stripe: '+ err});
                            }
                        });
                    } else {
                        callback(500, {'Error': 'Shopping cart is empty. To place an order there must be at least one item in the cart.'});
                    }
                } else {
                    callback(403);
                }
            });
        } else {
            callback(403);
        }
    });
    
};

// Not found handler
handlers.notFound = (data, callback) =>  {
    callback(404)
}

module.exports = handlers;