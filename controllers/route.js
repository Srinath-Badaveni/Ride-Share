const Route = require("../models/route");

module.exports.index = async (req, res) => {
  const rides = await Route.find({});
  let currentDate = new Date();
  const Routes = rides.filter(async (ride) => {
    if (ride.date < currentDate) {
      return await Route.findByIdAndDelete(ride._id);
    } else {
      return ride.date > currentDate;
    }
  });

  res.render("home/main.ejs", { Routes });
};

module.exports.addNew = async (req, res) => {
  let sampleRoute = new Route(req.body.route);
  let currentDate = new Date();
  let maxDate = new Date();
  maxDate.setDate(currentDate.getDate() + 5);
  if (sampleRoute.date > maxDate) {
    req.flash("error", "Date Should be in 5 days form today !!");
    return res.redirect("/route/addNew");
  }
  sampleRoute.owner = req.user._id;
  await sampleRoute.save();
  res.redirect("/route");
};

module.exports.renderNew = (req, res) => {
  let currentDate = new Date();
  let maxDate = new Date();
  maxDate.setDate(currentDate.getDate() + 5);
  console.log(maxDate);
  res.render("home/addRoute.ejs", { maxDate });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const ride = await Route.findById(id);
  if (!ride) {
    req.flash("error", "Listing not found ");
    res.redirect("/route");
  }
  res.render("home/editRoute.ejs", { ride });
};

module.exports.editRoute = async (req, res) => {
  const { id } = req.params;
  const ride = await Route.findOneAndUpdate({ _id: id }, { ...req.body.route });
  req.flash("success", "Route Edited successfully!!");
  res.redirect(`/route`);
};

module.exports.myRides = async (req, res) => {
  const { id } = req.params;
  const Routes = await Route.find({ owner: id }).populate("owner");
  res.render("home/myRides.ejs", { Routes });
};

module.exports.RideDetails = async (req, res) => {
  const { id } = req.params;
  const ride = await Route.findById(id).populate("bookings");
  console.log(ride);
  res.render("home/rideDetails.ejs", { ride });
};

module.exports.deleteRide = async (req, res) => {
  const { id } = req.params;
  const ride = await Route.findByIdAndDelete(id);
  req.flash("success", "route deleted successfully");
  res.redirect(`/route/${req.user._id}`);
};
