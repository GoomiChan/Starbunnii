var PacketManager = require("./PacketManager");

var callbacks = {};

// import the packets and make them events
// the args for these are
// [bool] fromClient, [ConnectionProxy] connProxy, [packet] packet
// if fromClient is true then, well it's from the client, else it's from the server
// connProxy is the ConnectionProxy that the command came from
// Packet is your packet, each has different fields that you can see at the bottom of this file
for (key in PacketManager.E_Pcks)
    callbacks[key] = [];

exports.Register = function(eventName, callback)
{
    if (callbacks.hasOwnProperty(eventName))
        callbacks[eventName].push(callback);
    else
        console.warn("[EventManager] No event "+eventName);
};

exports.Emit = function(eventName)
{
    var args = Array.prototype.slice.call(arguments);
    args = args.slice(1);
    var sendOn = true;

    var cbs = callbacks[eventName];
    for (func in cbs)
    {
        var result = cbs[func].apply(this, args);

        if (result == false || (result && result.shouldSend == false)) // Don't send to the client/server
            sendOn = false;

        if (result && result.stopHere == true) // Abort here, don't inform any other listeners :<
        {
            return sendOn;
        }
    }

    return sendOn;
};

exports.AddEvent = function(eventName)
{
    if (!callbacks.hasOwnProperty(eventName))
    {
        callbacks[eventName] = [];
        console.log("[EventManager] Added event "+ eventName);
    }
    else
        console.warn("[EventManager] Event already exists.");
};

exports.GetEventsList = function()
{
    var eventsList = [];

    for (key in callbacks)
        eventsList.push(key);

    return eventsList;
};