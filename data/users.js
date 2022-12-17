const {
  validateUsername,
  validatePassword,
  doesUserExist,
  UserError,
} = require("../helpers/userHelper");

const bcrypt = require("bcrypt");

const {
  users
} = require("../config/mongoCollections");

const songs = require("./songs");
const albums = require("./albums");
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
    favoriteSongs: [],
    favoriteAlbums: [],
    reviews: [],
    friends: [],
    adminFlag: false
  };

  // insert into db
  const userCollection = await users();

  const insertInfo = await userCollection.insertOne(newUser);

  if (!insertInfo?.acknowledged) throw new Error("Could not add user");

  return {
    userInserted: true
  };
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
    authenticatedUser: true
  };
};

const makeAdmin = async (username) => {
  if (!username || typeof username !== "string")
    throw new UserError("Username must be provided");
  username = username?.toLowerCase();
  const userCollection = await users();

  const updatedInfo = await userCollection.updateOne({
    username: username
  }, {
    $set: {
      adminFlag: true
    }
  });

  if (!updatedInfo?.acknowledged) throw new Error("Could not make user admin");

  return {
    adminFlag: true
  }
};

const checkAdmin = async (username) => {
  if (!username || typeof username !== "string")
    throw new UserError("Username must be provided");
  username = username?.toLowerCase();
  const userCollection = await users();

  const user = await userCollection.findOne({
    username: username
  });

  if (!user) throw new UserError("There is no user with that username");

  return {
    adminFlag: user.adminFlag
  }
};

const favoriteSong = async (username, songId) => {
  if (!username || typeof username !== "string")
    throw new UserError("Username must be provided");
  if (!songId || typeof songId !== "string")
    throw new UserError("Song ID must be provided");
  
  const song = await songs.getSongById(songId);
  if (!song) throw new UserError("There is no song with that ID");

  username = username?.toLowerCase();
  try {
    validateUsername(username);
    const userCollection = await users();
    const user = userCollection.findOne({
      username: username
    });
    if (!user) throw new UserError("There is no user with that username");
    const updatedUser = await users.updateOne({
      username: username,
    }, {
      $push: {
        favoriteSongs: songId,
      },
    });
    if (!updatedUser) throw new UserError("Could not update user");
    return {
      updatedUser: true
    };
  } catch (e) {
    throw new UserError("There is no user with that username");
  }
};

const favoriteAlbum = async (username, albumId) => {
  if (!username || typeof username !== "string")
    throw new UserError("Username must be provided");
  if (!albumId || typeof albumId !== "string")
    throw new UserError("Album ID must be provided");
  
  const album = await albums.getAlbumById(albumId);
  if (!album) throw new UserError("There is no album with that ID");
  
  username = username?.toLowerCase();
  try {
    validateUsername(username);
    const userCollection = await users();
    const user = userCollection.findOne({
      username: username
    });
    if (!user) throw new UserError("There is no user with that username");
    const updatedUser = await users.updateOne({
      username: username,
    }, {
      $push: {
        favoriteAlbums: albumId,
      },
    });
    if (!updatedUser) throw new UserError("Could not update user");
    return {
      updatedUser: true
    };
  } catch (e) {
    throw new UserError("There is no user with that username");
  }
};

const addFriend = async (username, friendUsername) => {
  if (!username || typeof username !== "string")
    throw new UserError("Username must be provided");
  if (!friendUsername || typeof friendUsername !== "string")
    throw new UserError("Friend username must be provided");
  
  const friend = await getUserByUsername(friendUsername);
  if (!friend) throw new UserError("There is no user with that username");

  username = username?.toLowerCase();
  friendUsername = friendUsername?.toLowerCase();
  try {
  const userCollection = await users();
    const user = userCollection.findOne({
      username: username
    });

    if (!user) throw new UserError("There is no user with that username");
    
    const updatedUser = await users.updateOne({
      username: username,
    }, {
      $push: {
        friends: friendUsername,
      },
    });
    if (!updatedUser) throw new UserError("Could not update user");
    return {
      updatedUser: true
    };
  } catch (e) {
    throw new UserError("There is no user with that username");
  }
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
      username: username
    });
    if (!user) throw new UserError("There is no user with that username");
    const updatedUser = await users.updateOne({
      username: username,
    }, {
      $pull: {
        friends: friendUsername,
      },
    });

    if (!updatedUser) throw new UserError("Could not update user");
    return {
      updatedUser: true
    };
  } catch (e) {
    throw new UserError("There is no user with that username");
  }
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

const removeFavoriteSong = async (username, songId) => {
  if (!username || typeof username !== "string")
    throw new UserError("Username must be provided");
  if (!songId || typeof songId !== "string")
    throw new UserError("Song ID must be provided");
  
  const song = await songs.getSongById(songId);
  if (!song) throw new UserError("There is no song with that ID");

  username = username?.toLowerCase();
  try {
    validateUsername(username);
  const userCollection = await users();
    const user = userCollection.findOne({
      username: username
    });

    if (!user) throw new UserError("There is no user with that username");
    const updatedUser = await users.updateOne({
      username: username,
    }, {
      $pull: {
        favoriteSongs: songId,
      },
    });
    if (!updatedUser) throw new UserError("Could not update user");
    return {
      updatedUser: true
    };
  } catch (e) {
    throw new UserError("There is no user with that username");
  }
};

const removeFavoriteAlbum = async (username, albumId) => {
  if (!username || typeof username !== "string")
    throw new UserError("Username must be provided");
  if (!albumId || typeof albumId !== "string")
    throw new UserError("Album ID must be provided");

  const album = await albums.getAlbumById(albumId);
  if (!album) throw new UserError("There is no album with that ID");

  username = username?.toLowerCase();
  try {
    validateUsername(username);
  const userCollection = await users();
    const user = userCollection.findOne({
      username: username
    });
    if (!user) throw new UserError("There is no user with that username");
    const updatedUser = await users.updateOne({
      username: username,
    }, {
      $pull: {
        favoriteAlbums: albumId,
      },
    });

    if (!updatedUser) throw new UserError("Could not update user");
    return {
      updatedUser: true
    };
  } catch (e) {
    throw new UserError("There is no user with that username");
  }
};

const getUserFriends = async (username) => {
  if (!username || typeof username !== "string")
    throw new UserError("Username must be provided");
  
  username = username?.toLowerCase();
  try {
    validateUsername(username);
  const userCollection = await users();
    const user = userCollection.findOne({
      username: username
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
  favoriteSong,
  favoriteAlbum,
  addFriend,
  removeFriend,
  removeFavoriteSong,
  removeFavoriteAlbum,
  getUserFriends
};

