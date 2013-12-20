// Load and handle modules
var fs = require('fs');

var addons = [];

exports.Load = function(callback)
{
    var addonsDirs = [];
    var files = fs.readdirSync("./addons");
    for (var file in files)
    {
        var f = files[file];
        if (fs.statSync("./addons/"+f).isDirectory())
            addonsDirs.push(f);
    }

    // Now load them
    for (var d in addonsDirs)
    {
        var dir = addonsDirs[d];
        var addon = require("./addons/"+dir+"/main.js");
        ValidateMetaData(dir, addon.metadata);
        addons.push(addon);

        console.log("[Addon Manager] Loaded addon "+ addon.metadata.title+ " from "+ dir);
    }
};

function ValidateMetaData(dirName, meta)
{
    var isValid = true;

    if (!meta.author)
    {
        isValid = false;
        console.warn("[Addon Manager] "+ dirName + " Error with author field in metadata D:");
    }
    if (!meta.title)
    {
        isValid = false;
        console.warn("[Addon Manager] "+ dirName + " Error with title field in metadata D:");
    }
    if (!meta.version)
    {
        isValid = false;
        console.warn("[Addon Manager] "+ dirName + " Error with version field in metadata D:");
    }
    if (!meta.website)
    {
        isValid = false;
        console.warn("[Addon Manager] "+ dirName + " Error with website field in metadata D:");
    }

    return isValid;
}