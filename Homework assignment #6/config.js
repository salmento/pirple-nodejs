/**
 * Create and export configuration variables
 *
 */

// Container for all environments
var environments = {};

// Staging (default) environments
environments.staging = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: "staging"
};

// Production environments
environments.production = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: "production"
};

// Determine which environments was passed as a command-line argument
const currentEnvironment =
  typeof process.env.NODE_ENV === "string"
    ? process.env.NODE_ENV.toLowerCase()
    : "";

// Check that the current environment is one of the environments above, if not, default to staging
const environmentToExport =
  typeof environments[currentEnvironment] === "object"
    ? environments[currentEnvironment]
    : environments.staging;

module.exports = environmentToExport;
