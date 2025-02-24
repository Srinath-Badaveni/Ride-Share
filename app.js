const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const Route = require("./models/route");
const User = require("./models/user");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const ExpressError = require("./utils/expressError.js");

const route = require("./routes/route.js");
const bookNow = require("./routes/book-now.js");
const user = require("./routes/user.js");
const { saveUrl, calculateDistance } = require("./middleware.js");
const { log } = require("console");

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.json()); // Needed for parsing JSON body
app.use(express.urlencoded({ extended: true })); // Needed for form data

const dbUrl = process.env.ATLASDB_URL;
main()
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("mongo session store error", err);
});

const sessionOpts = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    max: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOpts));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

app.get("/", (req, res) => {
  res.render("home/root.ejs");
});

app.get("/bookings", async (req, res) => {
  const rides = await Route.find().populate("bookings");
  const myBookings = [];
  const bookingId = [];
  rides.forEach((element) => {
    for (ride of element.bookings) {
      if (ride.email === req.user.email) {
        myBookings.push(element);
        bookingId.push(ride._id);
      }
    }
  });
  console.log(bookingId);
  res.render("home/bookings.ejs", { myBookings, bookingId });
});

app.post("/search", async (req, res) => {
  try {
    console.log("🚀 Backend search request received");

    const { startCoords, destinationCoords } = req.body;
    if (!startCoords || !destinationCoords) {
      return res.status(400).json({ error: "Missing required parameters!" });
    }

    const [lat, lng] = startCoords.split(",").map(Number);
    let rides = await Route.find({});

    console.log("🔍 Total rides found before filtering:", rides.length);

    // Filter rides within 10km radius
    Routes = rides.filter((ride) => {
      if (!ride.startCoords) return false;
      const rideCoords = ride.startCoords.split(",").map(Number);
      console.log(rideCoords)
      console.log([lat,lng])
      const distance = calculateDistance([lat, lng], rideCoords);
      return distance <= 10; // Keep only rides within 10km radius
    });

    console.log(`✅ Found ${Routes.length} rides within 10km radius.`);
    console.log(Routes)
    res.render('home/main',{Routes,MAPBOXKEY:process.env.MAPBOX_KEY }); // ✅ Send JSON instead of rendering
  } catch (error) {
    console.error("❌ Error searching rides:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.use("/route", route);
app.use("/book-now/:id", bookNow);
app.use("/user", user);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

app.use((err, req, res, next) => {
  console.log(err);
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080, () => {
  console.log("connected to 8080");
});
