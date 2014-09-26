//A.M.P.
//Advanced Mapping Procedurals

/*The MIT License (MIT)

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

graphicsProps = ["imgsrc", "name", "left", "top", "width", "height", "rotation", "layer", "isdrawing","flipv","fliph","gmnotes","controlledby","bar1_value","bar1_max","bar1_link","bar2_value","bar2_max","bar2_link","bar3_value","bar3_max","bar3_link","represents",
    "aura1_radius","aura1_color","aura1_square","aura2_radius","aura2_color","aura2_square","tint_color","statusmarkers","showname","showplayers_name","showplayers_bar1","showplayers_bar2","showplayers_bar3",
    "showplayers_aura1","showplayers_aura2","playersedit_name","playersedit_bar1","playersedit_bar2","playersedit_bar3","playersedit_aura1","playersedit_aura2","light_radius","light_dimradius","light_otherplayers","light_hassight","light_angle",
    "light_losangle","sides","currentSide","lastmove","_subtype","_cardid"];
    
pathProps = ["fill", "stroke", "rotation", "stroke_width", "width", "height","top" ,"left", "scaleX", "scaleY", "controlledby",
    "layer", "_path"];
    
textProps = ["top", "left", "width", "height", "text", "font_size", "rotation", "color", "font_family", "layer", "controlledby"];

(function() {
    oldCreateObj = createObj;
    createObj = function() {
        obj = oldCreateObj.apply(this, arguments);
        if (obj.get("_type") == 'attribute') obj.fbpath = '/char-attribs/char/'+ obj.get("_characterid") +'/'+ obj.get("_id");
        return obj;
    }
}())
    
function setup(obj, attr, base) {
    object = createObj("attribute", {
        _characterid: obj.get("_id"),
        name: attr,
        current: base,
    });
    return;
}

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
            try 
            {
                storage = createObj("character", {
                    name: baseName,
                    imgsrc : Base[0].get("imgsrc"),
                    avatar :  Base[0].get("imgsrc")
                });
            }
            catch(err)
            {

            }
            dObject = [];
            dObject[0] = "base";
            for ( p = 0; p < graphicsProps.length; p++ )
				dObject[p+1] = Base[0].get(graphicsProps[p]);
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
                    dObject = [];
                    dObject[0] = "graphic";
                    for ( p = 0; p < graphicsProps.length; p++ )
						dObject[p+1] = graphics[i].get(graphicsProps[p]);
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
                dObject = [];
                dObject[0] = "path";
                cPath=rotatePath(paths[i].get("_path"),0-paths[i].get("rotation"),paths[i].get("scaleX"),paths[i].get("scaleY"),paths[i].get("left"),
                    paths[i].get("top"));
                dObject[1] = paths[i].get("fill");
                dObject[2] = paths[i].get("stroke");
                dObject[3] = 0;
                dObject[4] = paths[i].get("stroke_width");
                dObject[5] = cPath[2][0];
                dObject[6] = cPath[2][1];
                dObject[7] = cPath[1][1];
                dObject[8] = cPath[1][0];
                dObject[9] = 1;
                dObject[10] = 1;
                for ( p = 10; p < pathProps.length-1; p++ )
					dObject[p+1] = paths[i].get(pathProps[p]);
                dObject[pathProps.length] = cPath[0];
                Data[dIndex] = Data[dIndex] = JSON.stringify(dObject);;
				dIndex++;
            }
            texts = findObjs({
                _type: "text",
                _pageid: page
            });
            for ( i = 0; i < texts.length; i++ )
            {
                dObject = [];
                dObject[0] = "text";
                for ( p = 0; p < textProps.length; p++ )
					dObject[p+1] = texts[i].get(textProps[p]);
                Data[dIndex] = Data[dIndex] = JSON.stringify(dObject);;
				dIndex++
            }
            setup(storage,"Data",Data);
            sendChat(msg.who,"Conversion for " + baseName + " created");
        } else sendChat(msg.who,"Naming problem with conversion");
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
            storageList = findObjs({
                _type: "attribute",
                _characterid: Storage[0].get("_id"),
                name:"Data"
            });
            jData = storageList[0].get("current");
            Data = [];
            for (i = 0; i < jData.length; i++)
                Data[i] = JSON.parse(jData[i]);
            baseLeft = Data[0][3];
            baseTop = Data[0][4];
            baseLeftAdj = Base[0].get("left") - Data[0][3];
            baseTopAdj = Base[0].get("top") - Data[0][4];
            baseWidth = Base[0].get("width") / Data[0][5];
            baseHeight = Base[0].get("height") / Data[0][6];
            baseScale = (baseWidth  + baseHeight)/2;
            baseRotation = Base[0].get("rotation") - Data[0][7];
            if ( Base[0].get("flipv") !== Data[0][10] ) baseHeight = baseHeight * -1;
            if ( Base[0].get("fliph") !== Data[0][11] ) baseWidth = baseWidth * -1;
            for ( i = 1; i < Data.length; i++) {
                if ( Data[i][0] == "graphic") 
                {
                    baseX = (Data[i][3] - baseLeft) * baseWidth;
                    baseY = (Data[i][4] - baseTop) * baseHeight;
                    rads = 3.1415927*baseRotation/180;
                    finalX = Math.cos(rads) * baseX - Math.sin(rads) * baseY + Base[0].get("left");
                    finalY = Math.cos(rads) * baseY + Math.sin(rads) * baseX + Base[0].get("top");
                    if (baseWidth < 0 && baseHeight > 0) finalRotation = 180 - Data[i][7] + baseRotation
                    else if (baseWidth > 0 && baseHeight < 0) finalRotation = 180 - Data[i][7] + baseRotation
                    else finalRotation = Data[i][7] + baseRotation;
                    newImg = createObj("graphic", 
                        {"_pageid":page,
                        "imgsrc":Data[i][1],
                        "name":Data[i][2],
                        "left":finalX,
                        "top":finalY,
                        "width":Data[i][5] * baseScale,
                        "height":Data[i][6] * baseScale,
                        "rotation":finalRotation,
                        "layer":Data[i][8],
                        "isdrawing":Data[i][9],
                        "flipv":Data[i][0],
                        "fliph":Data[i][11],
                        "gmnotes":Data[i][12],
                        "controlledby":Data[i][13],
                        "bar1_value":Data[i][14],
                        "bar1_max":Data[i][15],
                        "bar1_link":Data[i][16],
                        "bar2_value":Data[i][17],
                        "bar2_max":Data[i][18],
                        "bar2_link":Data[i][19],
                        "bar3_value":Data[i][20],
                        "bar3_max":Data[i][21],
                        "bar3_link":Data[i][22],
                        "represents":Data[i][23],
                        "aura1_radius":Data[i][24],
                        "aura1_color":Data[i][25],
                        "aura1_square":Data[i][26],
                        "aura2_radius":Data[i][27],
                        "aura2_color":Data[i][28],
                        "aura2_square":Data[i][29],
                        "tint_color":Data[i][30],
                        "statusmarkers":Data[i][31],
                        "showname":Data[i][32],
                        "showplayers_name":Data[i][33],
                        "showplayers_bar1":Data[i][34],
                        "showplayers_bar2":Data[i][35],
                        "showplayers_bar3":Data[i][36],
                        "showplayers_aura1":Data[i][37],
                        "showplayers_aura2":Data[i][38],
                        "playersedit_name":Data[i][39],
                        "playersedit_bar1":Data[i][40],
                        "playersedit_bar2":Data[i][41],
                        "playersedit_bar3":Data[i][42],
                        "playersedit_aura1":Data[i][43],
                        "playersedit_aura2":Data[i][44],
                        "light_radius":Data[i][45] * baseScale,
                        "light_dimradius":Data[i][46] * baseScale,
                        "light_otherplayers":Data[i][47],
                        "light_hassight":Data[i][48],
                        "light_angle":Data[i][49],
                        "light_losangle":Data[i][50],
                        "sides":Data[i][51],
                        "currentSide":Data[i][52],
                        "lastmove":Data[i][53],
                        "_subtype":Data[i][54],
                        "_cardid":Data[i][55]
                    });
                } 
                if ( Data[i][0] == "path") 
                {                        
                    baseX = (Data[i][8] - baseLeft) * baseWidth;
                    baseY = (Data[i][7] - baseTop) * baseHeight;
                    rads = 3.1415927*baseRotation/180;
                    finalX = Math.cos(rads) * baseX - Math.sin(rads) * baseY + Base[0].get("left");
                    finalY = Math.cos(rads) * baseY + Math.sin(rads) * baseX + Base[0].get("top");
                    shiftX = finalX - (Data[i][8] - baseLeft) - Base[0].get("left");
                    shiftY = finalY - (Data[i][7] - baseTop) - Base[0].get("top");
                    newP = rotatePath(Data[i][13], baseRotation * -1 - Data[i][3], baseWidth, baseHeight, Data[i][8],Data[i][7]);
            
                    newPath = createObj("path", 
                        {"_pageid":page,
                        "fill":Data[i][1],
                        "stroke":Data[i][2],
                        "rotation":0,
                        "stroke_width":Data[i][4],
                        "width":newP[2][0],
                        "height":newP[2][1],
                        "top":newP[1][1]-baseTop+Base[0].get("top")+shiftY,
                        "left":newP[1][0]-baseLeft+Base[0].get("left")+shiftX,
                        "scaleX":1,
                        "scaleY":1,
                        "layer":Data[i][12],
                        "_path":newP[0] 
                    }); 
                }
                if ( Data[i][0] == "text") 
                {
                    baseX = (Data[i][2] - baseLeft) * baseWidth;
                    baseY = (Data[i][1] - baseTop) * baseHeight;
                    rads = 3.1415927*baseRotation/180;
                    finalX = Math.cos(rads) * baseX - Math.sin(rads) * baseY + Base[0].get("left");
                    finalY = Math.cos(rads) * baseY + Math.sin(rads) * baseX + Base[0].get("top");
                    if (baseWidth < 0 && baseHeight > 0) finalRotation = 180 - Data[i][7] + baseRotation
                    else if (baseWidth > 0 && baseHeight < 0) finalRotation = 180 - Data[i][7] + baseRotation
                    else finalRotation = Data[i][7] + baseRotation;
                    newText = createObj("text", 
                        {"_pageid":page,
                        "top":finalY, 
                        "left":finalX, 
                        "width":Data[i][3] * baseScale, 
                        "height":Data[i][4] * baseScale, 
                        "text":Data[i][5], 
                        "font_size":Data[i][6] * baseScale, 
                        "rotation":finalRotation, 
                        "color":Data[i][8], 
                        "font_family":Data[i][9], 
                        "layer":Data[i][10], 
                        "controlledby":Data[i][11]
                    });
                } 
            sendChat(msg.who,"Finished converting "+baseName);
            }
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