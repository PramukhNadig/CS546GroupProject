const { users } = require("../config/mongoCollections");

class UserError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "UserError";
    this._status = status;
  }
}

/**
 *
 * @param {string} password
 * @returns {true|false} throws error if invalid
 */
const validatePassword = (password) => {
  // it should be a valid string
  if (!password || typeof password !== "string") {
    throw new UserError("Password must be a valid string");
  }

  // no empty spaces
  if (password.length === 0) {
    throw new UserError("Password must not be empty");
  }

  // no spaces in the password
  if (password.includes(" ")) {
    throw new UserError("Password must not contain spaces");
  }

  // should be at least 6 characters long
  if (password.length < 6) {
    throw new UserError("Password must be at least 6 characters long");
  }

  // at least one uppercase character
  if (!/[A-Z]/.test(password)) {
    throw new UserError(
      "Password must contain at least one uppercase character"
    );
  }

  // at least one number
  if (!/[0-9]/.test(password)) {
    throw new UserError("Password must contain at least one number");
  }

  // at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    throw new UserError("Password must contain at least one special character");
  }

  return true;
};

/**
 * Lowercase username before usage
 * @param {string} username
 * @returns {true|false} throws error if invalid
 */
const validateUsername = (username) => {
  // it should be a valid string
  if (!username || typeof username !== "string") {
    throw new UserError("Username must be a string");
  }

  username = username.toLowerCase();

  // no empty spaces
  if (username.length === 0) {
    throw new UserError("Username must not be empty");
  }

  // no spaces in the username
  if (username.includes(" ")) {
    throw new UserError("Username must not contain spaces");
  }

  // only alphanumeric characters
  if (!/^[a-zA-Z0-9]+$/.test(username)) {
    throw new UserError("Username must be alphanumeric");
  }

  // should be at least 4 characters long
  if (username.length < 4) {
    throw new UserError("Username must be at least 4 characters long");
  }
  return true;
};

/**
 *
 * @param {string} username must be validated already
 */
const doesUserExist = async (username) => {
  const userCollection = await users();
  const user = await userCollection.findOne({
    username: username,
  });

  return !!user;
};

module.exports = {
  UserError,
  validatePassword,
  validateUsername,
  doesUserExist,
};
