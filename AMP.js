graphicsProps = ["imgsrc", "name", "left", "top", "width", "height", "rotation", "layer", "isdrawing","flipv","fliph","gmnotes","controlledby","bar1_value","bar1_max","bar1_link","bar2_value","bar2_max","bar2_link","bar3_value","bar3_max","bar3_link","represents",
    "aura1_radius","aura1_color","aura1_square","aura2_radius","aura2_color","aura2_square","tint_color","statusmarkers","showname","showplayers_name","showplayers_bar1","showplayers_bar2","showplayers_bar3",
    "showplayers_aura1","showplayers_aura2","playersedit_name","playersedit_bar1","playersedit_bar2","playersedit_bar3","playersedit_aura1","playersedit_aura2","light_radius","light_dimradius","light_otherplayers","light_hassight","light_angle",
    "light_losangle","sides","currentSide","lastmove","_subtype","_cardid"];
    
pathProps = ["fill", "stroke", "rotation", "stroke_width", "width", "height","top" ,"left", "scaleX", "scaleY", "controlledby",
    "layer", "_path"];
    
textProps = ["top", "left", "width", "height", "text", "font_size", "rotation", "color", "font_family", "layer", "controlledby"];

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function marker(XPos, YPos){
    createObj ("path", {
            "fill":"transparent",
            "stroke":"#ff0000",
            "rotation":0,
            "stroke_width":5,
            "width":10,
            "height":10,
            "top":YPos,
            "left":XPos,
            "scaleX":1,
            "scaleY":1,
            "controlledby":"-IdwiUbN7sGFmfnzYsM5",
            "layer":"objects",
            "_path":"[[\"M\",0,5],[\"C\",0,2.238576,2.238576,0,5,0],[\"C\",7.761424,0,10,2.238576,10,5],[\"C\",10,7.761424,7.761424,10,5,10],[\"C\",2.238576,10,0,7.761424,0,5]]",
            "_id":"-JXZJLPM72xYy_agyFB8",
            "_type":"path",
            "_pageid":page});
    return;
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
        log(baseName);
        sendChat(msg.who,"Attempting to create conversion");
        page = Campaign().get("playerpageid");
        Base = findObjs({
            _type: "graphic",
            _pageid: page,
            name: baseName
        });
        log(Base);
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
            setup(storage, baseName+".0.type", "base");
            for ( p = 0; p < graphicsProps.length; p++ )
            {
                n = Base[0].get("name")+".0."+graphicsProps[p];
                val = Base[0].get(graphicsProps[p]);
                setup(storage, n, val);
            }
            graphics = findObjs({
                _type: "graphic",
                _pageid: page
            });
            log(graphics);
            for ( i = 0; i < graphics.length; i++ )
            {
                if (graphics[i].get("name") !== baseName) 
                {
                    n = "Graphic."+i+".type";
                    setup(storage, n, "graphic");
                    for ( p = 0; p < graphicsProps.length; p++ )
                    {
                        n = "Graphic."+i+"."+graphicsProps[p];
                        val = graphics[i].get(graphicsProps[p]);
                        setup(storage, n, val);
                    }
                }
            }
            paths = findObjs({
                _type: "path",
                _pageid: page
            });
            for ( i = 0; i < paths.length; i++ )
            {
                n = "Path."+i+".type";
                setup(storage, n, "path");
                {
                    for ( p = 0; p < pathProps.length; p++ )
                    {
                        n = "Path"+"."+i+"."+pathProps[p];
                        val = paths[i].get(pathProps[p]);
                        setup(storage, n, val);
                    }
                }
            }
            texts = findObjs({
                _type: "text",
                _pageid: page
            });
            for ( i = 0; i < texts.length; i++ )
            {
                n = "Text."+i+".type";
                setup(storage, n, "text");
                {
                    for ( p = 0; p < textProps.length; p++ )
                    {
                        n = "Text"+"."+i+"."+textProps[p];
                        val = texts[i].get(textProps[p]);
                        setup(storage, n, val);
                    }
                }
            }
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
            });
            baseLeft = storageList[3].get("current");
            baseTop = storageList[4].get("current");
            baseLeftAdj = Base[0].get("left") - storageList[3].get("current");
            baseTopAdj = Base[0].get("top") - storageList[4].get("current");
            baseWidth = Base[0].get("width") / storageList[5].get("current");
            baseHeight = Base[0].get("height") / storageList[6].get("current");
            baseScale = (baseWidth  + baseHeight)/2;
            baseRotation = Base[0].get("rotation") - storageList[7].get("current");
            if ( Base[0].get("flipv") !== storageList[10].get("current") ) baseHeight = baseHeight * -1;
            if ( Base[0].get("fliph") !== storageList[11].get("current") ) baseWidth = baseWidth * -1;
            baseFlipH = storageList[7].get("current");
            for ( i = 0; i < storageList.length; i++) {
                n = storageList[i].get("name");
                n = n.substr(n.length-5);
                if ( n == ".type" && storageList[i].get("current") == "graphic") 
                {
                    s = storageList[i].get("name");
                    s = s.substring(0,s.length-5);
                    r = s.split(".")[0];
                    baseX = (storageList[i+3].get("current") - baseLeft) * baseWidth;
                    baseY = (storageList[i+4].get("current") - baseTop) * baseHeight;
                    rads = 3.1415927*baseRotation/180;
                    finalX = Math.cos(rads) * baseX - Math.sin(rads) * baseY + Base[0].get("left");
                    finalY = Math.cos(rads) * baseY + Math.sin(rads) * baseX + Base[0].get("top");
                    if (baseWidth < 0 && baseHeight > 0) finalRotation = 180 - storageList[i+7].get("current") + baseRotation
                    else if (baseWidth > 0 && baseHeight < 0) finalRotation = 180 - storageList[i+7].get("current") + baseRotation
                    else finalRotation = storageList[i+7].get("current") + baseRotation;
                    newImg = createObj("graphic", 
                        {"_pageid":page,
                        "imgsrc":storageList[i+1].get("current"),
                        "name":storageList[i+2].get("current"),
                        "left":finalX,
                        "top":finalY,
                        "width":storageList[i+5].get("current") * baseScale,
                        "height":storageList[i+6].get("current") * baseScale,
                        "rotation":finalRotation,
                        "layer":storageList[i+8].get("current"),
                        "isdrawing":storageList[i+9].get("current"),
                        "flipv":storageList[i+10].get("current"),
                        "fliph":storageList[i+11].get("current"),
                        "gmnotes":storageList[i+12].get("current"),
                        "controlledby":storageList[i+13].get("current"),
                        "bar1_value":storageList[i+14].get("current"),
                        "bar1_max":storageList[i+15].get("current"),
                        "bar1_link":storageList[i+16].get("current"),
                        "bar2_value":storageList[i+17].get("current"),
                        "bar2_max":storageList[i+18].get("current"),
                        "bar2_link":storageList[i+19].get("current"),
                        "bar3_value":storageList[i+20].get("current"),
                        "bar3_max":storageList[i+21].get("current"),
                        "bar3_link":storageList[i+22].get("current"),
                        "represents":storageList[i+23].get("current"),
                        "aura1_radius":storageList[i+24].get("current"),
                        "aura1_color":storageList[i+25].get("current"),
                        "aura1_square":storageList[i+26].get("current"),
                        "aura2_radius":storageList[i+27].get("current"),
                        "aura2_color":storageList[i+28].get("current"),
                        "aura2_square":storageList[i+29].get("current"),
                        "tint_color":storageList[i+30].get("current"),
                        "statusmarkers":storageList[i+31].get("current"),
                        "showname":storageList[i+32].get("current"),
                        "showplayers_name":storageList[i+33].get("current"),
                        "showplayers_bar1":storageList[i+34].get("current"),
                        "showplayers_bar2":storageList[i+35].get("current"),
                        "showplayers_bar3":storageList[i+36].get("current"),
                        "showplayers_aura1":storageList[i+37].get("current"),
                        "showplayers_aura2":storageList[i+38].get("current"),
                        "playersedit_name":storageList[i+39].get("current"),
                        "playersedit_bar1":storageList[i+40].get("current"),
                        "playersedit_bar2":storageList[i+41].get("current"),
                        "playersedit_bar3":storageList[i+42].get("current"),
                        "playersedit_aura1":storageList[i+43].get("current"),
                        "playersedit_aura2":storageList[i+44].get("current"),
                        "light_radius":storageList[i+45].get("current") * baseScale,
                        "light_dimradius":storageList[i+46].get("current") * baseScale,
                        "light_otherplayers":storageList[i+47].get("current"),
                        "light_hassight":storageList[i+48].get("current"),
                        "light_angle":storageList[i+49].get("current"),
                        "light_losangle":storageList[i+50].get("current"),
                        "sides":storageList[i+51].get("current"),
                        "currentSide":storageList[i+52].get("current"),
                        "lastmove":storageList[i+53].get("current"),
                        "_subtype":storageList[i+54].get("current"),
                        "_cardid":storageList[i+55].get("current") 
                    }); 
                } 
                if ( n == ".type" && storageList[i].get("current") == "path") 
                {
                    baseX = (storageList[i+8].get("current") - baseLeft) * baseWidth;
                    baseY = (storageList[i+7].get("current") - baseTop) * baseHeight;
                    rads = 3.1415927*baseRotation/180;
                    finalX = Math.cos(rads) * baseX - Math.sin(rads) * baseY + Base[0].get("left");
                    finalY = Math.cos(rads) * baseY + Math.sin(rads) * baseX + Base[0].get("top");
                    shiftX = finalX - (storageList[i+8].get("current") - baseLeft) - Base[0].get("left");
                    shiftY = finalY - (storageList[i+7].get("current") - baseTop) - Base[0].get("top");
                    newP = rotatePath(storageList[i+13].get("current"),baseRotation * -1 - storageList[i+3].get("current"),baseWidth,baseHeight,storageList[i+8].get("current"),storageList[i+7].get("current"));
                    newPath = createObj("path", 
                        {"_pageid":page,
                        "fill":storageList[i+1].get("current"),
                        "stroke":storageList[i+2].get("current"),
                        "rotation":0,
                        "stroke_width":storageList[i+4].get("current"),
                        "width":newP[2][0],
                        "height":newP[2][1],
                        "top":newP[1][1]-baseTop+Base[0].get("top")+shiftY,
                        "left":newP[1][0]-baseLeft+Base[0].get("left")+shiftX,
                        "scaleX":1,
                        "scaleY":1,
                        "layer":storageList[i+12].get("current"),
                        "_path":newP[0]
                    });
                }
                if ( n == ".type" && storageList[i].get("current") == "text") 
                {
                    baseX = (storageList[i+2].get("current") - baseLeft) * baseWidth;
                    baseY = (storageList[i+1].get("current") - baseTop) * baseHeight;
                    rads = 3.1415927*baseRotation/180;
                    finalX = Math.cos(rads) * baseX - Math.sin(rads) * baseY + Base[0].get("left");
                    finalY = Math.cos(rads) * baseY + Math.sin(rads) * baseX + Base[0].get("top");
                    if (baseWidth < 0 && baseHeight > 0) finalRotation = 180 - storageList[i+7].get("current") + baseRotation
                    else if (baseWidth > 0 && baseHeight < 0) finalRotation = 180 - storageList[i+7].get("current") + baseRotation
                    else finalRotation = storageList[i+7].get("current") + baseRotation;
                    newText = createObj("text", 
                        {"_pageid":page,
                        "top":finalY, 
                        "left":finalX, 
                        "width":storageList[i+3].get("current") * baseScale, 
                        "height":storageList[i+4].get("current") * baseScale, 
                        "text":storageList[i+5].get("current"), 
                        "font_size":storageList[i+6].get("current") * baseScale, 
                        "rotation":finalRotation, 
                        "color":storageList[i+8].get("current"), 
                        "font_family":storageList[i+9].get("current"), 
                        "layer":storageList[i+10].get("current"), 
                        "controlledby":storageList[i+11].get("current")
                    });
                }
            }
            sendChat(msg.who,"Finished converting "+baseName);
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
   