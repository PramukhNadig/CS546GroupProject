const auth = require("./auth");

const constructorMethod = (app) => {
  app.use("/auth", auth);

  app.get("/", (req, res) =>
    res.render("home", { title: "Home", user: req.session?.["user"] })
  );

  app.use("*", (req, res) => {
    res.sendStatus(404);
  });
};

module.exports = constructorMethod;
