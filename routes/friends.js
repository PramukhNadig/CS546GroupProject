const express = require("express");
const { MongoUnexpectedServerResponseError } = require("mongodb");
const router = express.Router();
const data = require("../data");
const { UserError } = require("../helpers/userHelper");
const songs = data.songs;
const albums = data.albums;
const users = data.users;

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
  const user = req.session?.user;
  if (!user) {
    return res.redirect("/auth/login");
  }
  res.status(200).render("friends", {
    user: req.session?.user,
    friends: await users.getUserFriends(req.session?.user),
    title: "Friends",
  });
});