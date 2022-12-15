const mongodb = require('mongodb');
const albumsDatabase = require('../config/mongoCollections').albums;
const usersDatabase = require('../config/mongoCollections').users;
const {
    ObjectId
} = require('mongodb');
const mongoCollections = require('../config/mongoCollections');

//SCHEMA FOR ALBUMS
/* 
    _id: ObjectId
    title: String
    artist: String
    albumLength: String
    reviews: subdocument
    genre: String ! maybe should be an array
    releaseYear: String
    songs: array[ObjectId]
*/

let exportedMethods = {

    async createAlbum(title, artist, albumLength, releaseYear, genre, songs) {
        if (!title || typeof title !== 'string') throw 'You must provide a title for your album';
        if (!artist || typeof artist !== 'string') throw 'You must provide an artist for your album';
        if (!albumLength || typeof albumLength !== 'string') throw 'You must provide an album length for your album';
        if (!releaseYear || typeof releaseYear !== 'number') throw 'You must provide a release year for your album';
        if (!genre || typeof genre !== 'string') throw 'You must provide a genre for your album';
        if (!songs || !Array.isArray(songs)) throw 'You must provide an array of songs for your album';

        const reviews = [];
        const albumCollection = await albumsDatabase();

        const newAlbum = {
            title: title,
            artist: artist,
            albumLength: albumLength,
            releaseYear: releaseYear,
            genre: genre,
            songs: songs,
            reviews: reviews
        };

        const insertInfo = await albumCollection.insertOne(newAlbum);
        if (insertInfo.insertedCount === 0) throw 'Could not add album';

        const newId = insertInfo.insertedId;
        const album = await this.getAlbumById(newId);
        return album;
    },

    async getAllAlbums() {
        const albumCollection = await albumsDatabase();

        const albums = await albumCollection.find({}).toArray();

        return albums;
    },

    async getAlbumById(id) {
        if (!id) throw 'You must provide an id to search for';

        const albumCollection = await albumsDatabase();
        const parsedId = ObjectId(id);
        const album = await albumCollection.findOne({
            _id: parsedId
        });
        if (album === null) throw 'No album with that id';

        return album;
    },

    async getAlbumsByArtist(artist) {
        if (!artist || typeof artist !== 'string') throw 'You must provide an artist to search for';

        const albumCollection = await albumsDatabase();
        const albums = await albumCollection.find({
            artist: artist
        }).toArray();

        return albums;
    },

    async getAlbumsByGenre(genre) {
        if (!genre || typeof genre !== 'string') throw 'You must provide a genre to search for';

        const albumCollection = await albumsDatabase();
        const albums = await albumCollection.find({
            genre: genre
        }).toArray();

        return albums;
    },

    async getAlbumsByTitle(title) {
        if (!title || typeof title !== 'string') throw 'You must provide a title to search for';

        const albumCollection = await albumsDatabase();
        const albums = await albumCollection.find({
            title: title
        }).toArray();

        return albums;
    },

    async addReviewToAlbum(albumId, userId, review) {
        if (!albumId) throw 'You must provide an album id';
        if (!userId) throw 'You must provide a user id';
        if (!review || typeof review !== 'string') throw 'You must provide a review';

        const albumCollection = await albumsDatabase();
        const userCollection = await usersDatabase();
        const parsedAlbumId = ObjectId(albumId);
        const parsedUserId = ObjectId(userId);

        const album = await albumCollection.findOne({
            _id: parsedAlbumId
        });
        if (album === null) throw 'No album with that id';

        const user = await userCollection.findOne({
            _id: parsedUserId
        });
        if (user === null) throw 'No user with that id';

        const newReview = {
            userId: userId,
            review: review
        };

        const updatedInfo = await albumCollection.updateOne({
            _id: parsedAlbumId
        }, {
            $push: {
                reviews: newReview
            }
        });
        if (updatedInfo.modifiedCount === 0) throw 'Could not add review to album';

        const updatedAlbum = await this.getAlbumById(albumId);
        return updatedAlbum;
    },

    async updateAlbum(id, updatedAlbum) {
        if (!id) throw 'You must provide an id to search for';
        if (!updatedAlbum) throw 'You must provide an album to update';

        const albumCollection = await albumsDatabase();
        const parsedId = ObjectId(id);

        const updatedAlbumData = {};

        if (updatedAlbum.title) {
            updatedAlbumData.title = updatedAlbum.title;
        }

        if (updatedAlbum.artist) {
            updatedAlbumData.artist = updatedAlbum.artist;
        }

        if (updatedAlbum.albumLength) {
            updatedAlbumData.albumLength = updatedAlbum.albumLength;
        }

        if (updatedAlbum.releaseYear) {
            updatedAlbumData.releaseYear = updatedAlbum.releaseYear;
        }

        if (updatedAlbum.genre) {
            updatedAlbumData.genre = updatedAlbum.genre;
        }

        if (updatedAlbum.songs) {
            updatedAlbumData.songs = updatedAlbum.songs;
        }

        let updateCommand = {
            $set: updatedAlbumData
        };
        const query = {
            _id: parsedId
        };
        await albumCollection.updateOne(query, updateCommand);

        return await this.getAlbumById(id);
    },

    async searchAlbums(searchTerm) {
        if (!searchTerm || typeof searchTerm !== 'string') throw 'You must provide a search term';

        const als = await this.getAllAlbums();
        const searchedAlbums = als.filter(album => {
            return album.title.includes(searchTerm)
        });

        return searchedAlbums;
    }
};

module.exports = exportedMethods;