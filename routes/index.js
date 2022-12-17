const auth = require("./auth");
const songs = require("./songs");
const search = require("./search");
const playlist = require("./playlist");
const albums = require("./albums");

const constructorMethod = (app) => {
  app.use("/auth", auth);

  app.use("/song", songs);

  app.use("/album", albums);

  app.use("/search", search);

  app.use("/playlists", playlist);
  app.get("/", (req, res) =>
    res.render("home", {
      title: "Home",
      user: req.session?.["user"],
    })
  );

  app.use("*", (req, res) => {
    res.sendStatus(404);
  });
};

module.exports = constructorMethod;
