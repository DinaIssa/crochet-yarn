
const yarnDb = require("../database/yarnDb");
const User = require("../entities/user");

const userRepository = yarnDb.getRepository(User);

async function findUserByEmail(email) {
  return await userRepository.findOneBy({ email });
}

async function findUserById(id) {
  return await userRepository.findOneBy({ id });
}

async function createUser(userData) {
  const user = userRepository.create(userData);
  return await userRepository.save(user);
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
};
