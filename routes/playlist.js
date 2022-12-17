const express = require("express");
const router = express.Router();
const data = require("../data");
const songs = data.songs;
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
  return res
    .status(500)
    .render("forbiddenAccess", { message: "Internal server error", title: "Error" });
};

router.route("/create").post(async (req, res) => {
  try {
    const user = req.session?.user;

    if (!user) {
      throw new UserError("You must be logged in to create a playlist");
    }

    if (!req.body.newPlaylistNameInput) {
      throw new UserError("Playlist name cannot be empty");
    }

    const newPlaylist = await playlists.createPlaylist(
      req.body.newPlaylistNameInput,
      [],
      user.id
    );
    res.redirect("/playlists");
  } catch (e) {
    return handleError(e, res);
  }
});

router.route("/").get(async (req, res) => {
  try {
    // get all playlists
    const allPlaylists = await playlists.getAllPlaylists();

    const plist = await Promise.all(
      allPlaylists.map(async (playlist) => ({
        ...playlist,
        owner: await users.getUserByID(playlist.UserID.toString()),
      }))
    );

    res.render("playlists", {
      title: "Playlists",
      playlists: plist,
      user: req.session?.user,
    });
  } catch (e) {
    return handleError(e, res);
  }
});

router.route("/:id").get(async (req, res) => {
  try {
    const playlist = await playlists.getPlaylistById(req.params.id);
    const user = req.session?.user;
    // check if the user is the owner of the playlist
    const isOwner = user ? user.id === playlist.UserID : false;

    const Songs = await Promise.all(
      playlist.Songs?.map(async (songId) => await songs.getSongById(songId))
    );

    let newTitle = playlist.PlaylistName;

    if (newTitle == "Favorites") {
      // get owner's name
      const owner = await users.getUserByID(playlist.UserID.toString());

      // set new title
      newTitle = owner.username + "'s Favorites";
    }

    const newPlaylist = {
      ...playlist,
      PlaylistName: newTitle,
      Songs,
    };

    res.status(200).render("playlist", {
      playlist: newPlaylist,
      title: newTitle,
      isOwner,
      user: req.session?.user,
    });
  } catch (e) {
    return handleError(e, res);
  }
});
module.exports = router;
