const mongodb = require("mongodb");
const songsDatabase = require("../config/mongoCollections").songs;
const songReviews = require("./songReviews");
const { ObjectId } = require("mongodb");
const { UserError } = require("../helpers/userHelper");

const createSong = async (
  album,
  title,
  artist,
  songLength,
  releaseYear,
  genres,
  lyrics
) => {
  if (!album || typeof album !== "string")
    throw new UserError("You must provide an album name for your song");
  if (!title || typeof title !== "string")
    throw new UserError("You must provide a title for your song");
  if (!artist || typeof artist !== "string")
    throw new UserError("You must provide an artist for your song");
  if (!songLength || typeof songLength !== "string")
    throw new UserError("You must provide a song length for your song");
  if (!releaseYear || typeof releaseYear !== "number")
    throw new UserError("You must provide a release year for your song");
  if (!genres || !Array.isArray(genres))
    throw new UserError("You must provide an array of genres for your song");
  if (!lyrics || typeof lyrics !== "string")
    throw new UserError("You must provide lyrics for your song");

  const reviews = [];
  const songCollection = await songsDatabase();

  let minutes = parseInt(songLength.split(":")[0]);
  let seconds = parseInt(songLength.split(":")[1]);

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

  const newSong = {
    album: album.trim(),
    title: title.trim(),
    artist: artist.trim(),
    songLength: songLength.trim(),
    releaseYear: releaseYear,
    genres: genres,
    lyrics: lyrics.trim(),
    reviews: reviews,
  };

  const insertInfo = await songCollection.insertOne(newSong);
  if (insertInfo.insertedCount === 0) throw new Error("Could not add song");

  const newId = insertInfo.insertedId;
  const song = await getSongById(newId);
  return song;
};

const getAllSongs = async () => {
  const songCollection = await songsDatabase();

  const songs = await songCollection.find({}).toArray();

  return songs;
};

const getSongById = async (id) => {
  if (!id) throw new UserError("You must provide an id to search for");

  const songCollection = await songsDatabase();
  const parsedId = new ObjectId(id);
  const song = await songCollection.findOne({
    _id: parsedId,
  });
  if (song === null) throw new UserError("No song with that id");

  return song;
};

const getSongsByArtist = async (artist) => {
  if (!artist || typeof artist !== "string")
    throw new UserError("You must provide an artist to search for");

  const songCollection = await songsDatabase();
  const songs = await songCollection
    .find({
      artist: artist,
    })
    .toArray();

  return songs;
};

const getSongsByGenre = async (genre) => {
  if (!genre || typeof genre !== "string")
    throw new UserError("You must provide a genre to search for");

  const songCollection = await songsDatabase();
  const songs = await songCollection
    .find({
      genres: genre,
    })
    .toArray();

  return songs;
};

const getSongsByTitle = async (title) => {
  if (!title || typeof title !== "string")
    throw new UserError("You must provide a title to search for");

  const songCollection = await songsDatabase();
  const songs = await songCollection
    .find({
      title: title,
    })
    .toArray();

  return songs;
};

const getSongsWithMinAvgReview = async (avgReview) => {
  if (!avgReview || typeof avgReview !== "number")
    throw new UserError("You must provide a number to search for");

  const songCollection = await songsDatabase();
  const songs = await songCollection
    .find({
      avgReview: {
        $gte: avgReview,
      },
    })
    .toArray();

  return songs;
};

const searchSongs = async (searchTerm) => {
  if (!searchTerm || typeof searchTerm !== "string")
    throw new UserError("You must provide a search term to search for");

  const allSongs = await getAllSongs();

  //Yes, I wrote this line. No, I don't care.
  const filteredSongs = allSongs.filter((song) =>
    song.title.toLowerCase().includes(searchTerm.toLowerCase()) || song.genres.map(element => {return element.toLowerCase()}).includes(searchTerm.toLowerCase() || song.artist.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return filteredSongs;
};

const addReviewToSong = async (songId, reviewId) => {
  if (!songId || typeof songId !== "string")
    throw new UserError("You must provide a song id to add a review to");
  if (!reviewId || typeof reviewId !== "string")
    throw new UserError("You must provide a review id to add to a song");

  const songCollection = await songsDatabase();
  const parsedSongId = new ObjectId(songId);
  const parsedReviewId = new ObjectId(reviewId);

  const updatedInfo = await songCollection.updateOne(
    {
      _id: parsedSongId,
    },
    {
      $push: {
        reviews: parsedReviewId,
      },
    }
  );

  if (updatedInfo.modifiedCount === 0)
    throw new Error("Could not add review to song");

  return await getSongById(songId);
};

const searchArtists = async (searchTerm) => {
  if (!searchTerm || typeof searchTerm !== "string")
    throw new UserError("You must provide a search term to search for");

  const allSongs = await getAllSongs();
  const filteredSongs = allSongs.filter((song) =>
    song.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const uniqueArtists = [...new Set(filteredSongs.map((song) => song.artist))];
  return uniqueArtists;
};

const getTop5RatedSongs = async () => {
  const songCollection = await songsDatabase();
  const songs = await songCollection.find({}).toArray();
  const sortedSongs = songs.sort((a, b) => b.avgReview - a.avgReview);
  const top5Songs = sortedSongs.slice(0, 5);
  return top5Songs;
};

module.exports = {
  createSong,
  getAllSongs,
  getSongById,
  getSongsByArtist,
  getSongsByGenre,
  getSongsByTitle,
  getSongsWithMinAvgReview,
  searchSongs,
  searchArtists,
  addReviewToSong,
  getTop5RatedSongs,
};
