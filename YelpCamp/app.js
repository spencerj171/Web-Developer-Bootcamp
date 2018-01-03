let express = require('express'),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/yelp_camp');
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

let campgroundSchema = new mongoose.Schema({
  name: String,
  image: String,
  description: String
});

let Campground = mongoose.model("Campground", campgroundSchema);

app.get("/", function(req, res){
  res.render('landing');
});

app.get('/campgrounds', function(req, res){
  Campground.find({}, function(err, campgrounds){
    if(err){
      console.log(err);
    } else{
      res.render('index', {campgrounds:campgrounds});
    }
  });
});

app.post("/campgrounds", function(req, res){
  let name = req.body.name;
  let image = req.body.image;
  let desc = req.body.description;
  let newCampground = {name: name, image: image, description: desc};

  Campground.create(newCampground, function(err, newlyCreated){
    if(err){
      console.log(err);
    } else{
      res.redirect("/campgrounds");
    }
  });
});

app.get("/campgrounds/new", function(req, res){
  res.render("new.ejs");
});

app.get("/campgrounds/:id", function(req, res){
  Campground.findById(req.params.id, function(err, foundCampground){
    if(err){
      console.log(err);
    } else{
      res.render('show', {campground: foundCampground});
    }
  });
});

app.listen(3000, function(){
  console.log("server started");
});