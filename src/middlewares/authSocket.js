const jwt = require("jsonwebtoken");
const { Users } = require("../config/db");

const verifySocketToken = (socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.auth;
  if (!token) {
    return next(new Error("Authentication error"));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const { id, email } = decoded;
    if (!id || !email) {
      return next(new Error("Authentication error"));
    }
    const user = Users.findOne({ where: { id, email } });
    if (!user) {
      return next(new Error("Authentication error"));
    }
    socket.user = decoded;
  } catch (error) {
    console.log(error);
    return next(new Error("Authentication error"));
  }
  next();
};

module.exports = verifySocketToken;
