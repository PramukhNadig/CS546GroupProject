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
        const songReviews = await reviews.getSongReviewBySongId(req.params.id);
        console.log(songReviews);
        if (songReviews.length > 0) {

            res.render('songs', {
                song: song,
                songReviews: songReviews
            });
        } else {
            res.render('songs', {
                song: song
            });
        }
    } catch (e) {
        res.status(404).json({
            error: 'Song not found'
        });
    }
});

module.exports = router;