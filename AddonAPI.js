// This just defines the API for the addons to use
exports.Events = require("./EventManager");
exports.PacMan = require("./PacketManager");
exports.Commands = require("./CommandManager");

exports.E_Pcks = exports.PacMan.E_Pcks;