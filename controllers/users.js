const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Users = require("../models/User");

const MONTH_IN_MS = 2592000000;

const login = async (req, res) => {
  try {
    const data = req.body;

    const user = await Users.findByEmail(data.email);

    const match = await bcrypt.compare(data.password, user.password);

    if (!match) throw new Error("Unable to authenticate");

    jwt.sign(
      { user_id: user.user_id },
      process.env.SECRET_TOKEN,
      {
        expiresIn: MONTH_IN_MS,
      },
      (err, data) => {
        if (err) {
          res
            .status(500)
            .json({ success: false, error: "Error generating token" });
        } else {
          res.status(200).json({
            success: true,
            token: data,
            user: {
              user_id: user.user_id,
              email: user.email,
              first_name: user.first_name,
              last_name: user.last_name,
              lat: user.lat,
              lng: user.lng,
            },
          });
        }
      }
    );
  } catch (err) {
    res.status(403).json({ success: false, error: err.message });
  }
};

const signup = async (req, res) => {
  const data = req.body;
  console.log("signup");
  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS));
    data.password = await bcrypt.hash(data.password, salt);

    const newUser = await Users.create(data);

    jwt.sign(
      { user_id: newUser.user_id },
      process.env.SECRET_TOKEN,
      {
        expiresIn: MONTH_IN_MS,
      },
      (err, data) => {
        if (err) {
          res
            .status(500)
            .json({ success: false, error: "Error generating token" });
        } else {
          res.status(200).json({
            success: true,
            token: data,
            user: {
              user_id: newUser.user_id,
              email: newUser.email,
              first_name: newUser.first_name,
              last_name: newUser.last_name,
              lat: newUser.lat,
              lng: newUser.lng,
            },
          });
        }
      }
    );
  } catch (err) {
    res.status(500).send({ success: false, error: err.message });
  }
};

const verifyToken = (req, res) => {
  if (req.user) {
    const user = {
      user_id: req.user.user_id,
      email: req.user.email,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      lat: req.user.lat,
      lng: req.user.lng,
    };
    res.status(200).json({ success: true, user });
  } else {
    res
      .status(401)
      .json({ success: false, message: "This route requires authentication" });
  }
};

const restrictTo = (req, res) => {
  try {
    const allowedRoles = req.body.allowedRoles;

    if (!allowedRoles.includes(req.user.role))
      throw new Error("Not Authorized");

    const user = {
      user_id: req.user.user_id,
      email: req.user.email,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      lat: req.user.lat,
      lng: req.user.lng,
    };

    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(401).json({ success: false, error: err.message });
  }
};

module.exports = { login, signup, verifyToken, restrictTo };
