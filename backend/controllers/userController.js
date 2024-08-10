const expressAsyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const registerUser = expressAsyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Make Sure All Filelds Are Coming
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Fill All Details!");
  }

  // Check If User Already Exist
  const userExist = await User.findOne({ email: email });

  if (userExist) {
    res.status(400);
    throw new Error("User Already Exists");
  }

  // Hash Password
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  // Create User

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  if (!user) {
    res.status(401);
    throw new Error("User Cannot Be Registered");
  }

  res.status(201).json({
    id: user._id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id),
  });
});

const loginUser = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Make Sure All Filelds Are Coming
  if (!email || !password) {
    res.status(400);
    throw new Error("Please Fill All Details!");
  }

  const user = await User.findOne({ email });

  if (user && bcrypt.compareSync(password, user.password)) {
    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid Credentials");
  }
});

// Private Controller

const privateController = expressAsyncHandler(async (req, res) => {
  res.json({
    msg: "I am Private Route",
  });
});

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

module.exports = { registerUser, loginUser, privateController };
