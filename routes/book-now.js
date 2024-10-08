const express = require("express");
const wrapasync = require("../utils/wrapasync");
const router = express.Router({ mergeParams: true });
const passport = require("passport");
const { saveUrl, isLoggedIn } = require("../middleware");

const bookNowController = require("../controllers/book-now");

router
  .route("/")
  .get(isLoggedIn,saveUrl, wrapasync(bookNowController.renderBookNow))
  .post(isLoggedIn,saveUrl, wrapasync(bookNowController.conformBooking));
router.route('/conform').post(bookNowController.booking)

router.route('/delete/:bookingId').get(wrapasync(bookNowController.deleteBooking))

module.exports = router;
