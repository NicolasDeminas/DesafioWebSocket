const express = require('express')
const passport = require('../config/passport')
const path = require('path')

const {Router} = express

const router = new Router()


router.get("/", (req, res) => {
    res.redirect("/home");
  });

  router.get("/login", (req, res) => {
      
    res.sendFile(`${path.join(__dirname, '..', 'public/login.html')}`);
  });

  router.get("/signup", (req, res) => {
    res.sendFile(`${path.join(__dirname, '..', 'public/signup.html')}`);
  });

  router.post(
    "/signup",
    passport.authenticate("local-signup", {
      successRedirect: "/login",
      failureRedirect: "/signup",
    })
  );

  router.post(
    "/login",
    passport.authenticate("local-login", {
      successRedirect: "/home",
      failureRedirect: "/login",
    })
  );

  router.get("/logout", (req, res) => {
    try {
      req.logOut();
      res.redirect("/login");
    } catch (err) {
      errorLogger.error(err);
    }
  });





  module.exports = router