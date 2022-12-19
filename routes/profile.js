const express = require("express");
const router = express.Router();
const data = require("../data");
const users = data.users;
const songReviews = data.songReviews;
const albumReviews = data.albumReviews;
const playlists = data.playlists;
const songs = data.songs;
const albums = data.albums;

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

router.route("/").get(async (req, res) => {
  if (!req?.session?.user) res.redirect("/auth/login?next=/profile");

  res.redirect("/profile/" + encodeURIComponent(req?.session?.user?.username));
});
router.route("/:username").get(async (req, res) => {
  try {
    const { username } = req.params;
    const userData = await users.getUserByUsername(username);

    // get reviews for user
    const rev = await songReviews.getSongReviewByUserId(userData._id);
    const albRev = await albumReviews.getAlbumReviewsByUserId(userData._id);
    let songReviewsList = rev
      ? await Promise.all(
          rev?.map(async (review) => {
            const songName = await songs.getSongById(review.songID);
            return {
              ...review,
              songName: songName.title,
            };
          })
        )
      : [];

    let albumReviewsList = albRev
      ? await Promise.all(
          albRev?.map(async (review) => {
            const albumName = await albums.getAlbumById(review.albumID);
            return {
              ...review,
              albumName: albumName.title,
            };
          })
        )
      : [];

    const plst = await playlists.getPlaylistsByUserId(userData._id);

    console.log(plst);

    res.render("profile", {
      title: "Profile",
      userid: userData._id,
      username: userData.username,
      user: req.session?.["user"],
      playlists: plst,
      songReviews: songReviewsList,
      albumReviews: albumReviewsList,
    });
  } catch (e) {
    return handleError(e, res);
  }
});

module.exports = router;
