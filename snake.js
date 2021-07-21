//how long did it take player to complete the level
let turnsTaken = 0;

let Player = {
    canMoveToTheLocation: function (location) {
        if (gameObjects.snake.length > 1) {
            //player can not move itself,but can move over last piece
            for (let i = 0; i < gameObjects.snake.length - 1; i++) {
                if (gameObjects.snake[i].location.equal(location)) {
                    return false;
                }
            }
            for (let i = 0; i < gameObjects.walls.length; i++) {
                if (gameObjects.walls[i].location.equal(location)) {
                    return false;
                }
            }
        }
        return true;
    },

    move: function (deltaX, deltaY) {
        if (Player.canMoveToTheLocation(new Vector2(gameObjects.snakeHead.location.x + deltaX, gameObjects.snakeHead.location.y + deltaY))) {
            gameObjects.snakeHead.previousLocation.set(gameObjects.snakeHead.location);
            gameObjects.snakeHead.location.x += deltaX;
            gameObjects.snakeHead.location.y += deltaY;
            return true;
        }
        return false;
    }
};

function loadLevelLayout(levelString)
{
    let levelLayout = JSON.parse(levelString);
    if (levelLayout.size != null) {
        levelData.fieldSize = levelLayout.size;
    }
    if (levelLayout.walls != null) {
        //first load the walls
        for (let i = 0; i < levelLayout.walls.length; i++) {
            gameObjects.walls[i] = new Wall(new Vector2(levelLayout.walls[i].location.x, levelLayout.walls[i].location.y));
        }
    }
    if (levelLayout.playerSpawn != null) {
        gameObjects.snakeHead.location.set(new Vector2(levelLayout.playerSpawn.location.x, levelLayout.playerSpawn.location.y));
    }

    if (levelLayout.apples != null) {
        for (let i = 0; i < levelLayout.apples.length; i++) {
            if (levelLayout.apples[i] != null) {
                gameObjects.apples[i] = new Apple(levelLayout.apples[i].location);
            }
        }
    }
    if(levelLayout.finish != null)
    {
        gameObjects.finishPoint = new FinishPoint(levelLayout.finish.location);
    }

    gameObjects.snakeHead.location.set(levelLayout.playerSpawn.location);

    levelData.minAppleCount = levelLayout.minAppleCount;
}

function loadLevelLayoutFromFile(levelPath) {
    let req = new XMLHttpRequest();
    req.open("GET", levelPath, false);
    req.send(null);

    loadLevelLayout(req.responseText);
}

function load() {
    //setup canvas
    Statics.canvas = document.getElementById("gameCanvas");
    Statics.context = Statics.canvas.getContext('2d');



    if (Statics.canvas != null) {
        clearLevelData();

        if(document.getElementById("levels").value == "levelString"){
            loadLevelLayout(document.getElementById("levelStringField").value);
        } else {
            loadLevelLayoutFromFile(document.getElementById("levels").value);
        }


        //level is always a square because it allows to easier covert coords to ids
        Statics.canvas.width = levelData.fieldSize * Statics.shapeSize;
        Statics.canvas.height = levelData.fieldSize * Statics.shapeSize;

        gameObjects.snakeHead.type = SnakeBlockType.Head;

        Statics.context.webkitImageSmoothingEnabled = false;
        Statics.context.msImageSmoothingEnabled = false;
        Statics.context.imageSmoothingEnabled = false;

        //add input function
        window.addEventListener('keydown', function (e) {
            let shouldUpdate = true;
            let dir = -1;
            let moveSuccessful = false;
            switch (e.key) {
                case "ArrowUp":
                    moveSuccessful = Player.move(0, -1);
                    dir = Rotation.Up;
                    break;
                case "ArrowDown":
                    moveSuccessful = Player.move(0, 1);
                    dir = Rotation.Down;
                    break;
                case "ArrowLeft":
                    moveSuccessful = Player.move(-1, 0);
                    dir = Rotation.Left;
                    break;
                case "ArrowRight":
                    moveSuccessful = Player.move(1, 0);
                    dir = Rotation.Right;
                    break;
                default:
                    shouldUpdate = false;
                    break;
            }
            lastPlayerRotation = (dir != -1) ? dir : lastPlayerRotation;
            if(moveSuccessful){
                turnsTaken++;
            }
            if (shouldUpdate) {
                let id = gameObjects.snake.length;
                //check if player went back to the previous location
                if (gameObjects.snake.length > 0 && gameObjects.snake[gameObjects.snake.length - 1].location.equal(gameObjects.snakeHead.location)) {
                    //remove that part
                    gameObjects.snake.splice(gameObjects.snake.length - 1, 1);
                    for (let i = 0; i < gameObjects.apples.length; i++) {
                        if (gameObjects.snakeHead.previousLocation.equal(gameObjects.apples[i].location)) {
                            gameObjects.apples[i].collected = false;
                            break;
                        }
                    }
                } else if (moveSuccessful) {
                    gameObjects.snake[id] = new SnakePart(gameObjects.snakeHead.previousLocation);
                    for (let i = 0; i < gameObjects.apples.length; i++) {
                        if (gameObjects.snakeHead.location.equal(gameObjects.apples[i].location)) {
                            gameObjects.apples[i].collected = true;
                            break;
                        }
                    }
                }
                update();
                draw();
            }
        });
        update();
        draw();
    } else {
        alert("Failed to find canvas!");
    }
}

function draw() {
    if (Statics.context != null) {
        //first draw the world
        Statics.context.fillStyle = "rgb(29,83,29)"
        Statics.context.fillRect(0, 0, Statics.shapeSize * levelData.fieldSize, Statics.shapeSize * levelData.fieldSize);

        //draw the head of the snake
        Drawing.drawSnakePart(gameObjects.snakeHead);

        //the draw snake
        for (let i = 0; i < gameObjects.snake.length; i++) {
            if (gameObjects.snake[i] != null) {
                Drawing.drawSnakePartColor(gameObjects.snake[i]);
            }
        }

        for (let i = 0; i < gameObjects.apples.length; i++) {
            Drawing.drawAppleColor(gameObjects.apples[i]);
        }
        for(let i =0;i<gameObjects.walls.length;i++){
            Drawing.drawWall(gameObjects.walls[i]);
        }
        Drawing.drawFinishPoint(gameObjects.finishPoint);
    }
}
function canWin()
{
    return levelData.currentAppleCount >= levelData.minAppleCount;
}

function win()
{
    if(canWin())
    {
        //show win screen
        alert("you win!");
    }
}


function update() {
    if (gameObjects.snake.length > 0 && gameObjects.snake[0].type != SnakeBlockType.Tail) {
        gameObjects.snake[0].type = SnakeBlockType.Tail;
    }

    let collectedAmount = 0;

    for (let i = 0; i < gameObjects.apples.length; i++) {
        if (gameObjects.apples[i].collected) {
            collectedAmount++;
        }
    }
    levelData.currentAppleCount = collectedAmount;

    if (gameObjects.snakeHead.location.equal(gameObjects.finishPoint.location)) {
        win();
    }
}
