const bcrypt = require("bcrypt");
const LocalStrategy = require("passport-local");
const User = require("../models/user.model");

const hashPassword = async (rawPassword) => {
  const saltRounds = 12;
  const hashedPassword = bcrypt.hash(rawPassword, saltRounds);
  return hashedPassword;
};

const authenticateLogInCredentials = new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await User.findOne({ username }).exec();
      if (!user) {
        console.log("Failed log in: invalid username");
        return done(null, false, {
          message: "Invalid credentials",
        });
      }
      const correctCredentials = await bcrypt.compare(password, user.password);
      if (correctCredentials) {
        console.log("Successful log in");
        return done(null, user);
      }
      console.log("Failed log in: invalid password");
      return done(null, false, { message: "Invalid credentials" });
    } catch (err) {
      return done(err);
    }
  }
);

const saveUserId = (user, done) => {
  done(null, user._id);
};

const getUserFromId = async (id, done) => {
  try {
    const user = await User.findById(id).exec();
    done(null, user);
  } catch (err) {
    done(err);
  }
};

module.exports = {
  hashPassword,
  authenticateLogInCredentials,
  saveUserId,
  getUserFromId,
};
