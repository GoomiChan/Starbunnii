// This sits between the user and the server
var net = require('net');
var PacketManager = require("./PacketManager");
var EventManager = require("./EventManager");

exports.ConnectionProxy =  function(client, removeCallback)
{
    this.Client = client;
    this.Server = null;

    var self = this;

    this.Server = net.connect({port: 21025},
        function()
        {
            console.log('Client connected from: ' + self.Client.remoteAddress + ":" + self.Client.remotePort);
        });

    this.Server.on('data', function(data)
    {
        var pck = PacketManager.DecodePacket(false, data);

        if (pck.isRaw)
        {
            if (EventManager.Emit("Raw_Packet", false, self, pck.data))
                self.Client.write(data);
        }
        else
        {
            if (EventManager.Emit(PacketManager.PckIdToString(pck.id), false, self, pck.data))
            {
                if (pck.data)
                    pck.data.Send(self.Client);
                else
                    self.Client.write(data);
            }
        }
    });

    this.Server.on('end', function()
    {
        End();
        self.Client.destroy();
    });

    this.Server.on('close', function()
    {
        End();
        self.Client.destroy();
    });

    this.Server.on('error', function(err)
    {
        console.warn(err);
    });

    this.Client.on('data', function (data)
    {
        var pck = PacketManager.DecodePacket(true, data);

        if (pck.isRaw)
        {
            if (EventManager.Emit("Raw_Packet", true, self, pck.data))
                self.Server.write(data);
        }
        else
        {
            console.log("ID: "+pck.id);
            if (EventManager.Emit(PacketManager.PckIdToString(pck.id), true, self, pck.data))
            {
                if (pck.data)
                    pck.data.Send(self.Server);
                else
                    self.Server.write(data);
            }
        }
    });

    this.Client.on('end', function ()
    {
        End();
        self.Server.destroy();
    });

    this.Client.on('close', function ()
    {
        End();
        self.Server.destroy();
    });

    this.Client.on('error', function(err)
    {
        console.warn(err);
    });

    function End()
    {
        removeCallback();
    }
};