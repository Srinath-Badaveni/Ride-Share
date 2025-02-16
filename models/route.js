const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Booking = require("./bookings");

const routeSchema = new mongoose.Schema(
  {
    startLocation: { type: String, required: true, trim: true, default: "Unknown" },
    destinationLocation: { type: String, required: true, trim: true, default: "Unknown" },
    startCoords: { type: String, required: true, trim: true, default: "0,0" }, // Prevent missing coordinates
    destinationCoords: { type: String, required: true, trim: true, default: "0,0" },
    time: { type: String, required: true },
    date: { type: Date, required: true },
    seats: { type: Number, required: true, min: 1, default: 1 }, // Ensure a valid seat count
    ownerPrice:{type:Number,required:true,min:1,default:1},
    userPrice:{type:Number,required:true,min:1,default:1},// Prevent validation errors
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    bookings: [{ type: Schema.Types.ObjectId, ref: "Booking" }],
    tempBookings: [
      {
        userMail: { type: String },
        seats: { type: Number },
        expTime: { type: Date },
      },
    ],
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

// Middleware to delete bookings when a route is removed
routeSchema.post("findOneAndDelete", async (route) => {
  if (route) {
    await Booking.deleteMany({ _id: { $in: route.bookings } });
  }
});

// Model creation
const Route = mongoose.model("Route", routeSchema);

module.exports = Route;
