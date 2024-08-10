const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = expressAsyncHandler(async (req, res, next) => {
  try {
    let token = "";

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        res.status(401);
        throw new Error("Invalid User");
      }

      req.user = user;
      next();
    } else {
      res.status(401);
      throw new Error("UnAuthorised Access : No Token Found");
    }
  } catch (error) {
    res.status(401);
    throw new Error("UnAuthorised Access : No Token Found");
  }
});

module.exports = protect;
