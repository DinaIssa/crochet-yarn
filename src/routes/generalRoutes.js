
const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    message: "Welcome to Yarn Craft API",
  });
});

router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Yarn Craft API is running",
  });
});

module.exports = router;
