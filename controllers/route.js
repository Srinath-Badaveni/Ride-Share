// const Route = require("../models/route");
// const Booking = require("../models/bookings");
// const { convertToMinutes } = require("../middleware");

// module.exports.index = async (req, res) => {
//   const rides = await Route.find({});
//   let currentDate = new Date();
//   currentDate.setMinutes(currentDate.getMinutes() + 330);
//   const Routes = rides.filter(async (ride) => {
//     const rideDate = ride.date
//     // rideDate.date.setMinutes(rideDate.date.getMinutes() + convertToMinutes(rideDate.time)-330);
//     if (ride.date < currentDate) {
//       return await Route.findByIdAndDelete(ride._id);
//     }
//      else if (ride.tempBookings) {
//       // Variable to track if we need to update the ride
//       let seatsToAdd = 0;

//       // Array to collect expired booking IDs for removal
//       const expiredBookingIds = [];
//       // Check each booking for expiration
//       for (let booking of ride.tempBookings) {
//         if (Date.now() > booking.expTime) {
//           seatsToAdd += booking.seats; // Add back expired seats
//           expiredBookingIds.push(booking._id); // Collect expired booking IDs
//         }
//       }
//       if (expiredBookingIds.length > 0) {
//         ride.seats += seatsToAdd;

//         for (let i = ride.tempBookings.length - 1; i >= 0; i--) {
//           if (expiredBookingIds.includes(ride.tempBookings[i]._id)) {
//             ride.tempBookings.splice(i, 1);
//           }
//         }
//       }
//       // Save the updated ride document with new seats
//       await ride.save();
//     }
//      else {
//       return ride.date > currentDate;
//     }
//   });

//   res.render("home/main.ejs", { Routes });
// };

// module.exports.addNew = async (req, res) => {
//   let sampleRoute = new Route(req.body.route);
//   let currentDate = new Date();
//   let maxDate = new Date();
//   maxDate.setDate(currentDate.getDate() + 5);
//   if (sampleRoute.date > maxDate) {
//     req.flash("error", "Date Should be in 5 days form today !!");
//     return res.redirect("/route/addNew");
//   }
//   sampleRoute.owner = req.user._id;
//   sampleRoute.date.setMinutes(sampleRoute.date.getMinutes() + convertToMinutes(sampleRoute.time));
//   await sampleRoute.save();
//   res.redirect("/route");
// };

// module.exports.renderNew = (req, res) => {
//   let currentDate = new Date();
//   let maxDate = new Date();
//   maxDate.setDate(currentDate.getDate() + 5);
//   res.render("home/addRoute.ejs", { maxDate });
// };

// module.exports.renderEditForm = async (req, res) => {
//   const { id } = req.params;
//   const ride = await Route.findById(id);
//   if (!ride) {
//     req.flash("error", "Listing not found ");
//     res.redirect("/route");
//   }
//   res.render("home/editRoute.ejs", { ride });
// };

// module.exports.editRoute = async (req, res) => {
//   const { id } = req.params;
//   await Route.findOneAndUpdate({ _id: id }, { ...req.body.route });
//   const sampleRoute = await Route.findById(id)
//   console.log(sampleRoute)
//   sampleRoute.date.setMinutes(sampleRoute.date.getMinutes() + convertToMinutes(sampleRoute.time));
//   console.log(sampleRoute)
//   await sampleRoute.save()
//   req.flash("success", "Route Edited successfully!!");
//   res.redirect(`/route`);
// };

// module.exports.myRides = async (req, res) => {
//   const { id } = req.params;
//   const Routes = await Route.find({ owner: id }).populate("owner");
//   res.render("home/myRides.ejs", { Routes });
// };

// module.exports.RideDetails = async (req, res) => {
//   const { id } = req.params;
//   const ride = await Route.findById(id).populate("bookings");
//   console.log(ride);
//   res.render("home/rideDetails.ejs", { ride });
// };

// module.exports.deleteRide = async (req, res) => {
//   const { id } = req.params;
//   const ride = await Route.findByIdAndDelete(id);
//   await Booking.deleteMany({_id: {$in:ride.bookings}})
//   req.flash("success", "route deleted successfully");
//   res.redirect(`/route/${req.user._id}`);
// };


const Route = require("../models/route");
const Booking = require("../models/bookings");
const { convertToMinutes, calculateDistance } = require("../middleware");
require("dotenv").config();

