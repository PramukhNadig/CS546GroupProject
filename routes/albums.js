const express = require("express");
const router = express.Router();
const data = require("../data");
const songs = data.songs;
const albums = data.albums
const reviews = data.albumReviews;
const users = data.users;

const { UserError } = require("../helpers/userHelper");

// for error handling
const handleError = async (error, res) => {
  if (!!error?._status) {
    return res
      .status(error._status)
      .render("forbiddenAccess", { message: error.message });
  }
  console.error("Unhandled exception occured");
  console.error(error);
  return res
    .status(500)
    .render("forbiddenAccess", { message: "Internal server error" });
};

router.route("/").get(async (req, res) => {
  res.render("search");
});

router
  .route("/:id")
  .get(async (req, res) => {
    try {
      const album = await albums.getAlbumById(req.params.id);
      album.id = album._id.toString();
      const user = req.session?.user;
      const albumReviews = await reviews.getAlbumReviewsByAlbumId(req.params.id);

      const songsList = await Promise.all(
        album.songs.map(async (songId) => {
          const song = await songs.getSongById(songId.toString());
          return song;
        })
      )

      res.status(200).render("album", {
        album: album,
        songs: songsList,
        user: user ? user : "User not found",
        albumReviews: albumReviews,
        hasAlbumReviews: albumReviews.length > 0 ? true : false,
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
      const albumID = req.params.id;
      const userID = req.session?.user.id;

      // run createAlbumReview
      const resp = await reviews.createAlbumReview( 
        albumID,
        title,
        userID,
        username,
        rating,
        comment
      );
      const reviewID = resp._id.toString();

      // add it to album
      const album = await albums.addReviewToAlbum(albumID, userID, reviewID);

      // if it worked, redeliver the webpage
      album.id = albumID;
      const user = req.session?.user;
      const albumReviews = await reviews.getAlbumReviewsByAlbumId(req.params.id); // should have new review

      const songsList = album.songs.map(songs.getSongById);

      res.status(200).render("album", {
        album: album,
        user: user ? user : "User not found",
        songs: songsList,
        albumReviews: albumReviews,
        hasAlbumReviews: albumReviews.length > 0 ? true : false,
      });
    } catch (e) {
      return handleError(e, res);
    }
  });

module.exports = router;
