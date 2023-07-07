const User = require("../models/User");
const Note = require("../models/Note");
// keep us from using so many try catch blocks as we use async functions with Mongoose to CRUD data
const asyncHandler = require("express-async-handler");
// hash the password before we save it
const bcrypt = require("bcrypt");

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
  // wrap asyncHandler around the async function
  // use select to set not return the password with the rest of the user data, use lean to tell mongoose just basically give the data like json, insetad of whole object, No need to chain exec() function since we do not pass sth in, just read the data, without need a promise back
  const users = await User.find().select("-password").lean();
  //   const users = await User.find().lean();

  // use an optional chain "?.length" to avoid return an empty array
  if (!users?.length) {
    // if no users found then return a response, which status set to be 400, and chain a json, saying "no users found". return statement helps end the function, avoiding unnecessary problems
    return res.status(400).json({ message: "No users found" });
  }
  // can use (if ...) else ..., but we already return before, so do not need a else statement
  res.json(users);
});

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = asyncHandler(async (req, res) => {
  // wrap asyncHandler around the async function
  const { username, password, roles } = req.body;

  // Confirm data
  // Make sure having username, password, and roles is an array and not empty
  if (!username || !password || !Array.isArray(roles) || !roles.length) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check for duplicate
  // Chain exec() function if we want to pass sth in mongoose
  const duplicate = await User.findOne({ username }).lean().exec();

  // if find a duplicate
  if (duplicate) {
    // 409 stands for conflict
    return res.status(409).json({ message: "Duplicate username" });
  }

  // Hash password
  const hashedPwd = await bcrypt.hash(password, 10); // set 10 salt rounds

  // const userObject = { username, "password": hashedPwd, roles };
  const userObject = { username, password: hashedPwd, roles };

  // Create and store new user
  const user = await User.create(userObject);

  // if user was created
  if (user) {
    // not use a return because we already at the end
    res.status(201).json({ message: `New user ${username} created` });
  } else {
    res.status(400).json({ message: `Invalid user data received` });
  }
});

// @desc Update a user
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {
  // wrap asyncHandler around the async function
  const { id, username, roles, active, password } = req.body;

  // Confirm data
  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== "boolean"
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // use exec() because we pass in a value here and do need to receive a promise, we not use lean() here because we want to get a mongoose document that does have "save" and the other methods attached to it
  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Check for duplicate
  // use lean() as we do not need method return a mongoose doucument, chain exec() function if we want to pass sth in mongoose
  const duplicate = await User.findOne({ username }).lean().exec();

  // Allow updates to the original user
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate username" });
  }

  // since it is a mongoose document, if we try to set a property that didn't exist in our model, it would reject it. So we can do this with properties already exist in our model
  user.username = username;
  user.roles = roles;
  user.active = active;

  // we do not always update password everytime the user wants to update sth else, so check if user provide a password, then we update; if not, do not update password
  if (password) {
    // Hash password
    user.password = await bcrypt.hash(password, 10); // 10 salt rounds
  }

  // Update new user using save(), and if there is an error, then it will be catched by the async handler even though we not use a try catch
  const updatedUser = await user.save();

  res.json({ message: `${updatedUser.username} updated` });
});

// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
  // wrap asyncHandler around the async function
  const { id } = req.body; // destructure the id from the request body

  // check if there is a id
  if (!id) {
    // if id not exist, set status as 400, standing for a bad request
    return res.status(400).json({ message: "User ID Required" });
  }

  // use Notes model, because we do not want to delete a user with notes assigned
  const note = await Note.findOne({ user: id }).lean().exec();

  // use optional chain to check if note exists or null
  if (note) {
    // 400 for bad request, set json message to help our users
    return res.status(400).json({ message: "User has assigned notes" });
  }

  // find the user, call exec() after that, because we do need those other functions, and we are going to actually delete() instead of save()
  const user = await User.findById(id).exec();

  // if there is no user, return a response with a message
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // result will hold a full user object information that is deleted
  const result = await user.deleteOne();

  const reply = `Username ${result.username} with ID ${result._id} deleted`;

  res.json(reply);
});

module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
};
