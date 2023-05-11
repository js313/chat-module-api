var express = require("express");
const routes = express();

const users = require("./users");
routes.use("/users", users.router);

const messages = require("./messages");
routes.use("/messages", messages.router);

const groups = require("./groups");
routes.use("/groups", groups.router);

const groups_members = require("./groups_members");
routes.use("/groups-members", groups_members.router);

const conversations = require("./conversations");
routes.use("/conversations", conversations.router);

const blocked_users = require("./blocked_users");
routes.use("/blocked-users", blocked_users.router);

module.exports = {
  module: {
    users,
    blocked_users,
    conversations,
    groups,
    groups_members,
    messages
  },
  routes,
};
