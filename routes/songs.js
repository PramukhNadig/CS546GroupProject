const express = require('express');
const router = express.Router();
const data = require('../data');
const songs = data.songs;
const reviews = data.songReviews;
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

router.route('/').get(async (req, res) => {
    res.render('search');
});

router.route('/:id').get(async (req, res) => {
    try {
        const song = await songs.getSongById(req.params.id);
        song.id = song._id.toString()
        const user = req.session?.user;
        const songReviews = await reviews.getSongReviewBySongId(req.params.id);
        
        console.log(song);
        console.log(user);
        console.log(songReviews);

        res.status(200).render('song', {
            song: song,
            user: user ? user : "User not found",
            songReviews: songReviews,
            hasSongReviews: songReviews.length > 0 ? true : false
        });
    } catch (e) {
        return handleError(e, res);
    }
}).post(async (req, res) => {
    try {
        const username = req.body.newReviewUsernameInput;
        const title = req.body.newReviewTitleInput;
        const rating = Number(req.body.newReviewRatingInput);
        const comment = req.body.newReviewCommentInput;
        const songID = req.params.id;
        const userID = req.session?.user.id;

        // run createSongReview
        const resp = await reviews.createSongReview(title, userID, songID, username, rating, comment);
        const reviewId = resp._id.toString();

        // add it to song
        const song = await songs.addReviewToSong(songID, reviewId);

        // if it worked, redeliver the webpage
        song.id = songID;
        const user = req.session?.user;
        const songReviews = await reviews.getSongReviewBySongId(req.params.id); // should have new review

        res.status(200).render('song', {
            song: song,
            user: user ? user : "User not found",
            songReviews: songReviews,
            hasSongReviews: songReviews.length > 0 ? true : false
        });
    } catch (e) {
      return handleError(e, res);
    }
});

module.exports = router;