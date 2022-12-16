/*
PLAYLIST SCHEMA

_id: ObjectId
UserID: ObjectId
Songs: Array[ObjectId]
PlaylistName: String
*/

const mongoCollections = require("../config/mongoCollections");
const playlists = mongoCollections.playlists;
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

  const newId = insertInfo.insertedId;

  const playlist = await this.getPlaylistById(newId);
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

async function getPlaylistByUserId(userId) {
  if (!userId) throw new UserError("You must provide a user id to search for");

  const playlistCollection = await playlists();
  const playlist = await playlistCollection
    .find({
      UserID: new ObjectId(userId),
    })
    .toArray();
  if (playlist === null) throw new UserError("User has no playlists");

  return playlist;
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

  const playlistCollection = await playlists();
  const deletionInfo = await playlistCollection.removeOne({
    _id: new ObjectId(id),
  });
  if (deletionInfo.deletedCount === 0) {
    throw new Error(`Could not delete playlist with id of ${id}`);
  }
}

async function addSongToPlaylist(playlistId, songId) {
  if (!playlistId) throw new UserError("You must provide a playlist id");
  if (!songId) throw new UserError("You must provide a song id");

  const playlistCollection = await playlists();

  const playlist = await this.getPlaylistById(playlistId);
  let songs = playlist.Songs;
  songs.push(songId);

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

  const playlist = await this.getPlaylistById(playlistId);
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
  getPlaylistByUserId,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
};
