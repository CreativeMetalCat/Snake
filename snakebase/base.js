let Statics = {
    canvas : null,
    context :  null,
    shapeSize : 50,
    snakeAtlasPath: "art/snake_atlas.png"
}

let levelData = {
    fieldSize : 5,
    minAppleCount: 0,
    totalAppleCount: 0,
    currentAppleCount: 0
}

let lastPlayerRotation = 0;

//type that represents location
class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    set(vector) {
        this.x = vector.x;
        this.y = vector.y;
    };

    equal(vector) {
        return this.x == vector.x && this.y == vector.y;
    };
}

Vector2.prototype = Object.create(null,{});

//this enumeration is used for drawing proper parts correctly
let SnakeBlockType =
    {
        Head: 0,
        Body: 1,
        Tail: 2
    };

//Enum for defining all rotations in the game
let Rotation =
    {
        Up:0,
        Right:2,
        Down:1,
        Left:3
    }

class SnakePart {
    constructor(location, rotation = -1) {
        this.location = new Vector2(0, 0);
        this.location.set(location);

        this.previousLocation = new Vector2(0, 0);

        this.type = SnakeBlockType.Body;

        //image used for drawing
        this.image = new Image();
        this.image.src = Statics.snakeAtlasPath;

        this.rotation = rotation;
    }
}

class Apple {
    constructor(location) {
        this.location  = new Vector2(0, 0);
        this.location.set(location);

        this.collected = false;

        this.name = "apple";

        //image used for drawing
        this.image = new Image();
        this.image.src = Statics.snakeAtlasPath;
    }
}

class Decor{
    constructor(location,type = 0) {
        this.type = type;
        this.location = new Vector2(0,0);
        this.location.set(location);

        //image used for drawing
        this.image = new Image();
        this.image.src = Statics.snakeAtlasPath;
    }
}

let WallTypes={
    Wall : 0,
    Water : 1
}

class Wall {
    constructor(location) {
        this.location = new Vector2(0, 0);
        this.location.set(location);
        this.name = "wall";

        this.type = WallTypes.Wall;

        //image used for drawing
        this.image = new Image();
        this.image.src = Statics.snakeAtlasPath;
    }
}

