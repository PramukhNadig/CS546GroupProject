const mongodb = require("mongodb");
const albumsDatabase = require("../config/mongoCollections").albums;
const usersDatabase = require("../config/mongoCollections").users;
const songsDatabase = require("../config/mongoCollections").songs;
const { ObjectId } = require("mongodb");
const mongoCollections = require("../config/mongoCollections");
const { UserError } = require("../helpers/userHelper");

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
    if (!title || typeof title !== "string")
      throw new UserError("You must provide a title for your album");
    if (!artist || typeof artist !== "string")
      throw new UserError("You must provide an artist for your album");
    if (!albumLength || typeof albumLength !== "string")
      throw new UserError("You must provide an album length for your album");
    if (!releaseYear || typeof releaseYear !== "number")
      throw new UserError("You must provide a release year for your album");
    if (!genre || typeof genre !== "string")
      throw new UserError("You must provide a genre for your album");
    if (!songs || !Array.isArray(songs))
      throw new UserError("You must provide an array of songs for your album");

    const reviews = [];
    const albumCollection = await albumsDatabase();

    let minutes = parseInt(albumLength.split(":")[0]);
    let seconds = parseInt(albumLength.split(":")[1]);

    if (minutes < 0 || minutes > 59)
      throw new UserError("Minutes must be between 0 and 59");
    if (seconds < 0 || seconds > 59)
      throw new UserError("Seconds must be between 0 and 59");

    if (isNaN(minutes) || isNaN(seconds))
      throw new UserError(
        "Song length must be in the format mm:ss (minutes:seconds)"
      );
    if (minutes === 0 && seconds === 0)
      throw new UserError("Song length must be greater than 0");

    // @ts-ignore
    if (parseInt(releaseYear) < 0)
      throw new UserError("Release year must be greater than 0");

    const newAlbum = {
      title: title.trim(),
      artist: artist.trim(),
      albumLength: albumLength.trim(),
      releaseYear:
        typeof releaseYear == "string" && releaseYear
          ? // @ts-ignore
            releaseYear.trim()
          : releaseYear,
      genre: genre,
      songs: songs,
      reviews: reviews,
    };

    const insertInfo = await albumCollection.insertOne(newAlbum);
    if (insertInfo.insertedCount === 0) throw new UserError("Could not add album");

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
    if (!id) throw new UserError("You must provide an id to search for");

    const albumCollection = await albumsDatabase();
    const parsedId = new ObjectId(id);
    const album = await albumCollection.findOne({
      _id: parsedId,
    });
    if (album === null) throw new UserError("No album with that id");

    return album;
  },

  async getAlbumsByArtist(artist) {
    if (!artist || typeof artist !== "string")
      throw new UserError("You must provide an artist to search for");

    const albumCollection = await albumsDatabase();
    const albums = await albumCollection
      .find({
        artist: artist,
      })
      .toArray();

    return albums;
  },

  async getAlbumsByGenre(genre) {
    if (!genre || typeof genre !== "string")
      throw new UserError("You must provide a genre to search");

    const albumCollection = await albumsDatabase();
    const albums = await albumCollection
      .find({
        genre: genre,
      })
      .toArray();

    return albums;
  },

  async getAlbumsByTitle(title) {
    if (!title || typeof title !== "string")
      throw new UserError("You must provide a title to search for");

    const albumCollection = await albumsDatabase();
    const albums = await albumCollection
      .find({
        title: title,
      })
      .toArray();

    return albums;
  },

  async addReviewToAlbum(albumId, userId, review) {
    if (!albumId) throw new UserError("You must provide an album id");
    if (!userId) throw new UserError("You must provide a user id");
    if (!review || typeof review !== "string")
      throw new UserError("You must provide a review");

    const albumCollection = await albumsDatabase();
    const userCollection = await usersDatabase();
    const parsedAlbumId = new ObjectId(albumId);
    const parsedUserId = new ObjectId(userId);

    const album = await albumCollection.findOne({
      _id: parsedAlbumId,
    });
    if (album === null) throw new UserError("No album with that id");

    const user = await userCollection.findOne({
      _id: parsedUserId,
    });
    if (user === null) throw new UserError("No user with that id");

    const newReview = {
      userId: userId,
      review: review,
    };

    const updatedInfo = await albumCollection.updateOne(
      {
        _id: parsedAlbumId,
      },
      {
        $push: {
          reviews: newReview,
        },
      }
    );
    if (updatedInfo.modifiedCount === 0) throw new UserError("Could not add review to album");

    const updatedAlbum = await this.getAlbumById(albumId);
    return updatedAlbum;
  },

  async updateAlbum(id, updatedAlbum) {
    if (!id) throw new UserError("You must provide an id to search for");
    if (!updatedAlbum)
      throw new UserError("You must provide an album to update");

    const albumCollection = await albumsDatabase();
    const parsedId = new ObjectId(id);

    const updatedAlbumData = {};

    if (updatedAlbum.title) {
      updatedAlbumData.title = updatedAlbum.title.trim();
    }

    if (updatedAlbum.artist) {
      updatedAlbumData.artist = updatedAlbum.artist.trim();
    }

    if (updatedAlbum.albumLength) {
      updatedAlbumData.albumLength = updatedAlbum.albumLength.trim();
    }

    if (updatedAlbum.releaseYear) {
      updatedAlbumData.releaseYear = updatedAlbum.releaseYear.trim();
    }

    if (updatedAlbum.genre) {
      updatedAlbumData.genre = updatedAlbum.genre.trim();
    }

    if (updatedAlbum.songs) {
      updatedAlbumData.songs = updatedAlbum.songs.trim();
    }

    let updateCommand = {
      $set: updatedAlbumData,
    };
    const query = {
      _id: parsedId,
    };
    await albumCollection.updateOne(query, updateCommand);

    return await this.getAlbumById(id);
  },

  async searchAlbums(searchTerm) {
    if (!searchTerm || typeof searchTerm !== "string")
      throw new UserError("You must provide a search term");

    const als = await this.getAllAlbums();

    //Yes, I wrote this line. No, I don't care.
    const searchedAlbums = als.filter((album) => {
      return album.title.toLowerCase().includes(searchTerm.toLowerCase()) || album.genre.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return searchedAlbums;
    },
  
    async addSongToAlbum(albumId, songID) {
        if (!albumId) throw new UserError("You must provide an album id");
        if (!songID) throw new UserError("You must provide a song id");
    
        const albumCollection = await albumsDatabase();
        const songCollection = await songsDatabase();
        const parsedAlbumId = new ObjectId(albumId);
        const parsedSongId = new ObjectId(songID);
    
        const album = await albumCollection.findOne({
            _id: parsedAlbumId,
        });
        if (album === null) throw new Error("No album with that id");

        const song = await songCollection.findOne({
            _id: parsedSongId,
        });
        if (song === null) throw new Error("No song with that id");

        const updatedInfo = await albumCollection.updateOne(
            {
                _id: parsedAlbumId,
            },
            {
                $push: {
                    songs: songID,
                },
            }
        );
        if (updatedInfo.modifiedCount === 0) throw new Error("Could not add song to album");

        const updatedAlbum = await this.getAlbumById(albumId);
        return updatedAlbum;
    },
};

module.exports = exportedMethods;
