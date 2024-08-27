const jwt = require("jsonwebtoken");
const User = require("../models/User");

const tokenAuthenticator = async (req, res, next) => {
  const token = req.get("Authorization");
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "This route requires authentication" });
  }

  jwt.verify(token, process.env.SECRET_TOKEN, async (err, data) => {
    if (err)
      return res.status(401).json({
        success: false,
        message: "Error in authentication",
      });

    req.user = await User.findById(data.user_id);
    next();
  });
};

module.exports = { tokenAuthenticator };
