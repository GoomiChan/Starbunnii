var API = require("../../AddonAPI");

exports.metadata =
{
    author      :   "Arkii",
    title       :   "Chat Thing",
    version     :   1.0,
    website     :   "yay"
};

// Register for events
API.Events.Register("SEVER_VER", onServerVer);
API.Events.Register("UNIVERSE_TIME_UPDATE", onUniTimeUpdate);
API.Events.Register("CHAT_RECV", onChatRecive);
API.Events.Register("CHAT_SEND", onChatSend);

API.Commands.Register("spam", onSpam);

function onServerVer(fromClient, connProxy, pck)
{
    if (fromClient)
        console.log("fromClient");

    console.log("Version: " + pck.version);

    // Fake a server version
    //pck.version = 624;

    return {shouldSend:true};
}

function onUniTimeUpdate(fromClient, connProxy, pck)
{
    console.log("Time: " + pck.timeStamp);

    // Fake a server version
    //pck.timeStamp = 0;//2223476566

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

    var chatsend = new API.PacMan.Packets[API.E_Pcks.CHAT_SEND]();
    chatsend.Create("Yayifications! :D");
    chatsend.Send(connProxy.Server);
    return {shouldSend:true};
}

function onSpam(connProxy, cmd)
{
    var chatsend = new API.PacMan.Packets[API.E_Pcks.CHAT_SEND]();
    chatsend.Create("Yayifications! :D");

    for (var i = 0; i < 500; i++)
        chatsend.Send(connProxy.Server);

    return {shouldSend:true};
}
