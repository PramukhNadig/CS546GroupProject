const express = require("express");
const router = express.Router();

const { UserError } = require("../helpers/userHelper");

const { users } = require("../data");

const renderLogin = (req, res, error) =>
  res.render("auth", {
    login: true,
    layout: false,
    title: "Log in",
    target: "/auth/login",
    error,
    user: req?.session?.user,
  });

const renderRegister = (req, res, error) =>
  res.render("auth", {
    login: false,
    layout: false,
    title: "Sign up",
    target: "/auth/register",
    error,
    user: req?.session?.user,
  });

const handleError = async (error, res) => {
  if (!!error?._status) {
    return res
      .status(error._status)
      .render("forbiddenAccess", { message: error.message, title: "Error" });
  }
  console.error("Unhandled exception occured");
  console.error(error);
  return res.status(500).render("forbiddenAccess", {
    message: "Internal server error",
    title: "Error",
  });
};

router.route("/").get(async (req, res) => {
  // @ts-ignore
  if (req.session?.user) {
    return res.redirect("/");
  }

  return renderLogin(req, res);
});

router
  .route("/register")
  .get(async (req, res) => {
    // @ts-ignore
    if (req.session?.user) {
      return res.redirect("/");
    }
    return renderRegister(req, res);
  })
  .post(async (req, res) => {
    try {
      let { usernameInput, passwordInput } = req.body;
      if (!usernameInput || !passwordInput)
        throw new UserError("Username and password must be provided");

      usernameInput = usernameInput.toLowerCase();

      // run createUser
      const resp = await users.createUser(usernameInput, passwordInput);

      if (!resp) {
        throw new Error("Could not insert user or did not return userInserted");
      }

      req.session.user = {
        username: resp.username,
        id: resp._id,
      };

      return res.redirect("/");
    } catch (e) {
      if (e instanceof UserError) {
        return renderRegister(req, res, e.message);
      }
      return handleError(e, res);
    }
  });

router
  .route("/login")
  .get(async (req, res) => {
    // @ts-ignore
    if (req.session?.user) {
      return res.redirect("/");
    }
    return renderLogin(req, res);
  })
  .post(async (req, res) => {
    try {
      // get username and password from body
      let { usernameInput, passwordInput } = req.body;
      // validate username and password
      // if not exist throw UserError

      if (!usernameInput || !passwordInput)
        throw new UserError("Username and password must be provided");

      usernameInput = usernameInput.toLowerCase();

      const resp = await users.checkUser(usernameInput, passwordInput);

      if (!resp?.authenticatedUser)
        throw new UserError("Either the username or password is invalid");
      // @ts-ignore - hack to ignore
      const username = usernameInput.toLowerCase();
      const userId = (
        await users.getUserByUsername(usernameInput)
      )._id.toString();

      req.session.user = {
        username: username,
        id: userId,
      };

      res.redirect("/");
    } catch (e) {
      // TODO proper status
      if (e instanceof UserError) {
        return renderLogin(req, res, e.message);
      }
      return handleError(e, res);
    }
  });

router.route("/logout").get(async (req, res) => {
  // @ts-ignore
  if (!req.session?.user)
    return renderLogin(req, res, "You have been logged out.");

  // @ts-ignore
  req.session.destroy();

  return renderLogin(req, res, "You have been logged out.");
});

module.exports = router;
