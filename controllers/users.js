const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Users = require("../models/User");

const login = async (req, res) => {
  try {
    const data = req.body;

    const user = await Users.findByUsername(data.username);

    const match = await bcrypt.compare(data.password, user.password);

    if (!match) throw new Error("Unable to authenticate");

    jwt.sign(
      { username: user.username },
      process.env.SECRET_TOKEN,
      {
        expiresIn: 3600,
      },
      (err, data) => {
        if (err) {
          res
            .status(500)
            .json({ success: false, error: "Error generating token" });
        } else {
          res.status(200).json({ success: true, data: { token: data } });
        }
      }
    );
  } catch (err) {
    res.status(403).json({ success: false, error: err.message });
  }
};

const signup = async (req, res) => {
  console.log("signup");
  const data = req.body;
  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS));
    data.password = await bcrypt.hash(data.password, salt);

    const newUser = await Users.create(data);

    jwt.sign(
      { username: newUser.username },
      process.env.SECRET_TOKEN,
      {
        expiresIn: 3600,
      },
      (err, data) => {
        if (err) {
          res
            .status(500)
            .json({ success: false, error: "Error generating token" });
        } else {
          res.status(200).json({ success: true, data: { token: data } });
        }
      }
    );
  } catch (err) {
    res.status(404).send({ success: false, error: err });
  }
};

const verifyToken = (req, res) => {
  if (!req.user) {
    res
      .status(401)
      .json({ success: false, message: "This route requires authentication" });
  } else {
    res.status(200).json({ success: true, user_id: req.user.id });
  }
};

const restrictTo = (req, res) => {
  try {
    const allowedRoles = req.body.allowedRoles;

    if (!allowedRoles.contains(req.user.role))
      throw new Error("Not Authorized");

    res
      .status(200)
      .json({ success: true, user_id: req.user.id, role: req.user.role });
  } catch (err) {
    res.status(401).json({ success: false, error: err.message });
  }
};

module.exports = { login, signup, verifyToken, restrictTo };
