let express = require("express"),
    router  = express.Router(),
    passport = require("passport"),
    User = require("../models/user");

router.get("/", function(req, res){
  res.render("landing");
});

router.get("/register", function(req, res){
  res.render("register", {page: 'register'});
});

router.post("/register", function(req, res){
  let newUser = new User({username: req.body.username});
  if(req.body.adminCode === process.env.ADMIN_CODE){
    newUser.isAdmin = true;
  }
  User.register(newUser, req.body.password, function(err, user){
    if(err){
      console.log(err);
      return res.render("register", {error: err.message});
    }
    passport.authenticate("local")(req, res, function(){
      req.flash("success", "Successfully Signed Up! Nice to meet you " + req.body.username);
      res.redirect("/campgrounds");
    });
  });
});

router.get("/login", function(req, res){
  res.render("login", {page: 'login'});
});

router.post("/login", passport.authenticate("local",
  {
    successRedirect: "/campgrounds",
    failureRedirect: "/login",
    failureFlash: true,
    successFlash: 'Welcome to YelpCamp!'
  }), function(req, res){
});

router.get("/logout", function(req, res){
 req.logout();
 req.flash("success", "See you later!");
 res.redirect("/campgrounds");
});


module.exports = router;
