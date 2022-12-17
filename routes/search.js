const express = require("express");
const router = express.Router();
const data = require("../data");
const { UserError } = require("../helpers/userHelper");
const songs = data.songs;
const albums = data.albums;

// for error handling
const handleError = async (error, res) => {
  if (!!error?._status) {
    return res
      .status(error._status)
      .render("forbiddenAccess", { message: error.message, title: "Error" });
  }
  console.error("Unhandled exception occured");
  console.error(error);
  return res
    .status(500)
    .render("forbiddenAccess", {
      message: "Internal server error",
      title: "Error",
      user: req?.session?.user,
    });
};

router.route("/").get(async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) { 
      return res.redirect("/top-music");
    };

    const [_songs, _albums, _artists] = await Promise.all([
      songs.searchSongs(query),
      albums.searchAlbums(query),
      songs.searchArtists(query),
    ]);

    res.render("search", {
      songs: _songs,
      albums: _albums,
      artists: _artists,
      title: "Search",
      user: req?.session?.user,
    });
  } catch (e) {
    console.error(e);
    handleError(e, res);
  }
});

module.exports = router;
