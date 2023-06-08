const handleSocketError = (socket, error) => {
  const errorCode = 500;
  const errorMessage = "Something went wrong!";
  socket.emit("error", { errorCode, errorMessage });
  console.log(error);
};
module.exports = { handleSocketError };
