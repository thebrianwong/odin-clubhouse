const bcrypt = require("bcrypt");

const hashPassword = async (rawPassword) => {
  const saltRounds = 12;
  const hashedPassword = bcrypt.hash(rawPassword, saltRounds);
  return hashedPassword;
};

module.exports = {
  hashPassword,
};
