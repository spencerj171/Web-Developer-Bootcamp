const express = require("express"),
      router  = express.Router({mergeParams: true}),
      Campground = require("../models/campground"),
      Comment = require("../models/comment"),
      middleware = require("../middleware"),
      { isLoggedIn, checkUserComment, isAdmin } = middleware;

router.get("/new", isLoggedIn, function(req, res){
  console.log(req.params.id);
  Campground.findById(req.params.id, function(err, campground){
    if(err){
      console.log(err);
    } else{
      res.render("comments/new", {campground: campground});
    }
  });
});

router.post("/", isLoggedIn, function(req, res){
  Campground.findById(req.params.id, function(err, campground){
    if(err){
      console.log(err);
      res.redirect("/campgrounds");
    } else{
      Comment.create(req.body.comment, function(err, comment){
        if(err){
          console.log(err);
        } else {
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          comment.save();
          campground.comments.push(comment);
          campground.save();
          console.log(comment);
          req.flash('success', 'Created a comment!');
          res.redirect('/campgrounds/' + campground._id);
        }
      });
    }
  });
});

router.get("/:commentId/edit", isLoggedIn, checkUserComment, function(req, res){
  res.render("comments/edit", {campground_id: req.params.id, comment: req.comment});
});

router.put("/:commentId", isAdmin, function(req, res){
  Comment.findByIdAndUpdate(req.params.commentId, req.body.comment, function(err, comment){
    if(err){
      console.log(err);
      res.render("edit");
    } else{
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
});

router.delete("/:commentId", isLoggedIn, checkUserComment, function(req, res){
  Campground.findByIdAndUpdate(req.params.id, {
    $pull: {
      comments: req.comment.id
    }
  }, function(err){
    if(err){
      console.log(err)
      req.flash('error', err.message);
      res.redirect('/');
    } else{
      req.comment.remove(function(err){
        if(err){
          req.flash('error', err.message);
          return res.redirect('/');
        }
        req.flash('error', 'Comment deleted!');
        res.redirect("/campgrounds/" + req.params.id);
      });
    }
  });
});

module.exports = router;
