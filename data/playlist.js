/*
PLAYLIST SCHEMA

_id: ObjectId
UserID: ObjectId
Songs: Array[ObjectId]
PlaylistName: String
*/

const mongoCollections = require("../config/mongoCollections");
const playlists = mongoCollections.playlists;
const users = mongoCollections.users;
const { ObjectId } = require("mongodb");
const { UserError } = require("../helpers/userHelper");

async function createPlaylist(playlistName, songs, userId) {
  if (!playlistName) throw new UserError("You must provide a playlist name");
  if (!songs) throw new UserError("You must provide an array of songs");
  if (!userId) throw new UserError("You must provide a user id");

  const playlistCollection = await playlists();

  let newPlaylist = {
    PlaylistName: playlistName,
    Songs: songs,
    UserID: new ObjectId(userId),
  };

  const insertInfo = await playlistCollection.insertOne(newPlaylist);
  if (insertInfo.insertedCount === 0)
    throw new UserError("Could not add playlist");

  // Also add playlist id to user's playlists
  const usersCollection = await users();
  const user = await usersCollection.findOne({
    _id: new ObjectId(userId),
  });
  if (user === null) throw new UserError("No user with that id");
  const updatedPlaylists = user.playlists;
  updatedPlaylists.push(insertInfo.insertedId);
  const updatedUser = await usersCollection.updateOne(
    { _id: new ObjectId(userId) },
    { $set: { playlists: updatedPlaylists } }
  );
  if (updatedUser.modifiedCount === 0)
    throw new UserError("Could not add playlist to user");

  const newId = insertInfo.insertedId;

  const playlist = await getPlaylistById(newId);
  return playlist;
}

async function getAllPlaylists() {
  const playlistCollection = await playlists();

  const playlistList = await playlistCollection.find({}).toArray();

  return playlistList;
}

async function getPlaylistById(id) {
  if (!id) throw new UserError("You must provide an id to search for");

  const playlistCollection = await playlists();
  const playlist = await playlistCollection.findOne({
    _id: new ObjectId(id),
  });
  if (playlist === null) throw new UserError("No playlist with that id");

  return playlist;
}

async function getPlaylistsByUserId(userId) {
  if (!userId) throw new UserError("You must provide a user id to search for");

  const playlistCollection = await playlists();
  const ret = await playlistCollection
    .find({
      UserID: new ObjectId(userId),
    })
    .toArray();
  // Create a Favorites playlist
  if (ret === null || (ret && ret.length < 1)) {
    const favoritePlaylist = await createPlaylist("Favorites", [], userId);
    ret.push(favoritePlaylist);
    const favoritePlaylistId = favoritePlaylist._id;
    // Push the Favorites playlist to the user's playlists
    const usersCollection = await users();
    const user = await usersCollection.findOne({
      _id: new ObjectId(userId),
    });
    if (user === null) throw new UserError("No user with that id");
    const updatedPlaylists = user.playlists;
    updatedPlaylists.push(favoritePlaylistId);
    const updatedUser = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { playlists: updatedPlaylists } }
    );
  }  

  return ret;
}

async function updatePlaylist(id, updatedPlaylist) {
  const playlistCollection = await playlists();

  const updatedPlaylistData = {};

  if (updatedPlaylist.PlaylistName) {
    updatedPlaylistData.PlaylistName = updatedPlaylist.PlaylistName;
  }

  if (updatedPlaylist.Songs) {
    updatedPlaylistData.Songs = updatedPlaylist.Songs;
  }

  let updateCommand = {
    $set: updatedPlaylistData,
  };
  const query = {
    _id: new ObjectId(id),
  };
  await playlistCollection.updateOne(query, updateCommand);
}

async function deletePlaylist(id) {
  if (!id) throw new UserError("You must provide an id to search for");
  const playlist = await getPlaylistById(id);
  
  const playlistCollection = await playlists();
  const deletionInfo = await playlistCollection.deleteOne({
    _id: new ObjectId(id),
  });
  if (deletionInfo.deletedCount === 0) {
    throw new Error(`Could not delete playlist with id of ${id}`);
  }
  // Also remove playlist id from user's playlists

  const userId = playlist.UserID;
  const usersCollection = await users();
  const user = await usersCollection.findOne({
    _id: new ObjectId(userId),
  });
  if (user === null) throw new UserError("No user with that id");
  const currentPlaylists = user.playlists;
  const updatedPlaylists = currentPlaylists.filter((playlistId) => playlistId.toString() !== id);
  const updatedUser = await usersCollection.updateOne(
    { _id: userId },
    { $set: { playlists: updatedPlaylists } }
  );
}

async function addSongToPlaylist(playlistId, songId) {
  if (!playlistId) throw new UserError("You must provide a playlist id");
  if (!songId) throw new UserError("You must provide a song id");

  const playlistCollection = await playlists();

  const playlist = await getPlaylistById(playlistId);
  let songs = playlist.Songs;
  songs.push(new ObjectId(songId));

  let updateCommand = {
    $set: {
      Songs: songs,
    },
  };
  const query = {
    _id: new ObjectId(playlistId),
  };
  await playlistCollection.updateOne(query, updateCommand);
}

async function removeSongFromPlaylist(playlistId, songId) {
  if (!playlistId) throw new UserError("You must provide a playlist id");
  if (!songId) throw new UserError("You must provide a song id");

  const playlistCollection = await playlists();

  const playlist = await getPlaylistById(playlistId);
  let songs = playlist.Songs;
  let index = songs.indexOf(songId);
  if (index > -1) {
    songs.splice(index, 1);
  }

  let updateCommand = {
    $set: {
      Songs: songs,
    },
  };
  const query = {
    _id: new ObjectId(playlistId),
  };
  await playlistCollection.updateOne(query, updateCommand);
}

module.exports = {
  createPlaylist,
  getAllPlaylists,
  getPlaylistById,
  getPlaylistsByUserId,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
};
