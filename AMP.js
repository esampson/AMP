/*A.M.P.
Advanced Mapping Procedurals

The MIT License (MIT)

Copyright (c) 2014 esampson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.*/

(function() {
    oldCreateObj = createObj;
    createObj = function() {
        obj = oldCreateObj.apply(this, arguments);
        if (obj.get("_type") == 'attribute') obj.fbpath = '/char-attribs/char/'+ obj.get("_characterid") +'/'+ obj.get("_id");
        if (obj.get("_type") == 'character') obj.fbpath = obj.changed._fbpath.replace(/([^\/]*\/){4}/, "/");
        return obj;
    }
}())

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function rotatePath(Path, Rotation, scaleX, scaleY, PosX, PosY){
    result = [];
    newPath = [];
    check = IsJsonString(Path);
    if (check) oldPath = JSON.parse(Path);
    if (check == false) oldPath = Path;
    oldMaxX = 0;
    oldMaxY = 0;
    rads = 3.1415927 * Rotation / 180;
    for( oP = 0; oP < oldPath.length; oP++ )
    {
        for (x = 0; x < (oldPath[oP].length-1)/2; x++) 
        {
            if (oldPath[oP][x*2+1] > oldMaxX) oldMaxX = oldPath[oP][x*2+1];
            if (oldPath[oP][x*2+2] > oldMaxY) oldMaxY = oldPath[oP][x*2+2];
        }
    }
    for( oP = 0; oP < oldPath.length; oP++ )
    {
        temp = [];
        temp[0] = oldPath[oP][0];
        for (x = 0; x < (oldPath[oP].length-1)/2; x++) 
        {
            temp[x*2+1]=Math.cos(rads) * (oldPath[oP][x*2+1] - oldMaxX / 2) * scaleX + Math.sin(rads) * (oldPath[oP][x*2+2] - oldMaxY / 2) * scaleY;
            temp[x*2+2]=Math.cos(rads) * (oldPath[oP][x*2+2] - oldMaxY / 2) * scaleY - Math.sin(rads) * (oldPath[oP][x*2+1] - oldMaxX / 2) * scaleX;
        }
        newPath[oP] = temp;
    }
    newMaxX = 0;
    newMaxY = 0;
    newMinX = newPath[0][1];
    newMinY = newPath[0][2];
    for( nP = 0; nP < newPath.length; nP++ )
    {
        for (x = 0; x < (newPath[nP].length-1)/2; x++) 
        {
            if (newPath[nP][x*2+1] > newMaxX) newMaxX = newPath[nP][x*2+1];
            if (newPath[nP][x*2+2] > newMaxY) newMaxY = newPath[nP][x*2+2];
            if (newPath[nP][x*2+1] < newMinX) newMinX = newPath[nP][x*2+1];
            if (newPath[nP][x*2+2] < newMinY) newMinY = newPath[nP][x*2+2];
        }
    }
    for( nP = 0; nP < newPath.length; nP++ )
    {
        for (x = 0; x < (newPath[nP].length-1)/2; x++) 
        {
            newPath[nP][x*2+1] = newPath[nP][x*2+1] - newMinX;
            newPath[nP][x*2+2] = newPath[nP][x*2+2] - newMinY;
        }
    }
    Pos = [PosX+(newMaxX+newMinX)/2, PosY+(newMaxY+newMinY)/2];
    Dims = [newMaxX - newMinX, newMaxY - newMinY];
    jPath = JSON.stringify(newPath);
    result[0] = jPath;
    result[1] = Pos;
    result[2] = Dims;
    return result;
}

