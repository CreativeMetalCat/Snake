let Statics = {
    canvas : null,
    context :  null,
    shapeSize : 50
}

let levelData = {
    fieldSize : 5,
    minAppleCount: 0,
    totalAppleCount: 0,
    currentAppleCount: 0
}

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
        Right:1,
        Down:2,
        Left:3
    }

class SnakePart {
    constructor(location) {
        this.location = new Vector2(0, 0);
        this.location.set(location);

        this.previousLocation = new Vector2(0, 0);

        this.type = SnakeBlockType.Body;
    }
}

class Apple {
    constructor(location) {
        this.location  = new Vector2(0, 0);
        this.location.set(location);

        this.collected = false;
    }
}

class Wall {
    constructor(location) {
        this.location = new Vector2(0, 0);
        this.location.set(location);
    }
}

class FinishPoint{
    constructor(location) {
        this.location = new Vector2(0, 0);
        this.location.set(location);
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
    walls:[]
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
    drawAppleColor: function (apple) {
        if (Statics.context != null) {
            Statics.context.fillStyle = apple.collected ? 'black' : 'yellow';
            Statics.context.fillRect(Statics.shapeSize * 0.25 + Statics.shapeSize * apple.location.x, Statics.shapeSize * 0.25 + Statics.shapeSize * apple.location.y, Statics.shapeSize * 0.75, Statics.shapeSize * 0.75);
        }
    },
    drawWallColor: function (wall) {
        if (Statics.context != null) {
            Statics.context.fillStyle = 'black';
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
    }
}

function clearLevelData()
{
    //clear previous data
    gameObjects.walls = [];
    gameObjects.apples = [];
    gameObjects.snake = [];
}