module.exports.index = async (req, res) => {
  const rides = await Route.find({});
  console.log(rides)
  let currentDate = new Date();
  currentDate.setMinutes(currentDate.getMinutes() + 330);
  const Routes = rides.filter(async (ride) => {
    const rideDate = ride.date
    // rideDate.date.setMinutes(rideDate.date.getMinutes() + convertToMinutes(rideDate.time)-330);
    if (ride.date < currentDate) {
      return await Route.findByIdAndDelete(ride._id);
    }
     else if (ride.tempBookings) {
      // Variable to track if we need to update the ride
      let seatsToAdd = 0;

      // Array to collect expired booking IDs for removal
      const expiredBookingIds = [];
      // Check each booking for expiration
      for (let booking of ride.tempBookings) {
        if (Date.now() > booking.expTime) {
          seatsToAdd += booking.seats; // Add back expired seats
          expiredBookingIds.push(booking._id); // Collect expired booking IDs
        }
      }
      if (expiredBookingIds.length > 0) {
        ride.seats += seatsToAdd;

        for (let i = ride.tempBookings.length - 1; i >= 0; i--) {
          if (expiredBookingIds.includes(ride.tempBookings[i]._id)) {
            ride.tempBookings.splice(i, 1);
          }
        }
      }
      // Save the updated ride document with new seats
      await ride.save();
    }
     else {
      return ride.date > currentDate;
    }
  });


  res.render("home/main.ejs", { Routes,MAPBOXKEY:process.env.MAPBOX_KEY });
};

// Add New Route
module.exports.addNew = async (req, res) => {
  try {
    let { route } = req.body;

    console.log("Received route data:", route); // Debugging log

    // Validate location selection
    if (!route.startCoords || !route.destinationCoords) {
      req.flash("error", "Please select both Start and Destination locations on the map!");
      return res.redirect("/route/addNew");
    }

    // Calculate distance
    const distance = calculateDistance(route.startCoords, route.destinationCoords);

    // Calculate earnings per seat
    const earningsPerSeat = distance * route.price;

    // Create and Save Route
    let sampleRoute = new Route({
      startLocation: route.startLocation,
      destinationLocation: route.destinationLocation,
      startCoords: route.startCoords,
      destinationCoords: route.destinationCoords,
      time: route.time,
      date: new Date(route.date),
      seats: route.seats,
      ownerPrice:route.ownerPrice,
      userPrice:route.userPrice,
      owner: req.user._id,
    });

    // Date validation (within 5 days)
    let currentDate = new Date();
    let maxDate = new Date();
    maxDate.setDate(currentDate.getDate() + 5);
    if (sampleRoute.date > maxDate) {
      req.flash("error", "Date should be within 5 days from today!");
      return res.redirect("/route/addNew");
    }

    // Adjust ride time
    sampleRoute.date.setMinutes(sampleRoute.date.getMinutes() + convertToMinutes(route.time));

    // Save route
    await sampleRoute.save();
    
    req.flash("success", `Route added successfully! Distance: ${distance.toFixed(2)} km. Earnings per seat: ₹${earningsPerSeat.toFixed(2)}`);
    res.redirect("/route");

  } catch (error) {
    console.error("Error adding new route:", error);
    req.flash("error", "Something went wrong. Please try again!");
    res.redirect("/route/addNew");
  }
};


// Render New Route Form
module.exports.renderNew = (req, res) => {
  let currentDate = new Date();
  let maxDate = new Date();
  maxDate.setDate(currentDate.getDate() + 5);
  res.render("home/addRoute.ejs", { maxDate ,MAPBOXKEY:process.env.MAPBOX_KEY});
};
//render edit form
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const ride = await Route.findById(id);
  if (!ride) {
    req.flash("error", "Listing not found ");
    res.redirect("/route");
  }
  res.render("home/editRoute.ejs", { ride });
};

// Edit Route
module.exports.editRoute = async (req, res) => {
  const { id } = req.params;
  const updatedRoute = await Route.findByIdAndUpdate(id, { ...req.body.route }, { new: true });

  // Recalculate earnings after edit
  if (updatedRoute.startCoords && updatedRoute.destinationCoords) {
    const distance = calculateDistance(updatedRoute.startCoords, updatedRoute.destinationCoords);
    updatedRoute.estimatedEarningsPerSeat = (distance * updatedRoute.price).toFixed(2);
  }

  updatedRoute.date.setMinutes(updatedRoute.date.getMinutes() + convertToMinutes(updatedRoute.time));
  await updatedRoute.save();

  req.flash("success", "Route updated successfully!");
  res.redirect(`/route`);
};

// Get My Rides
module.exports.myRides = async (req, res) => {
  const { id } = req.params;
  const Routes = await Route.find({ owner: id }).populate("owner");
  res.render("home/myRides.ejs", { Routes });
};

// Get Ride Details
module.exports.RideDetails = async (req, res) => {
  const { id } = req.params;
  const ride = await Route.findById(id).populate("bookings");
  res.render("home/rideDetails.ejs", { ride });
};

// Delete Route
module.exports.deleteRide = async (req, res) => {
  const { id } = req.params;
  const ride = await Route.findByIdAndDelete(id);
  await Booking.deleteMany({ _id: { $in: ride.bookings } });

  req.flash("success", "Route deleted successfully");
  res.redirect(`/route/${req.user._id}`);
};
