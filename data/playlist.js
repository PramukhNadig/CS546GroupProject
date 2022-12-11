/*
PLAYLIST SCHEMA

_id: ObjectId
UserID: ObjectId
Songs: Array[ObjectId]
PlaylistName: String
*/

const mongoCollections = require("../config/mongoCollections");
const playlists = mongoCollections.playlists;
const {
    ObjectId
} = require('mongodb');

async function createPlaylist(playlistName, songs, userId) {
    if (!playlistName) throw "You must provide a playlist name";
    if (!songs) throw "You must provide an array of songs";
    if (!userId) throw "You must provide a user id";

    const playlistCollection = await playlists();

    let newPlaylist = {
        PlaylistName: playlistName,
        Songs: songs,
        UserID: ObjectId(userId)
    };

    const insertInfo = await playlistCollection.insertOne(newPlaylist);
    if (insertInfo.insertedCount === 0) throw "Could not add playlist";

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
    if (!id) throw "You must provide an id to search for";

    const playlistCollection = await playlists();
    const playlist = await playlistCollection.findOne({
        _id: ObjectId(id)
    });
    if (playlist === null) throw "No playlist with that id";

    return playlist;
}

async function getPlaylistByUserId(userId) {
    if (!userId) throw "You must provide a user id to search for";

    const playlistCollection = await playlists();
    const playlist = await playlistCollection.find({
        UserID: ObjectId(userId)
    }).toArray();
    if (playlist === null) throw "User has no playlists";

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
        $set: updatedPlaylistData
    };
    const query = {
        _id: ObjectId(id)
    };
    await playlistCollection.updateOne(query, updateCommand);
}

async function deletePlaylist(id) {
    if (!id) throw "You must provide an id to search for";

    const playlistCollection = await playlists();
    const deletionInfo = await playlistCollection.removeOne({
        _id: ObjectId(id)
    });
    if (deletionInfo.deletedCount === 0) {
        throw `Could not delete playlist with id of ${id}`;
    }
}

async function addSongToPlaylist(playlistId, songId) {
    if (!playlistId) throw "You must provide a playlist id";
    if (!songId) throw "You must provide a song id";

    const playlistCollection = await playlists();

    const playlist = await this.getPlaylistById(playlistId);
    let songs = playlist.Songs;
    songs.push(songId);

    let updateCommand = {
        $set: {
            Songs: songs
        }
    };
    const query = {
        _id: ObjectId(playlistId)
    };
    await playlistCollection.updateOne(query, updateCommand);
}

async function removeSongFromPlaylist(playlistId, songId) {
    if (!playlistId) throw "You must provide a playlist id";
    if (!songId) throw "You must provide a song id";

    const playlistCollection = await playlists();

    const playlist = await this.getPlaylistById(playlistId);
    let songs = playlist.Songs;
    let index = songs.indexOf(songId);
    if (index > -1) {
        songs.splice(index, 1);
    }

    let updateCommand = {
        $set: {
            Songs: songs
        }
    };
    const query = {
        _id: ObjectId(playlistId)
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
    removeSongFromPlaylist
};