const express = require("express");
const router = express.Router();
const data = require("../data");
const users = data.users;
const songReviews = data.songReviews;
const albumReviews = data.albumReviews;
const songs = data.songs;
const albums = data.albums;

router.route("/").get(async (req, res) => {
  const userData = await users.getUserByUsername(
    req.session?.["user"]?.username
  );
  let songReviewsList = await Promise.all(
    userData.songReviews.map(async (reviewId) => {
      const songReview = await songReviews.getSongReviewById(reviewId);
      const songName = await songs.getSongById(songReview.songID);
      return {
        songName: songName.title,
        ...songReview,
      };
    })
  );

  let albumReviewsList = await Promise.all(
    userData.albumReviews.map(async (reviewId) => {
      const albumReview = await albumReviews.getAlbumReviewById(reviewId);
      const albumName = await albums.getAlbumById(albumReview.albumID);
      return {
        albumName: albumName.title,
        ...albumReview,
      };
    })
  );

  // console.log(songReviewsList);

  // userData.songReviews.forEach(async (reviewId) => {
  //   console.log(reviewId)
  //   const reviewData = await songReviews.getSongReviewById(reviewId);
  //   songReviewsList.push(reviewData);
  //   console.log(reviewData)
  // });
  // console.log(songReviewsList);
  res.render("profile", {
    title: "Profile",
    user: req.session?.["user"],
    playlists: JSON.stringify(userData.playlists),
    songReviews: songReviewsList,
    albumReviews: albumReviewsList,
  });
});

module.exports = router;
