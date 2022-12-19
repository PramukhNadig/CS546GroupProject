const express = require("express");
const router = express.Router();
const data = require("../data");
const songs = data.songs;
const reviews = data.songReviews;
const users = data.users;
const playlists = data.playlists;

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
  // get all songs
  const allSongs = await songs.getAllSongs();

  let lookupUser = {};

  // left join with song reviews
  const allSongsWithReviews = await Promise.all(
    allSongs.map(async (song) => {
      const songReviews = await reviews.getSongReviewBySongId(song._id);
      // match user with each review
      const songReviewsWithUser = await Promise.all(
        songReviews.map(async (review) => {
          // memoize if we have the same user a bunch of times
          const uid = review.userID.toString();
          if (lookupUser[uid]) {
            review.user = lookupUser[uid];
            return review;
          }
          const user = await users.getUserByID(uid);
          review.user = user;
          lookupUser[uid] = user;
          return review;
        })
      );
      song.reviews = songReviewsWithUser;
      song.averageRating =
        Math.floor(
          (songReviewsWithUser.reduce((acc, cur) => acc + cur.rating, 0) /
            songReviewsWithUser.length || -1) * 10
        ) / 10;
      return song;
    })
  );

  const topSongs = allSongsWithReviews
    .filter(({ averageRating }) => averageRating >= 0)
    .sort((a, b) => b.averageRating - a.averageRating);

  // take only the top 10, or less
  const charts = topSongs.slice(0, 10);

  // If each song has an albumID, the url is "/albums/:id".
  // Otherwise, it's /search?query=albumid
  const formattedTopSongs = charts.map((song) => {
    if (song.albumID) {
      song.albumURL = `/albums/${encodeURIComponent(song.albumID)}`;
    } else {
      song.albumURL = `/search?query=${encodeURIComponent(song.album)}`;
    }
    return song;
  });

  //   res.json({ topSongs });
  res.render("topMusic", {
    title: "Top Music",
    topSongs: formattedTopSongs,
    user: req.session?.user,
  });
});

module.exports = router;
