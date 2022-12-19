const express = require("express");
const router = express.Router();
const data = require("../data");
const songs = data.songs;
const reviews = data.songReviews;
const users = data.users;
const playlists = data.playlists;
const albums = data.albums;

const { UserError } = require("../helpers/userHelper");

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
  });
};

router.route("/").get(async (req, res) => {
  res.redirect("/search");
});

router.route("/:id/playlists").post(async (req, res) => {
  if (!req.session?.user)
    return res.redirect(
      "/auth/login?next=" + encodeURIComponent(req.originalUrl)
    );

  const body = req.body;
  let batch = body?.playlist || [];

  if (typeof batch == "string") batch = [batch];

  const results = await Promise.all(
    batch.map((playlist) =>
      playlists.addSongToPlaylist(playlist, req.params.id)
    )
  );

  const { id } = req.params;

  res.redirect("/song/" + encodeURIComponent(id));
});

router
  .route("/:id")
  .get(async (req, res) => {
    try {
      const song = await songs.getSongById(req.params.id);
      song.id = song._id.toString();
      const user = req.session?.user;
      const songReviews = await reviews.getSongReviewBySongId(req.params.id);

      const userPlaylists = user
        ? await playlists.getPlaylistsByUserId(user.id)
        : [];

      // playlists this song is in
      const relevantPlaylists = userPlaylists.filter((playlist) =>
        playlist?.Songs?.find((internal) => internal == song.id)
      );

      // the rest of the playlists
      const otherPlaylists = userPlaylists.filter(
        (playlist) =>
          !relevantPlaylists.find(
            (p) => p._id.toString() === playlist._id.toString()
          )
      );

      console.log(song._id);

      // get album
      const album = song._id
        ? await albums.getAlbumBySongID(song._id.toString())
        : null;

      let lyricsAreURL = false;

      if (song.lyrics) {
        // is it a url?
        if (song.lyrics.trim().startsWith("http")) {
          lyricsAreURL = true;
        } else {
          // fix whitespace issues
          song.lyrics = song.lyrics
            .split("\n")
            .map((a) => a.trim())
            .join("\n");
        }
      }

      res.status(200).render("song", {
        song: song,
        user: req?.session?.user,
        songReviews: songReviews,
        hasSongReviews: songReviews.length > 0 ? true : false,
        playlists: relevantPlaylists,
        allUserPlaylists: otherPlaylists,
        title: song?.title,
        lyricsAreURL: lyricsAreURL,
        album,
      });
    } catch (e) {
      return handleError(e, res);
    }
  })
  .post(async (req, res) => {
    try {
      if (!req.session?.user)
        return res.redirect(
          "/auth/login?next=" + encodeURIComponent(req.originalUrl)
        );

      const username = req.session?.user?.username;
      const title = req.body.newReviewTitleInput;
      const rating = Number(req.body.newReviewRatingInput);
      const comment = req.body.newReviewCommentInput;
      const songID = req.params.id;
      const userID = req.session?.user.id;

      // run createSongReview
      const resp = await reviews.createSongReview(
        title,
        userID,
        songID,
        username,
        rating,
        comment
      );
      const reviewId = resp._id.toString();

      // add it to song
      const song = await songs.addReviewToSong(songID, reviewId);

      // if it worked, redeliver the webpage
      res.redirect("/song/" + encodeURIComponent(songID));
    } catch (e) {
      return handleError(e, res);
    }
  });

module.exports = router;
