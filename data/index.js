//Here you will require data files and export them as shown in lecture code and worked in previous labs.

const users = require("./users");
const albums = require("./albums");
const songs = require("./songs");
const playlists = require("./playlist");
const songReviews = require("./songReviews");
const albumReviews = require("./albumReviews");

module.exports = {
  users,
  albums,
  songs,
  playlists,
  songReviews,
  albumReviews
};