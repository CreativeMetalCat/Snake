
let ghostBlock = {
    location:new Vector2(0,0)
}

let fieldSize = 5;

let spawnPointLocation = new Vector2(0,0)

let finishPointLocation = new Vector2(0,1);

let leftMouseButtonDown = false;

let rightMouseButtonDown = false;

let selectedObject = null;

function convertLocation(x,y) {
    return new Vector2(Math.floor((x - Statics.canvas.getBoundingClientRect().left) / Statics.shapeSize), Math.floor((y - Statics.canvas.getBoundingClientRect().top) / Statics.shapeSize));
}

function canBePlacedHere(location)
{
    for (let i = 0; i < gameObjects.walls.length; i++) {
        if (gameObjects.walls[i].location.equal(location)) {
            return false;
        }
    }
    for (let i = 0; i < gameObjects.apples.length; i++) {
        if (gameObjects.apples[i].location.equal(location)) {
            return false;
        }
    }
    return true;
}

function generateLevel() {
    let result = {
        size: fieldSize,
        minAppleCount: document.getElementById("minAppleCount").value,
        name: document.getElementById("levelName").value,
        playerSpawn: {
            location: spawnPointLocation
        },
        walls: gameObjects.walls,
        apples: gameObjects.apples,
        finish: {
            location: finishPointLocation
        }
    };

    document.getElementById("levelOutput").value = JSON.stringify(result);
}

function copyLevelString(){
    let copyText = document.getElementById("levelOutput");

    copyText.select();

    document.execCommand("copy");
}

//returns base object with same location. Special objects like spawn and finish points are ignored, because they have no details
function getObjectByLocation(location) {
    for (let i = 0; i < gameObjects.walls.length; i++) {
        if (gameObjects.walls[i].location.equal(location)) {
            return gameObjects.walls[i];
        }
    }

    for (let i = 0; i < gameObjects.apples.length; i++) {
        if (gameObjects.apples[i].location.equal(location)) {
            return gameObjects.apples[i];
        }
    }
}

function updateSelectedObjectName() {
    if (selectedObject != null) {
        selectedObject.name = document.getElementById("objName").value;
    }
}


function selectObject(location) {
    //find the object that has same location
    let obj = getObjectByLocation(location);
    if (obj != null) {
        //update details panel
        document.getElementById("objName").value = obj.name;
        selectedObject = obj;
        if(obj instanceof Wall)
        {
            //generate type selection panel
            let detailDiv = document.getElementById("specialDetails");
            detailDiv.innerHTML = "<select id=\"wallType\">Wall Type <option value=\"Normal\">Normal Wall</option> <option value=\"Water\">Water</option></select>";
        }
        else
        {
            document.getElementById("specialDetails").innerHTML = "";
        }
    }
}


function placeObject(location) {
    if (canBePlacedHere(location)) {
        switch (document.getElementById("tool").value) {
            case "wall":
                gameObjects.walls[gameObjects.walls.length] = new Wall(location);
                break
            case "apple":
                gameObjects.apples[gameObjects.apples.length] = new Apple(location);
                break;
            case "playerStart":
                spawnPointLocation.set(location);
                break;
            case "finishPoint":
                finishPointLocation.set(location)
                break;
            default:
                break;
        }
    }
}

function removeObject(location) {
    for (let i = 0; i < gameObjects.walls.length; i++) {
        if (gameObjects.walls[i].location.equal(location)) {
            gameObjects.walls.splice(i, 1);
            return;
        }
    }

    for (let i = 0; i < gameObjects.apples.length; i++) {
        if (gameObjects.apples[i].location.equal(location)) {
            gameObjects.apples.splice(i, 1);
            return;
        }
    }
}


function load() {
    clearLevelData();

    let req = new XMLHttpRequest();
    req.open("GET", "./../settings.json", false);
    req.send(null);
    let settings = JSON.parse(req.responseText);

    Statics.shapeSize = settings.shapeSize;

    Statics.canvas = document.getElementById("editField");
    Statics.context = Statics.canvas.getContext("2d");

    fieldSize = document.getElementById("levelSize").value;

    Statics.canvas.addEventListener('mousedown', function (e) {
        if (e.button == 0) {
            leftMouseButtonDown = true;
            if (canBePlacedHere(convertLocation(e.x, e.y))) {
                placeObject(convertLocation(e.x, e.y));
            } else {
                selectObject(convertLocation(e.x, e.y));
            }
        }
        if (e.button == 2) {
            rightMouseButtonDown = true;
        }
    });

    Statics.canvas.addEventListener('mouseup', function (e) {
        leftMouseButtonDown = false;
        rightMouseButtonDown = false;
    });

    Statics.canvas.addEventListener('mousemove', function (e) {
        if (!leftMouseButtonDown) {
            ghostBlock.location.set(convertLocation(e.x, e.y));
        }
        if (rightMouseButtonDown) {
            removeObject(convertLocation(e.x, e.y));
        } else if(leftMouseButtonDown){
            placeObject(convertLocation(e.x, e.y));
        }
        draw();
    });

    window.addEventListener('contextmenu', function (e) {
    });

    Statics.canvas.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        removeObject(convertLocation(e.x, e.y));
    });
}

function draw() {
    Statics.context.fillStyle = "rgb(29,83,29)"
    Statics.context.fillRect(0, 0, Statics.canvas.width, Statics.canvas.height);
    Drawing.drawGhostBlock(ghostBlock);

    for (let i = 0; i < gameObjects.apples.length; i++) {
        Drawing.drawAppleColor(gameObjects.apples[i]);
    }
    for (let i = 0; i < gameObjects.walls.length; i++) {
        Drawing.drawWallColor(gameObjects.walls[i]);
    }

    Statics.context.fillStyle = 'rgb(0,46,255)';
    Statics.context.fillRect(spawnPointLocation.x * Statics.shapeSize, spawnPointLocation.y * Statics.shapeSize, Statics.shapeSize, Statics.shapeSize);

    Statics.context.fillStyle = 'rgb(255,0,83)';
    Statics.context.fillRect(finishPointLocation.x * Statics.shapeSize, finishPointLocation.y * Statics.shapeSize, Statics.shapeSize, Statics.shapeSize);
}


function resizeCanvas()
{
    Statics.canvas.width = Statics.shapeSize *  fieldSize;
    Statics.canvas.height = Statics.shapeSize *  fieldSize;
}