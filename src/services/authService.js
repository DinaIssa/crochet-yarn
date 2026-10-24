
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const {
  findUserByEmail,
  createUser,
} = require("../repositories/userRepository");

async function registerUser(userData) {
  const email = userData.email.trim().toLowerCase();

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    return { emailExists: true };
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);

  const user = await createUser({
    name: userData.name.trim(),
    email,
    password: hashedPassword,
    role: "customer",
  });

  const { password, ...safeUser } = user;

  return { user: safeUser };
}

async function loginUser(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.password
  );

  if (!passwordMatches) {
    return null;
  }

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  const { password: hiddenPassword, ...safeUser } = user;

  return {
    token,
    user: safeUser,
  };
}

module.exports = {
  registerUser,
  loginUser,
};
