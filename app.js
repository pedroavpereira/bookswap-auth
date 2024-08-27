const express = require("express");
const cors = require("cors");

const userRouter = require("./routes/user");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Auth Api microservice" });
});

app.use("/", userRouter);

module.exports = app;
