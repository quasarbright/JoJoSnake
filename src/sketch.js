let tail = []
let fruitPos = null
let enemyPositions = []
let tileHeight;
let tileWidth;
let game;
let playerMoving = RIGHT;
let lastMove = playerMoving;
let backgroundMusic;
let toiletImg;

function preload() {
    soundFormats('mp3')
    backgroundMusic = loadSound("sounds/sdc.mp3")
    toiletImg = loadImage('images/toilet.png');
}

let playerMoveCount = 0;
let enemyMoveCount = 0;

function setup() {
    getAudioContext().suspend()
    createCanvas(400, 400);
    frameRate(60);
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

    image(toiletImg, game.fruitPos.x * tileWidth, game.fruitPos.y * tileHeight, tileWidth, tileHeight);
    backgroundMusic.loop()
}

function draw() {

    background(51);

    fill(255, 255, 255);
    image(toiletImg, game.fruitPos.x * tileWidth, game.fruitPos.y * tileHeight, tileWidth, tileHeight);

    if (playerMoveCount % 10 === 0) {
        lastMove = playerMoving;
        game.movePlayer(playerMoving);
        enemyMoveCount += 1;
        enemyMoveCount %= 3;
    }
    playerMoveCount += 1;
    playerMoveCount %= 10;

    let tail = game.tail;
    for (let piece of tail) {
        fill(255, 0, 0);
        rect(piece.x * tileWidth, piece.y * tileHeight, tileWidth, tileHeight);
    }

    if (enemyMoveCount % 3 === 0) {
        game.updateEnemies();
        enemyMoveCount += 1;
    }

    for (let enemyPos of game.enemyPositions) {
        fill(0, 255, 0);
        rect(enemyPos.x * tileWidth, enemyPos.y * tileHeight, tileWidth, tileHeight);
    }

}

function keyPressed() {
    userStartAudio()
    let requestedChange;
    switch (keyCode) {
        case LEFT_ARROW:
            requestedChange = LEFT;
            break
        case RIGHT_ARROW:
            requestedChange = RIGHT;
            break
        case UP_ARROW:
            requestedChange = UP;
            break
        case DOWN_ARROW:
            requestedChange = DOWN;
            break

        case 65:
            requestedChange = LEFT;
            break
        case 68:
            requestedChange = RIGHT;
            break
        case 87:
            requestedChange = UP;
            break
        case 83:
            requestedChange = DOWN;
            break
    }
    if (requestedChange !== undefined) {
        if (lastMove === LEFT) {
            if (requestedChange !== RIGHT) {
                playerMoving = requestedChange
            }
        }
        if (lastMove === RIGHT) {
            if (requestedChange !== LEFT) {
                playerMoving = requestedChange
            }
        }
        if (lastMove === UP) {
            if (requestedChange !== DOWN) {
                playerMoving = requestedChange
            }
        }
        if (lastMove === DOWN) {
            if (requestedChange !== UP) {
                playerMoving = requestedChange
            }
        }
    }
}

function mousePressed() {
    userStartAudio()
}