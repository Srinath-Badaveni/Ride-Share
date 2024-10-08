const express = require("express");
const wrapasync = require("../utils/wrapasync");
const router = express.Router({ mergeParams: true });
const passport = require("passport");
const { saveUrl, isLoggedIn } = require("../middleware");

const routeController = require("../controllers/route");

router
  .route("/")
  .get(wrapasync(routeController.index))
  .post(isLoggedIn, wrapasync(routeController.addNew));

router.route("/addNew").get(isLoggedIn, routeController.renderNew);

router
  .route("/edit/:id")
  .get(isLoggedIn, wrapasync(routeController.renderEditForm))
  .put(isLoggedIn, wrapasync(routeController.editRoute));

router.route('/:id').get(isLoggedIn,wrapasync(routeController.myRides))

router.route('/details/:id').get(wrapasync(routeController.RideDetails))

router.route('/delete/:id').get(wrapasync(routeController.deleteRide))


module.exports = router;
