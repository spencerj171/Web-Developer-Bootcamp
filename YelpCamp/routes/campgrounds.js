let express = require("express"),
    router  = express.Router(),
    Campground = require("../models/campground"),
    Comment = require("../models/comment"),
    middleware = require("../middleware"),
    geocoder = require('geocoder'),
    { isLoggedIn, checkUserCampground, checkUserComment, isAdmin, isSafe } = middleware;

function escapeRegex(text){
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

router.get("/", function(req, res){
  if(req.query.search && req.xhr){
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');

    Campground.find({name: regex}, function(err, allCampgrounds){
      if(err){
        console.log(err);
      } else{
        res.status(200).json(allCampgrounds);
      }
    });
  } else {
    Campground.find({}, function(err, allCampgrounds){
      if(err){
        console.log(err);
      } else{
        if(req.xhr){
          res.json(allCampgrounds);
        } else{
          res.render("campgrounds/index",{campgrounds: allCampgrounds, page: 'campgrounds'});
        }
      }
    });
  }
});

router.post("/", isLoggedIn, isSafe, function(req, res){
  let name = req.body.name,
      image = req.body.image,
      desc = req.body.description,
      author = {
        id: req.user._id,
        username: req.user.username
      },
      cost = req.body.cost;

  geocoder.geocode(req.body.location, function (err, data){
    if(err || data.status === 'ZERO_RESULTS'){
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    let lat = data.results[0].geometry.location.lat,
        lng = data.results[0].geometry.location.lng,
        location = data.results[0].formatted_address,
        newCampground = {name: name, image: image, description: desc, cost: cost, author:author, location: location, lat: lat, lng: lng};

    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
          console.log(err);
        } else{
          console.log(newlyCreated);
          res.redirect("/campgrounds");
        }
    });
  });
});

router.get("/new", isLoggedIn, function(req, res){
  res.render("campgrounds/new");
});

router.get("/:id", function(req, res){
  Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
    if(err || !foundCampground){
      console.log(err);
      req.flash('error', 'Sorry, that campground does not exist!');
      return res.redirect('/campgrounds');
    }
    console.log(foundCampground)
    res.render("campgrounds/show", {campground: foundCampground});
  });
});

router.get("/:id/edit", isLoggedIn, checkUserCampground, function(req, res){
  res.render("campgrounds/edit", {campground: req.campground});
});

router.put("/:id", isSafe, function(req, res){
  geocoder.geocode(req.body.location, function (err, data) {
    let lat = data.results[0].geometry.location.lat,
        lng = data.results[0].geometry.location.lng,
        location = data.results[0].formatted_address,
        newData = {name: req.body.name, image: req.body.image, description: req.body.description, cost: req.body.cost, location: location, lat: lat, lng: lng};
    Campground.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, campground){
      if(err){
        req.flash("error", err.message);
        res.redirect("back");
        } else{
          req.flash("success","Successfully Updated!");
          res.redirect("/campgrounds/" + campground._id);
        }
    });
  });
});

router.delete("/:id", isLoggedIn, checkUserCampground, function(req, res){
  Comment.remove({
    _id: {
      $in: req.campground.comments
    }
  }, function(err){
    if(err){
      req.flash('error', err.message);
      res.redirect('/');
    } else{
      req.campground.remove(function(err){
        if(err){
          req.flash('error', err.message);
          return res.redirect('/');
        }
        req.flash('error', 'Campground deleted!');
        res.redirect('/campgrounds');
      });
    }
  });
});

module.exports = router;
