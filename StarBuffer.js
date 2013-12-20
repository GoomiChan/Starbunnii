// A wrapper around nodes buffer to make writing and maybe reading packets easier

exports.Buffer = function(buff)
{
    this.buffer = buff;
    var offset = 0;

    // Write Funcs
    //===============================
    this.WriteUByte = function(byt)
    {
        this.buffer.writeUInt8(byt, offset);
        offset += 1;
    };

    this.WriteUByteArray = function(arr)
    {
        for (var i = 0; i < arr.length; i++)
            this.WriteUByte(arr[i]);
    };

    // Write the string into the buffer
    this.WriteString = function(str)
    {
        for (var i = 0; i < str.length; i++)
            this.WriteUByte(str.charCodeAt(i));
    };

    this.WriteUInt = function(val)
    {
        this.buffer.writeUInt32BE(val, offset);
        offset += 4;
    };

    // Read Funcs
    //=================================
    this.ReadUByte = function()
    {
        offset += 1;
        return this.buffer.readUInt8(offset-1);
    };

    this.ReadUByteArr = function(len)
    {
        var arr = [];
        for (var i = 0; i < len; i++)
            arr.push(this.ReadUByte());

        return arr;
    };

    this.ReadString = function(len)
    {
        var str = "";
        for (var i = 0; i < len; i++)
            str += String.fromCharCode(this.ReadUByte());

        return str;
    };

    this.ReadUInt = function()
    {
        offset += 4;
        return this.buffer.readUInt32BE(offset-4);
    };

    this.GetOffset = function()
    {
        return offset;
    };
};

