const { required, string } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Booking = require("./bookings")

const routeSchema = new mongoose.Schema(
  {
    startLocation: {
      type: String,
      required: true,
      trim: true,
    },
    destinationLocation: {
      type: String,
      required: true,
      trim: true,
    },
    time: {
      type: String, // You can use Date type if you're working with a full date-time.
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    seats: {
      type: Number,
      required: true,
    },
    price:{
      type: Number,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    bookings: [
      {
        type: Schema.Types.ObjectId,
        ref: "Booking",
      },
    ],
    tempBookings:[{
        seats:{
          type: Number
        },
        expTime: {
          type:Date
        }
    }]
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

routeSchema.post("findOneAndDelete", async(route)=>{
    if(route){
      await Booking.deleteMany({_id: {$in:route.bookings}})
    }
  })


// Model creation
const Route = mongoose.model("Route", routeSchema);

module.exports = Route;
