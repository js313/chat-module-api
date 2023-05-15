const connectedUsers = new Map();

const addUserToStore = (userId, socketId) => {
  if (connectedUsers.has(userId)) {
    connectedUsers.get(userId).push(socketId);
  } else {
    connectedUsers.set(userId, [socketId]);
  }
  console.log(connectedUsers);
};

const removeUserFromStore = (userId, socketId) => {
  if (connectedUsers.has(userId)) {
    let socketIds = connectedUsers.get(userId);
    socketIds = socketIds.filter((sid) => {
      return sid !== socketId;
    });
    if (socketIds.length > 0) connectedUsers.set(userId, socketIds);
    else connectedUsers.delete(userId);
  }
  console.log(connectedUsers);
};

module.exports = { connectedUsers, addUserToStore, removeUserFromStore };
