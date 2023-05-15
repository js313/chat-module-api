const jwt = require("jsonwebtoken");

const verifySocketToken = (socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.auth;
  if (!token) {
    return next(new Error("Authentication error"));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    socket.user = decoded;
  } catch (error) {
    console.log(error);
    return next(new Error("Authentication error"));
  }
  next();
};

module.exports = verifySocketToken;
