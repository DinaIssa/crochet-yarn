
const express = require("express");

const {
  registerUser,
  loginUser,
} = require("../services/authService");

const {
  findUserById,
} = require("../repositories/userRepository");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

function validateCredentials(body, isRegister = false) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "Request body must be an object";
  }

  const allowedFields = isRegister
    ? ["name", "email", "password"]
    : ["email", "password"];

  if (Object.keys(body).some((key) => !allowedFields.includes(key))) {
    return "Request contains unsupported fields";
  }

  if (
    isRegister &&
    (typeof body.name !== "string" ||
      body.name.trim().length < 2 ||
      body.name.trim().length > 100)
  ) {
    return "Name must be between 2 and 100 characters";
  }

  if (
    typeof body.email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())
  ) {
    return "A valid email is required";
  }

  if (
    typeof body.password !== "string" ||
    body.password.length < 8
  ) {
    return "Password must be at least 8 characters";
  }

  return null;
}

// Register
router.post("/register", async (req, res) => {
  try {
    const validationError = validateCredentials(req.body, true);

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    const result = await registerUser(req.body);

    if (result.emailExists) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    return res.status(201).json({
      message: "Account created successfully",
      user: result.user,
    });
  } catch (error) {
    console.error(error.message);

    if (error.code === "23505") {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    return res.status(500).json({
      message: "Failed to create account",
    });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const validationError = validateCredentials(req.body);

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    const result = await loginUser(
      req.body.email,
      req.body.password
    );

    if (!result) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    return res.status(200).json({
      message: "Login successful",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    console.error(error.message);

    return res.status(500).json({
      message: "Failed to log in",
    });
  }
});

// Get current logged-in user
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await findUserById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const { password, ...safeUser } = user;

    return res.status(200).json({
      message: "User retrieved successfully",
      user: safeUser,
    });
  } catch (error) {
    console.error(error.message);

    return res.status(500).json({
      message: "Failed to retrieve user",
    });
  }
});

module.exports = router;
