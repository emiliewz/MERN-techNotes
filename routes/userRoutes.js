const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");

// This will match "./users"
// Since we are already at "./users", so this is just the root of that ("/")
router
  .route("/")
  // read
  .get(usersController.getAllUsers)
  // create
  .post(usersController.createNewUser)
  // update
  .patch(usersController.updateUser)
  // delete
  .delete(usersController.deleteUser);

module.exports = router;
