const express = require("express");
const { MongoUnexpectedServerResponseError } = require("mongodb");
const router = express.Router();
const data = require("../data");
const { UserError } = require("../helpers/userHelper");
const songs = data.songs;
const albums = data.albums;
const users = data.users;
const songReviews = data.songReviews;

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
  try {
    const user = req.session?.user;
    if (!user) {
      return res.redirect("/auth/login");
    }
    let friendsList = [];
    let n = (await users.getUserFriends(user.username)) || [];
    const allUsers = await users.getAllUsers();

    let already = [];

    for (let i = 0; i < n.length; i++) {
      let friend = null;
      try {
        friend = await users.getUserByID(n[i]);
      } catch (e) {
        friend = await users.getUserByUsername(n[i]);
      }
      if (already.indexOf(friend._id) >= 0) continue;
      already.push(friend._id);
      friendsList.push({
        username: friend.username,
        id: friend._id,
      });
    }

    console.log(friendsList);

    // get each friend's most recent reviews as feedItem
    const recentReviews = await Promise.all(
      friendsList.map(async (friend) => {
        const reviews = await songReviews.getMostRecentReviewsByUserId(
          friend.id.toString()
        );

        // for each song id get song name
        const songsWithNames = await Promise.all(
          reviews.map(async (review) => {
            const song = await songs.getSongById(review.songID.toString());
            return {
              ...review,
              songName: song.title,
            };
          })
        );

        return songsWithNames.map((review) => {
          return {
            creatorUsername: friend.username,
            creatorID: friend.id,
            text: "wrote a review for " + review.songName,
            url: "/song/" + review.songID.toString(),
            ...review,
          };
        });
      })
    );

    let feed = [];
    for (let x of recentReviews) feed = [...feed, ...x];

    res.status(200).render("friends", {
      user: req.session?.user,
      friends: friendsList.length > 0 ? friendsList : false,
      allUsers,
      feed,
    });
  } catch (e) {
    return handleError(e, res);
  }
});

router.route("/add/:name").post(async (req, res) => {
  try {
    // get user session
    const user = req.session?.user;
    if (!user) {
      throw new UserError("You must be logged in to add a friend");
    }

    // get friend name
    const friendName = req.params.name;

    // check if that user exists
    const friend = await users.getUserByUsername(friendName);
    if (!friend) {
      throw new UserError("User does not exist");
    }

    // add friend
    await users.addFriend(user.username, friend.username);

    console.log("nowFriends");
    res.json({ nowFriends: true });
  } catch (e) {
    return handleError(e, res);
  }
});

module.exports = router;
