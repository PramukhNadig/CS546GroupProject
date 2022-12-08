const mongodb = require('mongodb');
const songsDatabase = require('../config/mongoCollections').songs;
const usersDatabase = require('../config/mongoCollections').users;
const {
    ObjectId
} = require('mongodb');

const createSong = async (album, title, artist, songLength, releaseYear, genres, lyrics) => {
    if (!album || typeof album !== 'string') throw 'You must provide an album name for your song';
    if (!title || typeof title !== 'string') throw 'You must provide a title for your song';
    if (!artist || typeof artist !== 'string') throw 'You must provide an artist for your song';
    if (!songLength || typeof songLength !== 'string') throw 'You must provide a song length for your song';
    if (!releaseYear || typeof releaseYear !== 'number') throw 'You must provide a release year for your song';
    if (!genres || !Array.isArray(genres)) throw 'You must provide an array of genres for your song';
    if (!lyrics || typeof lyrics !== 'string') throw 'You must provide lyrics for your song';

    const reviews = [];
    const songCollection = await songsDatabase();

    const newSong = {
        album: album,
        title: title,
        artist: artist,
        songLength: songLength,
        releaseYear: releaseYear,
        genres: genres,
        lyrics: lyrics,
        reviews: reviews
    };

    const insertInfo = await songCollection.insertOne(newSong);
    if (insertInfo.insertedCount === 0) throw 'Could not add song';

    const newId = insertInfo.insertedId;
    const song = await getSongById(newId);
    return song;
};

const getAllSongs = async () => {
    const songCollection = await songsDatabase();

    const songs = await songCollection.find({}).toArray();

    return songs;
}

const getSongById = async (id) => {
    if (!id) throw 'You must provide an id to search for';

    const songCollection = await songsDatabase();
    const parsedId = ObjectId(id);
    const song = await songCollection.findOne({
        _id: parsedId
    });
    if (song === null) throw 'No song with that id';

    return song;
};

const getSongsByArtist = async (artist) => {
    if (!artist || typeof artist !== 'string') throw 'You must provide an artist to search for';

    const songCollection = await songsDatabase();
    const songs = await songCollection.find({
        artist: artist
    }).toArray();

    return songs;
};

const getSongsByGenre = async (genre) => {
    if (!genre || typeof genre !== 'string') throw 'You must provide a genre to search for';

    const songCollection = await songsDatabase();
    const songs = await songCollection.find({
        genres: genre
    }).toArray();

    return songs;
}

const getSongsByTitle = async (title) => {
    if (!title || typeof title !== 'string') throw 'You must provide a title to search for';

    const songCollection = await songsDatabase();
    const songs = await songCollection.find({
        title: title
    }).toArray();

    return songs;
}

const getSongsWithMinAvgReview = async (avgReview) => {
    if (!avgReview || typeof avgReview !== 'number') throw 'You must provide a number to search for';

    const songCollection = await songsDatabase();
    const songs = await songCollection.find({
        avgReview: {
            $gte: avgReview
        }
    }).toArray();

    return songs;
}

module.exports = {
    createSong,
    getAllSongs,
    getSongById,
    getSongsByArtist,
    getSongsByGenre,
    getSongsByTitle,
    getSongsWithMinAvgReview
};