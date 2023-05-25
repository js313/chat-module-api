const broadcastToConversation = async (socket, io, data, temp) => {
  try {
    const emitToOtherSockets = [];
    emitToOtherSockets.forEach((socketId) => {
      io.to(socketId).emit(temp, data);
    });
  } catch (error) {
    console.log(error);
  }
};
