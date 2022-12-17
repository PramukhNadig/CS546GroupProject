const auth = require("./auth");
const songs = require("./songs");
const search = require("./search");
const playlist = require("./playlist");
const albums = require("./albums");
const friends = require("./friends");
const topMusic = require("./topMusic");
const profile = require("./profile");

const constructorMethod = (app) => {
  app.use("/auth", auth);

  app.use("/song", songs);

  app.use("/album", albums);

  app.use("/top-songs", topMusic);

  app.use("/search", search);

  app.use("/friends", friends);

  app.use("/playlists", playlist);

  app.use("/profile", profile);

  app.get("/", (req, res) =>
    res.render("home", {
      title: "Home",
      user: req.session?.["user"],
    })
  );

  app.use("*", (req, res) => {
    res.render('404');
  });
};

module.exports = constructorMethod;
