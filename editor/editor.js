
let ghostBlock = {
    location:new Vector2(0,0)
}

let fieldSize = 5;

let spawnPointLocation = new Vector2(0,0);

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
        if(canBePlacedHere(convertLocation(e.x, e.y))) {
            switch (document.getElementById("tool").value) {
                case "wall":
                    gameObjects.walls[gameObjects.walls.length] = new Wall(convertLocation(e.x, e.y));
                    break
                case "apple":
                    gameObjects.apples[gameObjects.apples.length] = new Apple(convertLocation(e.x, e.y));
                    break;
                case "playerStart":
                    spawnPointLocation.set(convertLocation(e.x, e.y));
                    break;
                default:
                    break;
            }
        }

    });

    Statics.canvas.addEventListener('mousemove', function (e) {
        ghostBlock.location.set(convertLocation(e.x, e.y));
        draw();
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
}


function resizeCanvas()
{
    Statics.canvas.width = Statics.shapeSize *  fieldSize;
    Statics.canvas.height = Statics.shapeSize *  fieldSize;
}