// Decode those packets!
// It' won't do many yet :/
var StarBuffer = require("./StarBuffer").Buffer;

var className = "[Packet Manager]";

// Packet map
var Packets = {};
exports.Packets = Packets;

// Packets ENUM
var E_Pcks =
{
    SEVER_VER               : 1,
    CHAT_RECV               : 5,
    UNIVERSE_TIME_UPDATE    : 6,
    CHAT_SEND               : 11
};
exports.E_Pcks = E_Pcks;

var Pck_StringNames = {};
for (var key in E_Pcks)
{
    Pck_StringNames[E_Pcks[key]] = key;
}

// Convert a packet id number into a string
exports.PckIdToString = function(id)
{
    return Pck_StringNames[id];
};
var PckIdToString = exports.PckIdToString;

// Read the packet id and then pass it of to be decoded
exports.DecodePacket = function(fromClient, packet)
{
    var id = 0;

    try
    {
        var buff = new StarBuffer(packet);
        id = buff.ReadUByte();

        if (id in Packets)
        {
            var pck = new Packets[id]();
            pck.Decode(buff);

            return {id:id, data:pck};
        }
        else
            return {isRaw:true, id:id, data:buff};
    }
    catch (e)
    {
        console.warn("[Packet Manager] Error decoding packet ID: " + id + " Error: " + e);
        return {isRaw:false, id:null, data:null};
    }
};

// The packets objects
//=================================================

// NOTE: All the stuff with the extra variable is a hack because I don't know much about these packets
// What it does is if their is more data than I know what to do with it will store it and send it with the know data
// Keeping me and the server/client happy
// packets are odd, sometimes they carry extra data than waht is jsut for that packet, maybe they batch some small packets?

// Server Version
Packets[E_Pcks.SEVER_VER] = function(buff)
{
    this.payload_size = 0; // 1 byte, = 4
    this.version = null; // 4 bytes
    this.extra = null;

    var self = this;
    this.Decode = function(buff)
    {
        self.payload_size = buff.ReadUByte();
        self.version = buff.ReadUInt();

        if (buff.GetOffset() < buff.buffer.length)
            this.extra = buff.ReadUByteArr(buff.buffer.length - buff.GetOffset());
    };

    this.Create = function(ver)
    {
        self.version = ver;
        self.payload_size = 8;
    };

    this.Send = function(socket)
    {
        var buffSize = (self.payload_size/2)+2;
        if (this.extra)
            buffSize += this.extra.length;

        var buff = new StarBuffer(new Buffer(buffSize));
        buff.WriteUByte(E_Pcks.SEVER_VER);
        buff.WriteUByte(self.payload_size);
        buff.WriteUInt(self.version);

        if (this.extra)
            buff.WriteUByteArray(this.extra);

        socket.write(buff.buffer);
    };

    if (buff)
        this.Decode(buff);
};

// Universe Time Update
Packets[E_Pcks.UNIVERSE_TIME_UPDATE] = function(buff)
{
    this.payload_size = 0; // 1 byte, = 4*2
    this.timeStamp = null; // 4 bytes

    this.extra = null;

    var self = this;
    this.Decode = function(buff)
    {
        self.payload_size = buff.ReadUByte();
        self.timeStamp = buff.ReadUInt();

        if (buff.GetOffset() < buff.buffer.length)
            this.extra = buff.ReadUByteArr(buff.buffer.length - buff.GetOffset());
    };

    this.Create = function(time)
    {
        self.timeStamp = time;
        self.payload_size = 8;
    };

    this.Send = function(socket)
    {
        var buffSize = (self.payload_size/2)+2;
        if (this.extra)
            buffSize += this.extra.length;

        var buff = new StarBuffer(new Buffer(buffSize));
        buff.WriteUByte(E_Pcks.UNIVERSE_TIME_UPDATE);
        buff.WriteUByte(self.payload_size);
        buff.WriteUInt(self.timeStamp);

        if (this.extra)
            buff.WriteUByteArray(this.extra);

        console.dir(buff.buffer);
        socket.write(buff.buffer);
    };

    if (buff)
        this.Decode(buff);
};

// Chat Receive
Packets[E_Pcks.CHAT_RECV] = function(buff)
{
    this.payload_size = 0; // 1 byte, = (nick_size + msg_size + 6[unknown] + 1[for the nickSize] +1[for the msg_size])*2
    this.unkown = null; // 6 bytes
    this.nick_size = 0; // 1 byte
    this.nick = null;
    this.msg_size = 0; // 1 byte
    this.msg = "";

    this.extra = null;

    var self = this;
    this.Decode = function(buff)
    {
        self.payload_size = buff.ReadUByte();
        self.unkown = buff.ReadUByteArr(6);
        self.nick_size = buff.ReadUByte();
        self.nick = buff.ReadString(self.nick_size);
        self.msg_size = buff.ReadUByte();
        self.msg = buff.ReadString(self.msg_size);
    };

    this.Create = function(nick, msg)
    {
        self.nick = nick;
        self.nick_size = nick.length;
        self.msg = msg;
        self.msg_size = msg.length;
        self.unkown = [1,0,0,0,0,1];
        self.payload_size = (self.msg_size  + self.nick_size +2 +6)*2;
    };

    this.Send = function(socket)
    {
        var buffSize = (self.payload_size/2)+2;
        if (this.extra)
            buffSize += this.extra.length;

        var buff = new StarBuffer(new Buffer(buffSize));
        buff.WriteUByte(E_Pcks.CHAT_RECV);
        buff.WriteUByte(self.payload_size);
        buff.WriteUByteArray(self.unkown);
        buff.WriteUByte(self.nick.length);
        buff.WriteString(self.nick);
        buff.WriteUByte(self.msg_size);
        buff.WriteString(self.msg);

        if (this.extra)
            buff.WriteUByteArray(this.extra);

        socket.write(buff.buffer);
    };

    if (buff)
        this.Decode(buff);
};

// Chat Send
Packets[E_Pcks.CHAT_SEND] = function(buff)
{
    this.payload_size = 0; // 1 byte, = ( msg_size + 1[for the msg_len] +1[for the term])*2
    this.msg_size = 0;
    this.msg = "";
    this.term = 0;

    this.extra = null;
    var self = this;
    this.Decode = function(buff)
    {
        self.payload_size = buff.ReadUByte();
        self.msg_size = buff.ReadUByte();
        self.msg = buff.ReadString(self.msg_size);
        self.term = buff.ReadUByte();

        if (buff.GetOffset() < buff.buffer.length)
            this.extra = buff.ReadUByteArr(buff.buffer.length - buff.GetOffset());
    };

    this.Create = function(msg)
    {
        self.msg = msg;
        self.msg_size = msg.length;
        self.msg = msg;
        self.term = 0;
        self.payload_size = (self.msg_size  + 2)*2;
    };

    this.Send = function(socket)
    {
        var buffSize = (self.payload_size/2)+2;
        if (this.extra)
            buffSize += this.extra.length;

        var buff = new StarBuffer(new Buffer(buffSize));
        buff.WriteUByte(E_Pcks.CHAT_SEND);
        buff.WriteUByte(self.payload_size);
        buff.WriteUByte(self.msg_size);
        buff.WriteString(self.msg);
        buff.WriteUByte(self.term);

        if (this.extra)
            buff.WriteUByteArray(this.extra);

        socket.write(buff.buffer);
    };

    if (buff)
        this.Decode(buff);
};