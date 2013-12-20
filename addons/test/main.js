var Events = require("../../EventManager");
var PacketManager = require("../../PacketManager");

exports.metadata =
{
    author      :   "Arkii",
    title       :   "Chat Thing",
    version     :   1.0,
    website     :   "yay"
};

// Register for events
Events.Register("CHAT_RECV", onChatRecive);
Events.Register("CHAT_SEND", onChatSend);

function onChatRecive(fromClient, connProxy, pck)
{
    if (fromClient)
        return;

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
