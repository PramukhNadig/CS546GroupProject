const express = require('express');
const router = express.Router();
const data = require('../data');
const songs = data.songs;
const reviews = data.songReviews;

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
        res.status(404).render('error', {
            error: e
        });
    }
});

module.exports = router;