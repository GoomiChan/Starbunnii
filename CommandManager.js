// Like Event manager but for chat commands
// Makes life that little bit easier
var Events = require("./EventManager");

var commandChar = "/";
var callbacks = {};

Events.Register("CHAT_SEND", onChatSend);

exports.Register = function(eventName, callback)
{
    if (callbacks.hasOwnProperty(eventName))
        callbacks[eventName].push(callback);
    else
    {
        callbacks[eventName] = new Array();
        callbacks[eventName].push(callback);
    }
};

function onChatSend(fromClient, connProxy, pck)
{
    if (pck.msg.charAt(0) == commandChar)
    {
        var temp = pck.msg.indexOf(" ");
        var cmdName = "";
        if (temp == -1)
            cmdName = pck.msg.substr(1);
        else
            cmdName = pck.msg.substr(1, temp-1);

        var cmd = {};
        cmd.text = pck.msg.substr(pck.msg.indexOf(' ')+1);
        cmd.args = cmd.text.split(' ');
        Emit(cmdName, connProxy, cmd);

        return {shouldSend:false, stopHere:true};
    }
    else // Not a command carry on
    {
        return {shouldSend:true};
    }
}

function Emit(eventName)
{
    var args = Array.prototype.slice.call(arguments);
    args = args.slice(1);
    var sendOn = true;

    var cbs = callbacks[eventName];
    for (func in cbs)
    {
        var result = cbs[func].apply(this, args);

        if (result && result.stopHere == true) // Abort here, don't inform any other listeners :<
        {
            return;
        }
    }

    return;
};