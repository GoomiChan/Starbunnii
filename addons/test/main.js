var Events = require("../../EventManager");
var PacketManager = require("../../PacketManager");
var CommandManager = require("../../CommandManager");

exports.metadata =
{
    author      :   "Arkii",
    title       :   "Chat Thing",
    version     :   1.0,
    website     :   "yay"
};

// Register for events
Events.Register("SEVER_VER", onServerVer);
Events.Register("CHAT_RECV", onChatRecive);
Events.Register("CHAT_SEND", onChatSend);

CommandManager.Register("spam", onSpam);

function onServerVer(fromClient, connProxy, pck)
{
    console.log("Version: " + pck.version);

    // Fake a server version
    //pck.version = 624;

    return {shouldSend:true};
}

function onChatRecive(fromClient, connProxy, pck)
{
    if (fromClient)
        return {shouldSend:true};

    console.log(pck.nick + ": "+pck.msg);

    return {shouldSend:true};
}

function onChatSend(fromClient, connProxy, pck)
{
    console.log("Got chat send :D");
    console.log("Msg: "+pck.msg);

    var chatsend = new PacketManager.Packets[PacketManager.E_Pcks.CHAT_SEND]();
    chatsend.Create("Yayifications! :D");
    chatsend.Send(connProxy.Server);
    return {shouldSend:true};
}

function onSpam(connProxy, cmd)
{
    var chatsend = new PacketManager.Packets[PacketManager.E_Pcks.CHAT_SEND]();
    chatsend.Create("Yayifications! :D");

    for (var i = 0; i < 500; i++)
        chatsend.Send(connProxy.Server);

    return {shouldSend:true};
}
