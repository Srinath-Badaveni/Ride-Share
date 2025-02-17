const express = require("express");
const wrapasync = require("../utils/wrapasync");
const router = express.Router({ mergeParams: true });
const passport = require("passport");
const { saveUrl, isLoggedIn, checkExpiration } = require("../middleware");

const bookNowController = require("../controllers/book-now");

router
  .route("/")
  .get(checkExpiration,isLoggedIn,saveUrl, wrapasync(bookNowController.renderBookNow))
  .post(checkExpiration,isLoggedIn,saveUrl, wrapasync(bookNowController.conformBooking));
router.route('/confirm').post(bookNowController.booking)

router.route('/delete/:bookingId').get(wrapasync(bookNowController.deleteBooking))

module.exports = router;
