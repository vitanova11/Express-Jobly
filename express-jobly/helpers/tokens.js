const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** return signed JWT from user data. */

function createToken(user) {
  console.assert(user.isAdmin !== undefined,
      "createToken passed user without isAdmin property");

  let payload = {
    username: user.username,
    isAdmin: user.isAdmin || false,
  };

  return jwt.sign(payload, SECRET_KEY);
}

module.exports = { createToken };


//designed to facilitate updating database records with only a subset of fields. When you have an object with key-value pairs you want to update in a database, this function helps convert that object into a format suitable for an SQL UPDATE statement. It:

// Checks if the input object has data to update.
// Maps JavaScript object keys to corresponding SQL column names.
// Creates a string for the SQL SET clause and an array of values to be updated.
// This is useful when you don't need to update every field of a record, just a few selected ones. For instance, if you have a user record and only want to update their email and age, this function helps create the SQL command for such an update efficiently.