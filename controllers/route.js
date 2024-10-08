const Route = require("../models/route");

module.exports.index = async (req, res) => {
  const Routes = await Route.find({});
  res.render("home/main.ejs", { Routes });
};

module.exports.addNew = async (req, res) => {
  let sampleRoute = new Route(req.body.route);
  sampleRoute.owner = req.user._id;
  await sampleRoute.save();
  res.redirect("/route");
}

module.exports.renderNew = (req, res) => {
  res.render("home/addRoute.ejs");
}

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const ride = await Route.findById(id);
  if (!ride) {
    req.flash("error", "Listing not found ");
    res.redirect("/route");
  }
  res.render("home/editRoute.ejs", {ride});
}

module.exports.editRoute = async (req, res) => {
  const { id } = req.params;
  const ride = await Route.findOneAndUpdate({ _id: id }, { ...req.body.route });
  req.flash("success", "Route Edited successfully!!");
  res.redirect(`/route`);
}

module.exports.myRides = async(req,res)=>{
  const {id} = req.params;
  const Routes = await Route.find({owner: id}).populate("owner")
  res.render("home/myRides.ejs",{Routes})
}

module.exports.RideDetails = async(req,res)=>{
  const{id} = req.params
  const ride = await Route.findById(id).populate("bookings")
  console.log(ride)
  res.render("home/rideDetails.ejs",{ride})
}

module.exports.deleteRide = async(req,res)=>{
  const{id} = req.params;
  const ride = await Route.findByIdAndDelete(id)
  req.flash("success","route deleted successfully")
  res.redirect(`/route/${req.user._id}`)
}
