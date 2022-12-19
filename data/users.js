const {
  validateUsername,
  validatePassword,
  doesUserExist,
  UserError,
} = require("../helpers/userHelper");

const bcrypt = require("bcrypt");

const { users } = require("../config/mongoCollections");
const { ObjectId } = require("mongodb");

const songs = require("./songs");
const albums = require("./albums");
const USER_FAIL_MSG = "Either the username or password is invalid";

const SALT_ROUNDS = 16;

const getAllUsers = async () => {
  const userCollection = await users();

  const userList = await userCollection.find({}).toArray();

  return userList;
};

const createUser = async (username, password, isAdmin = false) => {
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
    // favoriteSongs: [], // favoriteSongs deprecated, added to a playlist called "favorites" instead
    // favoriteAlbums: [],
    playlists: [], // array of playlist ids. "favorites" playlist gets added in playlist.getPlaylistsByUserId
    // reviews: [], // deprecated, split reviews into songReviews and albumReviews
    songReviews: [],
    albumReviews: [],
    friends: [],
    adminFlag: isAdmin ? isAdmin : false,
  };

  // insert into db
  const userCollection = await users();

  const insertInfo = await userCollection.insertOne(newUser);

  if (!insertInfo?.acknowledged) throw new Error("Could not add user");

  const newId = insertInfo.insertedId;

  newUser._user = newId;
  newUser._id = newId;
  return newUser;
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

  return {
    authenticatedUser: true,
  };
};

const makeAdmin = async (username) => {
  if (!username || typeof username !== "string")
    throw new UserError("Username must be provided");
  username = username?.toLowerCase();
  const userCollection = await users();

  const updatedInfo = await userCollection.updateOne(
    {
      username: username,
    },
    {
      $set: {
        adminFlag: true,
      },
    }
  );

  if (!updatedInfo?.acknowledged) throw new Error("Could not make user admin");

  return {
    adminFlag: true,
  };
};

const checkAdmin = async (username) => {
  if (!username || typeof username !== "string")
    throw new UserError("Username must be provided");
  username = username?.toLowerCase();
  const userCollection = await users();

  const user = await userCollection.findOne({
    username: username,
  });

  if (!user) throw new UserError("There is no user with that username");

  return user.adminFlag;
};

const addFriend = async (username, friendUsername) => {
  if (!username || typeof username !== "string")
    throw new UserError("Username must be provided");
  username = username?.toLowerCase();
  const userCollection = await users();

  const user = await userCollection.findOne({
    username: username,
  });

  if (!user) throw new UserError("There is no user with that username");

  if (!friendUsername || typeof friendUsername !== "string")
    throw new UserError("Friend username must be provided");

  const friend = await getUserByUsername(friendUsername);
  if (!friend) throw new UserError("There is no user with that username");

  const updatedUser = await userCollection.updateOne(
    {
      username: username,
    },
    {
      $push: {
        friends: friendUsername,
      },
    }
  );
};

const removeFriend = async (username, friendUsername) => {
  if (!username || typeof username !== "string")
    throw new UserError("Username must be provided");
  if (!friendUsername || typeof friendUsername !== "string")
    throw new UserError("Friend username must be provided");

  const friend = await getUserByUsername(friendUsername);
  if (!friend) throw new UserError("There is no user with that username");

  username = username?.toLowerCase();
  try {
    const userCollection = await users();
    const user = userCollection.findOne({
      username: username,
    });
    if (!user) throw new UserError("There is no user with that username");
    const updatedUser = await userCollection.updateOne(
      {
        username: username,
      },
      {
        $pull: {
          friends: friendUsername,
        },
      }
    );

    if (!updatedUser) throw new UserError("Could not update user");
    return {
      updatedUser: true,
    };
  } catch (e) {
    throw new UserError("There is no user with that username");
  }
};

const getUserByUsername = async (username) => {
  if (!username || typeof username !== "string")
    throw "You must provide a username to search for";

  // can use findOne since username should be a unique identifier
  const userCollection = await users();
  const user = await userCollection.findOne({
    username: username,
  });

  return user;
};

const getUserByID = async (id) => {
  if (!id || typeof id !== "string")
    throw "You must provide an id to search for";

  // can use findOne since username should be a unique identifier
  const userCollection = await users();
  const user = await userCollection.findOne({
    _id: new ObjectId(id),
  });

  // don't pass on
  if (user?.password) delete user.password;

  return user;
};

const getUserFriends = async (username) => {
  if (!username || typeof username !== "string")
    throw new UserError("Username must be provided");

  username = username?.toLowerCase();
  try {
    validateUsername(username);
    const userCollection = await users();
    const user = await userCollection.findOne({
      username: username,
    });
    if (!user) throw new UserError("There is no user with that username");
    const friends = user.friends;
    return friends;
  } catch (e) {
    throw new UserError("There is no user with that username");
  }
};

module.exports = {
  createUser,
  checkUser,
  getUserByUsername,
  makeAdmin,
  checkAdmin,
  addFriend,
  removeFriend,
  getUserFriends,
  getUserByID,
  getAllUsers,
};
