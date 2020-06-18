let tail = []
let fruitPos = null
let enemyPositions = []
let tileHeight;
let tileWidth;
let game;
let playerMoving = RIGHT;

function setup() {
    createCanvas(400, 400);
    frameRate(10);
    game = new Game();
    tileWidth = width / game.width;
    tileHeight = height / game.height;
    let tail = game.tail;
    for (let piece of tail) {
        fill(255, 0, 0);
        rect(piece.x * tileWidth, piece.y * tileHeight, tileWidth, tileHeight);
    }

    for (let enemyPos of game.enemyPositions) {
        fill(0, 255, 0);
        rect(enemyPos.x * tileWidth, enemyPos.y * tileHeight, tileWidth, tileHeight);
    }

    game.addEnemy(createVector(floor(random(0, game.width)), floor(random(0, game.height))));
}

function draw() {

    background(51);

    game.movePlayer(playerMoving);

    let tail = game.tail;
    for (let piece of tail) {
        fill(255, 0, 0);
        rect(piece.x * tileWidth, piece.y * tileHeight, tileWidth, tileHeight);
    }

    game.updateEnemies();

    for (let enemyPos of game.enemyPositions) {
        fill(0, 255, 0);
        rect(enemyPos.x * tileWidth, enemyPos.y * tileHeight, tileWidth, tileHeight);
    }

}

function keyPressed() {
    switch (keyCode) {
        case LEFT_ARROW:
            playerMoving = LEFT;
            break
        case RIGHT_ARROW:
            playerMoving = RIGHT;
            break
        case UP_ARROW:
            playerMoving = UP;
            break
        case DOWN_ARROW:
            playerMoving = DOWN;
            break

        case "KeyA":
            playerMoving = LEFT;
            break
        case "KeyD":
            playerMoving = RIGHT;
            break
        case "KeyW":
            playerMoving = UP;
            break
        case "KeyS":
            playerMoving = DOWN;
            break
    }
}
