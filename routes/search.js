const express = require('express');
const router = express.Router();
const data = require('../data');
const songs = data.songs;
const albums = data.albums;

router.route('/').get(async (req, res) => {
    console.log(req.query.q);
    const s = await songs.searchSongs(req.query.q);
    const a = await albums.searchAlbums(req.query.q);
    const ar = await songs.searchArtists(req.query.q);
    res.render('search', {
        songs: s,
        albums: a,
        artists: ar
    });
});

module.exports = router;