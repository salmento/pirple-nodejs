/*
 * Test runner
 *
 */

// Dependencies
var lib = require("../app/lib.js");
var assert = require("assert");

// Application logic for the test runner
_app = {};

// Holder of all tests
_app.tests = {
  unit: {}
};

// lib.addition test
_app.tests.unit["lib.addition should add only if params are number"] = done => {
  const val = lib.addition(3, 3);
  assert.ok(val);
  done();
};
_app.tests.unit[
  "lib.addition must return correct addition operation"
] = done => {
  const val = lib.addition(3, 3);
  assert.equal(val, 6);
  done();
};

// lib.validateEmail test
_app.tests.unit[
  "lib.validateEmail return true if param is valid email address"
] = done => {
  const val = lib.validateEmail("syahrul@test.com");
  assert.ok(val);
  done();
};

// Count all the tests
_app.countTests = () => {
  let counter = 0;
  for (var key in _app.tests) {
    if (_app.tests.hasOwnProperty(key)) {
      const subTests = _app.tests[key];
      for (const testName in subTests) {
        if (subTests.hasOwnProperty(testName)) {
          counter++;
        }
      }
    }
  }
  return counter;
};

// Run all the tests, collecting the errors and successes
_app.runTests = () => {
  let errors = [];
  let successes = 0;
  const limit = _app.countTests();
  let counter = 0;
  for (const key in _app.tests) {
    if (_app.tests.hasOwnProperty(key)) {
      const subTests = _app.tests[key];
      for (const testName in subTests) {
        if (subTests.hasOwnProperty(testName)) {
          (() => {
            const tmpTestName = testName;
            const testValue = subTests[testName];
            // Call the test
            try {
              testValue(() => {
                // If it calls back without throwing, then it succeeded, so log it in green
                console.log("\x1b[32m%s\x1b[0m", tmpTestName);
                counter++;
                successes++;
                if (counter == limit) {
                  _app.produceTestReport(limit, successes, errors);
                }
              });
            } catch (e) {
              // If it throws, then it failed, so capture the error thrown and log it in red
              errors.push({
                name: testName,
                error: e
              });
              console.log("\x1b[31m%s\x1b[0m", tmpTestName);
              counter++;
              if (counter == limit) {
                _app.produceTestReport(limit, successes, errors);
              }
            }
          })();
        }
      }
    }
  }
};

// Product a test outcome report
_app.produceTestReport = (limit, successes, errors) => {
  console.log("");
  console.log("--------BEGIN TEST REPORT--------");
  console.log("");
  console.log("Total Tests: ", limit);
  console.log("Pass: ", successes);
  console.log("Fail: ", errors.length);
  console.log("");

  // If there are errors, print them in detail
  if (errors.length > 0) {
    console.log("--------BEGIN ERROR DETAILS--------");
    console.log("");
    errors.forEach(testError => {
      console.log("\x1b[31m%s\x1b[0m", testError.name);
      console.log(testError.error);
      console.log("");
    });
    console.log("");
    console.log("--------END ERROR DETAILS--------");
  }

  console.log("");
  console.log("--------END TEST REPORT--------");
};

// Run the tests
_app.runTests();
