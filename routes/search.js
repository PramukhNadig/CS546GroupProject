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
  return res.status(500).render("forbiddenAccess", {
    message: "Internal server error",
    title: "Error",
    user: req?.session?.user,
  });
};

router.route("/").get(async (req, res) => {
  try {
    const { query, feelinglucky = false } = req.query;
    if (!query) {
      return res.redirect("/top-music");
    }

    const [_songs, _albums, _artists] = await Promise.all([
      songs.searchSongs(query),
      albums.searchAlbums(query),
      songs.searchArtists(query),
    ]);

    if (feelinglucky) {
      if (feelinglucky == "true" && _songs.length > 0)
        return res.redirect(`/songs/${_songs[0]._id}`);

      if (feelinglucky == "song" && _songs.length > 0)
        return res.redirect(`/songs/${_songs[0]._id}`);

      if (feelinglucky == "album" && _albums.length > 0)
        return res.redirect(`/album/${_albums[0]._id}`);

      if (feelinglucky == "artist" && _artists.length > 0)
        return res.redirect(`/artists/${_artists[0]._id}`);
    }

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
