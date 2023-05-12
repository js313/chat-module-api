const express = require("express");
const router = express.Router();
const controller = require("./controller");
const passport = require("../../middlewares/passport");

router.post("/login", controller.login);
router.post("/register", controller.register);

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  controller.findAll
);
router.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  controller.findByPk
);

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  controller.create
);

router.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  controller.update
);

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  controller.destroy
);
module.exports = router;