class FinishPoint{
    constructor(location) {
        this.location = new Vector2(0, 0);
        this.location.set(location);

        //image used for drawing
        this.image = new Image();
        this.image.src = Statics.snakeAtlasPath;
    }
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


let gameObjects = {
    //part of the snake controlled by player
    snakeHead: new SnakePart(0, 0),
    finishPoint : new FinishPoint(0,0),
    //representation of all snake parts
    snake: [],
    //array of all the apples player needs to collect
    apples: [],
    //walls are just a simple way of creating an obstacle
    //player can not pass through the obstacle
    walls:[],
    //various decor items like flowers
    decor:[]
}

//object that is responsible for drawing objects on screen
let Drawing = {
    //draws snake part as solid color rectangle
    drawSnakePartColor: function (part) {
        if (Statics.context != null) {
            switch (part.type) {
                case SnakeBlockType.Body:
                    Statics.context.fillStyle = 'red';
                    break;
                case SnakeBlockType.Head:
                    Statics.context.fillStyle = 'blue';
                    break;
                case SnakeBlockType.Tail:
                    Statics.context.fillStyle = 'green';
                    break;
            }
            Statics.context.fillRect(part.location.x * Statics.shapeSize, part.location.y * Statics.shapeSize, Statics.shapeSize, Statics.shapeSize);
        }
    },
    drawSnakePart:function (part,id = -1) {
        //default uv uses head
        let uv = new Vector2(0, 0);
        if (Statics.context != null) {
            switch (part.type) {
                case SnakeBlockType.Body:

                    if (part.rotation >= 0) {
                        if (gameObjects.snake[id - 1].rotation == Rotation.Up || gameObjects.snake[id - 1].rotation == Rotation.Down) {
                            if (part.rotation == Rotation.Up || part.rotation == Rotation.Down) {
                                uv.x = 0;
                                uv.y = 48;
                            }
                            if (part.rotation == Rotation.Right && gameObjects.snake[id - 1].rotation == Rotation.Up) {
                                uv.x = 0;
                                uv.y = 32;
                            }
                            if (part.rotation == Rotation.Left && gameObjects.snake[id - 1].rotation == Rotation.Up) {
                                uv.x = 16;
                                uv.y = 32;
                            }
                            if (part.rotation == Rotation.Right && gameObjects.snake[id - 1].rotation == Rotation.Down) {
                                uv.x = 32;
                                uv.y = 32;
                            }
                            if (part.rotation == Rotation.Left && gameObjects.snake[id - 1].rotation == Rotation.Down) {
                                uv.x = 48;
                                uv.y = 32;
                            }
                        } else if (gameObjects.snake[id - 1].rotation == Rotation.Left || gameObjects.snake[id - 1].rotation == Rotation.Right) {
                            if (part.rotation == Rotation.Left || part.rotation == Rotation.Right) {
                                uv.x = 16;
                                uv.y = 48;
                            }
                            if (part.rotation == Rotation.Up && gameObjects.snake[id - 1].rotation == Rotation.Right) {
                                uv.x = 48;
                                uv.y = 32;
                            }
                            if (part.rotation == Rotation.Up && gameObjects.snake[id - 1].rotation == Rotation.Left) {
                                uv.x = 32;
                                uv.y = 32;
                            }
                            if (part.rotation == Rotation.Down && gameObjects.snake[id - 1].rotation == Rotation.Right) {
                                uv.x = 16;
                                uv.y = 32;
                            }
                            if (part.rotation == Rotation.Down && gameObjects.snake[id - 1].rotation == Rotation.Left) {
                                uv.x = 0;
                                uv.y = 32;
                            }
                        }
                    }

                    break;
                case SnakeBlockType.Head:
                    uv.x = 16 * lastPlayerRotation;
                    break;
                case SnakeBlockType.Tail:
                    let checkObj = gameObjects.snake[1] == null ? gameObjects.snakeHead : gameObjects.snake[1];
                    if (checkObj.location.x != part.location.x) {
                        uv.x = (checkObj.location.x - part.location.x) < 0 ? 48 : 32;
                    } else if (checkObj.location.y != part.location.y) {
                        uv.x = (checkObj.location.y - part.location.y) < 0 ? 0 : 16;
                    }
                    uv.y = 16;
                    break;
            }
        }
        Statics.context.drawImage(part.image, uv.x, uv.y, 16, 16, part.location.x * Statics.shapeSize, part.location.y * Statics.shapeSize, Statics.shapeSize, Statics.shapeSize);
    },
    drawAppleColor: function (apple) {
        if (Statics.context != null) {
            Statics.context.fillStyle = apple.collected ? 'black' : 'yellow';
            Statics.context.fillRect(Statics.shapeSize * 0.25 + Statics.shapeSize * apple.location.x, Statics.shapeSize * 0.25 + Statics.shapeSize * apple.location.y, Statics.shapeSize * 0.75, Statics.shapeSize * 0.75);
        }
    },
    drawApple: function (apple) {
        if (Statics.context != null) {
            Statics.context.drawImage(apple.image, 0,160, 16, 16, apple.location.x * Statics.shapeSize,apple.location.y * Statics.shapeSize, Statics.shapeSize, Statics.shapeSize); }
    },
    drawWallColor: function (wall) {
        if (Statics.context != null) {
            Statics.context.fillStyle = wall.type == WallTypes.Wall ? 'black' : 'blue';
            Statics.context.fillRect(wall.location.x * Statics.shapeSize, wall.location.y * Statics.shapeSize, Statics.shapeSize, Statics.shapeSize);
        }
    },
    drawGhostBlock: function (block) {
        if (Statics.context != null) {
            Statics.context.fillStyle = 'rgba(35,34,34,0.8)';
            Statics.context.fillRect(block.location.x * Statics.shapeSize, block.location.y * Statics.shapeSize, Statics.shapeSize, Statics.shapeSize);
        }
    },
    drawFinishPoint: function (point) {
        if (Statics.context != null) {
            Statics.context.fillStyle = 'rgba(16,127,127,0.8)';
            Statics.context.fillRect(point.location.x * Statics.shapeSize, point.location.y * Statics.shapeSize, Statics.shapeSize, Statics.shapeSize);
        }
    },
    drawDecor:function(decor){
        if (Statics.context != null) {
            Statics.context.drawImage(decor.image,(decor.type > 3 ? decor.type -  4 : decor.type)*16,decor.type > 3 ? 80 : 64, 16, 16, decor.location.x * Statics.shapeSize, decor.location.y * Statics.shapeSize, Statics.shapeSize, Statics.shapeSize);
        }
    }
    ,
    drawWall: function (wall) {
        if (Statics.context != null) {
            let resultUV = new Vector2(48, 112);
            let leftObj = getObjectByLocation(new Vector2(wall.location.x - 1,wall.location.y));
            let rightObj = getObjectByLocation(new Vector2(wall.location.x + 1,wall.location.y));
            if (gameObjects.walls.length > 1) {
                let id =  + wall.location.y * levelData.fieldSize;
                if (leftObj != null && rightObj  != null) {
                    resultUV.set(new Vector2(16, 112));
                } else if (leftObj != null) {
                    resultUV.set(new Vector2(32, 112));
                } else if (rightObj  != null) {
                    resultUV.set(new Vector2(0, 112));
                }
            }
            Statics.context.drawImage(wall.image, resultUV.x, resultUV.y, 16, 16, wall.location.x * Statics.shapeSize, wall.location.y * Statics.shapeSize, Statics.shapeSize, Statics.shapeSize);
        }
    }
}

function clearLevelData()
{
    //clear previous data
    gameObjects.walls = [];
    gameObjects.apples = [];
    gameObjects.snake = [];
    gameObjects.decor = [];
}