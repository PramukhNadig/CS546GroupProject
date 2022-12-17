const express = require("express");
const router = express.Router();
const data = require("../data");
const albums = data.albums;
const reviews = data.albumReviews;
const users = data.users;
const songs = data.songs;

const handleError = async (error, res) => {
    if (!!error?._status) {
        return res
            .status(error._status)
            .render("forbiddenAccess", {
                message: error.message
            });
    }
    console.error("Unhandled exception occured");
    console.error(error);
    return res
        .status(500)
        .render("forbiddenAccess", {
            message: "Internal server error"
        });
};

router.route("/:id").get(async (req, res) => {
    try {
        const album = await albums.getAlbumById(req.params.id);
        album.id = album._id.toString();

        const user = req.session?.user;
        const albumReviews = await reviews.getAlbumReviewsByAlbumId(req.params.id);
        const albumSongs = album.songs;
        let songList = [];
        for (let i = 0; i < albumSongs.length; i++) {
            songList[i] = await songs.getSongById(albumSongs[i]);
        }
        console.log(user.username)
        const admin = user ? await users.checkAdmin(user.username) : false;
        res.status(200).render("album", {
            album: album,
            user: user ? user : "User not found",
            albumReviews: albumReviews,
            hasAlbumReviews: albumReviews.length > 0 ? true : false,
            admin: admin,
            songs: songList
        });
         
    } catch (e) {
        console.log(e);
        res.status(404).render("error", {
            "error": "Album not found"
        });
    }
}).put(async (req, res) => {
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
        const addedReview = await albums.addReviewToAlbum(albumId, userID, reviewId);

        // if it worked, redeliver the webpage
        const user = req.session?.user;
        const albumReviews = await reviews.getAlbumReviewsByAlbumId(req.params.id); // should have new review
        console.log(albumReviews);
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
            user: user ? user : "User not found",
            albumReviews: albumReviews,
            hasAlbumReviews: albumReviews.length > 0 ? true : false,
            admin: admin ? true : false,
            songs: songList
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
                message: "You are not authorized to perform this action"
            });
        }

        console.log(req.body.newSongTitleInput);
        const newSong = await songs.createSong(
            album.id,
            req.body.newSongTitleInput.trim(),
            req.body.newSongArtistInput.trim(),
            req.body.newSongLengthInput.trim(),
            Number(req.body.newSongReleaseYearInput.trim()),
            req.body.newSongGenreInput.split(","),
            req.body.newSongLyricsInput.trim(),
        );

        console.log(newSong);
        const newSongId = newSong._id.toString();
        const addedSong = await albums.addSongToAlbum(album.id, newSongId);
        const albumSongs = album.songs;
        let songList = [];
        for (let i = 0; i < albumSongs.length; i++) {
            songList[i] = await songs.getSongById(albumSongs[i]);
        }

        res.status(200).render("album", {
            album: album,
            user: user ? user : "User not found",
            albumReviews: albumReviews,
            hasAlbumReviews: albumReviews.length > 0 ? true : false,
            admin: admin ? true : false,
            songs: songList
        });
    } catch (e) {
        return handleError(e, res);
    }
});



        module.exports = router;