on("chat:message", function(msg) {
    if (msg.content.substring(0,18) == "!Create Conversion")
    {
        baseName = msg.content.substr(19);
        sendChat(msg.who,"Attempting to create conversion");
        page = Campaign().get("playerpageid");
        Data = [];
        dIndex = 0;
        Base = findObjs({
            _type: "graphic",
            _pageid: page,
            name: baseName
        });
        if (Base.length == 1)
        {
            dObject = Base[0];
            Data[dIndex] = JSON.stringify(dObject);
			dIndex++;
            graphics = findObjs({
                _type: "graphic",
                _pageid: page
            });
            for ( i = 0; i < graphics.length; i++ )
            {
                if (graphics[i].get("name") !== baseName) 
                {
                    dObject = graphics[i];
                    Data[dIndex] = JSON.stringify(dObject);
                    dIndex++;
                }
            }
            paths = findObjs({
                _type: "path",
                _pageid: page
            });
            for ( i = 0; i < paths.length; i++ )
            {
                cPath=rotatePath(paths[i].get("_path"),0-paths[i].get("rotation"),paths[i].get("scaleX"),paths[i].get("scaleY"),paths[i].get("left"),
                    paths[i].get("top"));
                dObject = paths[i];
                dObject["rotation"] = 0;
                dObject["width"] = cPath[2][0];
                dObject["height"] = cPath[2][1];
                dObject["top"] = cPath[1][1];
                dObject["left"] = cPath[1][0];
                dObject["scaleX"] = 1;
                dObject["scaleY"] = 1;
                dObject["_path"] = cPath[0];
                Data[dIndex] = Data[dIndex] = JSON.stringify(dObject);
                dIndex++;
            }
            texts = findObjs({
                _type: "text",
                _pageid: page
            });
            for ( i = 0; i < texts.length; i++ )
            {
                dObject = texts[i];
                Data[dIndex] = Data[dIndex] = JSON.stringify(dObject);
                dIndex++;
            }
            dString = Base64.encode(JSON.stringify(Data));
            try 
            {
                storage = createObj("character", {
                    gmnotes: "dString",
                    bio: "dString",
                    name: baseName,
                    imgsrc : Base[0].get("imgsrc"),
                    avatar :  Base[0].get("imgsrc"),
                });
            }
            catch(err)
            {
                
            }
            storage.set('gmnotes',Base64.encode(JSON.stringify(Data)));
            sendChat(msg.who,"Conversion for " + baseName + " created");
        } else 
        {
            sendChat(msg.who,"Naming problem with conversion (are you sure you are using the player page?)");
        }
    } else if (msg.content.substring(0,8) == "!Convert")
    {
        baseName = msg.content.substr(9);
        sendChat(msg.who,"Attempting to convert "+baseName);
        page = Campaign().get("playerpageid");
        Base = findObjs({
            _type: "graphic",
            _pageid: page,
            name: baseName
        });
        Storage = findObjs({
            _type: "character",
            name: baseName
        });
        if (Base.length == 1 && Storage.length == 1)
        {
            Storage[0].get("gmnotes", function(notes) {
                jData = JSON.parse(Base64.decode(notes));
                Data = [];
                for (i = 0; i < jData.length; i++)
                    Data[i] = JSON.parse(jData[i]);
                baseLeft = Data[0].left;
                baseTop = Data[0].top;
                baseLeftAdj = Base[0].get("left") - baseLeft;
                baseTopAdj = Base[0].get("top") - baseTop;
                baseWidth = Base[0].get("width") / Data[0].width;
                baseHeight = Base[0].get("height") / Data[0].height;
                baseScale = Math.sqrt(baseWidth * baseHeight);
                baseRotation = Base[0].get("rotation") - Data[0].rotation;
                if ( Base[0].get("flipv") !== Data[0].flipv ) baseHeight = baseHeight * -1;
                if ( Base[0].get("fliph") !== Data[0].fliph ) baseWidth = baseWidth * -1;
                for ( i = 1; i < Data.length; i++) {
                    if ( Data[i]._type == "graphic") 
                    {
                        baseX = (Data[i].left - baseLeft) * baseWidth;
                        baseY = (Data[i].top - baseTop) * baseHeight;
                        rads = 3.1415927*baseRotation/180;
                        finalX = Math.cos(rads) * baseX - Math.sin(rads) * baseY + Base[0].get("left");
                        finalY = Math.cos(rads) * baseY + Math.sin(rads) * baseX + Base[0].get("top");
                        if (baseWidth < 0 && baseHeight > 0) finalRotation = 180 - Data[i].rotation + baseRotation
                        else if (baseWidth > 0 && baseHeight < 0) finalRotation = 180 - Data[i].rotation + baseRotation
                        else finalRotation = Data[i].rotation + baseRotation;
                        newObj = Data[i];
                        newObj["_pageid"] = page;
                        newObj["left"] = finalX;
                        newObj["top"] = finalY;
                        newObj["width"] = Data[i].width * baseScale;
                        newObj["height"] = Data[i].height * baseScale;
                        newObj["rotation"] = finalRotation;
                        newObj["light_radius"] = Data[i].light_radius * baseScale;
                        newObj["light_dimradius"] = Data[i].light_dimradius * baseScale;
                        newImg = createObj("graphic", newObj);
                    } 
                    if ( Data[i]._type == "path") 
                    {                        
                        baseX = (Data[i].left - baseLeft) * baseWidth;
                        baseY = (Data[i].top - baseTop) * baseHeight;
                        rads = 3.1415927*baseRotation/180;
                        finalX = Math.cos(rads) * baseX - Math.sin(rads) * baseY + Base[0].get("left");
                        finalY = Math.cos(rads) * baseY + Math.sin(rads) * baseX + Base[0].get("top");
                        shiftX = finalX - (Data[i].left - baseLeft) - Base[0].get("left");
                        shiftY = finalY - (Data[i].top - baseTop) - Base[0].get("top");
                        newP = rotatePath(Data[i]._path, baseRotation * -1 - Data[i].rotation, baseWidth, baseHeight, 
                            Data[i].left,Data[i].top);
                        newObj = Data[i];
                        newObj["_pageid"] = page;
                        newObj["rotation"] = 0;
                        newObj["width"] = newP[2][0];
                        newObj["height"] = newP[2][1];
                        newObj["top"] = newP[1][1]-baseTop+Base[0].get("top")+shiftY;
                        newObj["left"] = newP[1][0]-baseLeft+Base[0].get("left")+shiftX;
                        newObj["scaleX"] = 1;
                        newObj["scaleY"] = 1;
                        newObj["_path"] = newP[0];
                        newPath = createObj("path", newObj); 
                    }
                    if ( Data[i]._type == "text") 
                    {
                        baseX = (Data[i].left - baseLeft) * baseWidth;
                        baseY = (Data[i].top - baseTop) * baseHeight;
                        rads = 3.1415927*baseRotation/180;
                        finalX = Math.cos(rads) * baseX - Math.sin(rads) * baseY + Base[0].get("left");
                        finalY = Math.cos(rads) * baseY + Math.sin(rads) * baseX + Base[0].get("top");
                        if (baseWidth < 0 && baseHeight > 0) finalRotation = 180 - Data[i].rotation + baseRotation
                        else if (baseWidth > 0 && baseHeight < 0) finalRotation = 180 - Data[i].rotation + baseRotation
                        else finalRotation = Data[i].rotation + baseRotation;
                        newObj = Data[i];;
                        newObj["_pageid"] = page;
                        newObj["top"] = finalY;
                        newObj["left"] = finalX; 
                        newObj["width"] = Data[i].width * baseScale; 
                        newObj["height"] = Data[i].height * baseScale;
                        newObj["font_size"] = Data[i].font_size * baseScale;
                        newObj["rotation"] = finalRotation;
                        newText = createObj("text", newObj);
                    }
                } 
                sendChat(msg.who,"Finished converting "+baseName);
            });
        }
        else 
        {
            if (Base.length > 1) sendChat(msg.who,"Too many objects to convert named "+baseName);
            if (Base.length < 1) sendChat(msg.who,"No object to convert named "+baseName);
            if (Storage.length > 1) sendChat(msg.who,"Too many storage objects named "+baseName);
            if (Storage.length < 1) sendChat(msg.who,"No storage objects named "+baseName);
        }
    } 
});