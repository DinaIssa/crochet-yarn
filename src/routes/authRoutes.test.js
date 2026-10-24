
jest.mock("../services/authService", () => ({
  registerUser: jest.fn(),
  loginUser: jest.fn(),
}));

jest.mock("../repositories/userRepository", () => ({
  findUserById: jest.fn(),
}));

jest.mock("../middleware/authMiddleware", () =>
  (req, res, next) => next()
);

const express = require("express");
const request = require("supertest");

const {
  registerUser,
  loginUser,
} = require("../services/authService");

const { findUserById } = require("../repositories/userRepository");
const authRoutes = require("./authRoutes");

const app = express();
app.use(express.json());
app.use("/auth", authRoutes);

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Auth Routes Validation", () => {
  test("should reject a short name during registration", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({
        name: "A",
        email: "dina@example.com",
        password: "password123",
      });

    expect(response.status).toBe(400);
    expect(registerUser).not.toHaveBeenCalled();
  });

  test("should reject an invalid email during registration", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({
        name: "Dina",
        email: "invalid-email",
        password: "password123",
      });

    expect(response.status).toBe(400);
    expect(registerUser).not.toHaveBeenCalled();
  });

  test("should reject a short password during login", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        email: "dina@example.com",
        password: "123",
      });

    expect(response.status).toBe(400);
    expect(loginUser).not.toHaveBeenCalled();
  });

  test("should reject unsupported fields during login", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        email: "dina@example.com",
        password: "password123",
        role: "admin",
      });

    expect(response.status).toBe(400);
    expect(loginUser).not.toHaveBeenCalled();
  });
});
