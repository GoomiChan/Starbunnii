var net = require('net');
var ModuleManager = require("./ModuleManager");
var ConnectionProxy = require("./ConnectionProxy").ConnectionProxy;
var EventManager = require("./EventManager");
var CommandManager = require("./CommandManager");

var clients = [];

function Init()
{
    console.log("-===== Starbunii =====-");
    EventManager.AddEvent("Raw_Packet");

    CommandManager.Register("yay", function(){console.log("yay");});

    ModuleManager.Load();
    Start();
}

var Start = function()
{
    net.createServer(function (socket)
    {
        socket.name = socket.remoteAddress + ":" + socket.remotePort;
        var conn = new ConnectionProxy(socket, function() // remove function
        {
            clients.splice(clients.indexOf(conn), 1);
            console.log('Client disconnected');
        });
        clients.push(conn);
    }).listen(7000);



    console.log("[Starbunii] Ready :D");
};

Init();
