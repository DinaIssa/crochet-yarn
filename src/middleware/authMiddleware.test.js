
process.env.JWT_SECRET = "jest-test-secret";

const jwt = require("jsonwebtoken");
const authMiddleware = require("./authMiddleware");

function createResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

describe("Auth Middleware", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { headers: {} };
    res = createResponse();
    next = jest.fn();
  });

  test("should reject a request without a token", () => {
    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("should reject an invalid token", () => {
    req.headers.authorization = "Bearer invalid-token";

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("should allow a request with a valid token", () => {
    const token = jwt.sign(
      { userId: 1 },
      process.env.JWT_SECRET
    );

    req.headers.authorization = `Bearer ${token}`;

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user.userId).toBe(1);
  });
});
