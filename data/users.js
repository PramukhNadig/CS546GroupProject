const {
  validateUsername,
  validatePassword,
  doesUserExist,
  UserError,
} = require("../helpers/userHelper");

const bcrypt = require("bcrypt");

const { users } = require("../config/mongoCollections");

const USER_FAIL_MSG = "Either the username or password is invalid";

const SALT_ROUNDS = 16;

const createUser = async (username, password) => {
  if (!username || typeof username !== "string")
    throw new UserError("Username must be provided");
  if (!password || typeof password !== "string")
    throw new UserError("Password must be provided and must be a string");
  username = username?.toLowerCase();

  // validate username
  validateUsername(username);

  // user does exist fail
  if (await doesUserExist(username))
    throw new UserError("There is already a user with that username");

  // validate password
  validatePassword(password);

  // hash password with bcrypt
  const hash = await bcrypt.hash(password, SALT_ROUNDS);

  const newUser = {
    username,
    password: hash,
  };

  // insert into db
  const userCollection = await users();

  const insertInfo = await userCollection.insertOne(newUser);

  if (!insertInfo?.acknowledged) throw new Error("Could not add user");

  return { userInserted: true };
};

const checkUser = async (username, password) => {
  if (!username || typeof username !== "string")
    throw new UserError("Username must be provided");
  if (!password || typeof password !== "string")
    throw new UserError("Password must be provided and must be a string");
  username = username?.toLowerCase();

  // validate username
  validateUsername(username);

  const userCollection = await users();

  const user = await userCollection.findOne({
    username: username,
  });

  if (!user) throw new UserError(USER_FAIL_MSG, 401);

  const match = await bcrypt.compare(password, user.password);

  if (!match) throw new UserError(USER_FAIL_MSG, 401);

  return { authenticatedUser: true };
};

const getUserByUsername = async (username) => {
  if (!username || typeof username !== 'string') throw 'You must provide a username to search for';

  // can use findOne since username should be a unique identifier
  const userCollection = await users();
  const user = await userCollection.findOne({
    username: username
  });

  return user;
}

module.exports = {
  createUser,
  checkUser,
  getUserByUsername,
};
