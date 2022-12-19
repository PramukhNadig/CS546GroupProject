const express = require("express");
const router = express.Router();
const data = require("../data");
const albums = data.albums;
const reviews = data.albumReviews;
const users = data.users;
const songs = data.songs;

const handleError = async (error, res) => {
  if (!!error?._status) {
    return res.status(error._status).render("forbiddenAccess", {
      message: error.message,
      title: "Error",
    });
  }
  console.error("Unhandled exception occured");
  console.error(error);
  return res.status(500).render("forbiddenAccess", {
    message: "Internal server error",
    title: "Error",
  });
};
router
  .route("/create")
  .get(async (req, res) => {
    try {
      if (!req.session?.user)
        return res.redirect(
          "/auth/login?next=" + encodeURIComponent(req.originalUrl)
        );

      const user = req.session?.user;
      const admin = user ? await users.checkAdmin(user.username) : false;
      if (!admin) {
        return res.status(403).render("forbiddenAccess", {
          message: "You are not authorized to perform this action",
        });
      }
      res.status(200).render("createAlbum", {
        user: user ? user : "User not found",
        admin: admin,
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

      const user = req.session?.user;
      const admin = user ? await users.checkAdmin(user.username) : false;
      if (!admin) {
        return res.status(403).render("forbiddenAccess", {
          message: "You are not authorized to perform this action",
        });
      }
      const newAlbum = await albums.createAlbum(
        req.body.newAlbumTitleInput.trim(),
        req.body.newAlbumArtistInput.trim(),
        req.body.newAlbumLengthInput.trim(),
        Number(req.body.newAlbumReleaseYearInput.trim()),
        req.body.newAlbumGenreInput,
        []
      );

      const newAlbumId = newAlbum._id.toString();
      console.log("New album created with id: " + newAlbumId);
      res.redirect("/album/" + newAlbumId);
    } catch (e) {
      return handleError(e, res);
    }
  });

router
  .route("/:id")
  .get(async (req, res) => {
    try {
      const album = await albums.getAlbumById(req.params.id);
      album.id = album._id.toString();

      const user = req.session?.user;
      const albumReviews = await reviews.getAlbumReviewsByAlbumId(
        req.params.id
      );
      const albumSongs = album.songs;
      let songList = [];
      for (let i = 0; i < albumSongs.length; i++) {
        songList[i] = await songs.getSongById(albumSongs[i]);
      }
      const admin = user ? await users.checkAdmin(user.username) : false;

      res.status(200).render("album", {
        album: album,
        user: req?.session?.user,
        albumReviews: albumReviews,
        hasAlbumReviews: albumReviews.length > 0 ? true : false,
        admin: admin,
        songs: songList,
        title: album?.title,
      });
    } catch (e) {
      console.log(e);
      res.status(404).render("error", {
        error: "Album not found",
        title: "Not found",
        user: req?.session?.user,
      });
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
      const albumId = req.params.id;
      const userID = req.session?.user.id;

      // run createSongReview
      const resp = await reviews.createAlbumReview(
        albumId,
        title,
        userID,
        username,
        rating,
        comment
      );
      const reviewId = resp._id.toString();

      // add it to song
      const addedReview = await albums.addReviewToAlbum(
        albumId,
        userID,
        reviewId
      );

      // if it worked, redeliver the webpage
      const user = req.session?.user;
      const albumReviews = await reviews.getAlbumReviewsByAlbumId(
        req.params.id
      ); // should have new review
      const album = await albums.getAlbumById(req.params.id);
      album.id = albumId;

      const admin = user ? await users.checkAdmin(user.username) : false;
      const albumSongs = album.songs;
      let songList = [];
      for (let i = 0; i < albumSongs.length; i++) {
        songList[i] = await songs.getSongById(albumSongs[i]);
      }

      res.status(200).render("album", {
        album: album,
        user: req?.session?.user,
        albumReviews: albumReviews,
        hasAlbumReviews: albumReviews.length > 0 ? true : false,
        admin: admin ? true : false,
        songs: songList,
        title: album?.title,
      });
    } catch (e) {
      return handleError(e, res);
    }
  });

router.route("/:id/addSong").post(async (req, res) => {
  try {
    if (!req.session?.user)
      return res.redirect(
        "/auth/login?next=" + encodeURIComponent(req.originalUrl)
      );

    const user = req.session?.user;
    const albumReviews = await reviews.getAlbumReviewsByAlbumId(req.params.id);
    const album = await albums.getAlbumById(req.params.id);
    album.id = album._id.toString();
    const admin = user ? await users.checkAdmin(user.username) : false;
    if (!admin) {
      return res.status(403).render("forbiddenAccess", {
        message: "You are not authorized to perform this action",
        title: "Unauthorized",
        user: req?.session?.user,
      });
    }

    const newSong = await songs.createSong(
      album.id,
      req.body.newSongTitleInput.trim(),
      req.body.newSongArtistInput.trim(),
      req.body.newSongLengthInput.trim(),
      Number(req.body.newSongReleaseYearInput.trim()),
      req.body.newSongGenreInput.split(","),
      req.body.newSongLyricsInput.trim()
    );

    const newSongId = newSong._id.toString();
    const addedSong = await albums.addSongToAlbum(album.id, newSongId);
    const albumSongs = album.songs;
    let songList = [];
    for (let i = 0; i < albumSongs.length; i++) {
      songList[i] = await songs.getSongById(albumSongs[i]);
    }

    res.status(200).render("album", {
      album: album,
      user: req?.session?.user,
      albumReviews: albumReviews,
      hasAlbumReviews: albumReviews.length > 0 ? true : false,
      admin: admin ? true : false,
      songs: songList,
      title: album?.title,
    });
  } catch (e) {
    return handleError(e, res);
  }
});

module.exports = router;
