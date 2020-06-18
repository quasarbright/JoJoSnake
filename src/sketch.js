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
let keyFrameMode = false;
let nextFrameRequested = false;
let restart = true;

function preload() {
    soundFormats('mp3')
    backgroundMusic = loadSound("sounds/sdc.mp3")
    toiletImg = loadImage('images/toilet.png');
}

let playerMoveCount = 0;
let enemyMoveCount = 0;

function drawPieces() {
    let tail = game.tail;
    for (let piece of tail) {
        fill(255, 0, 0);
        rect(piece.x * tileWidth, piece.y * tileHeight, tileWidth, tileHeight);
    }

    for (let enemyPos of game.enemyPositions) {
        fill(0, 255, 0);
        rect(enemyPos.x * tileWidth, enemyPos.y * tileHeight, tileWidth, tileHeight);
    }

    fill(255, 255, 255);
    image(toiletImg, game.fruitPos.x * tileWidth, game.fruitPos.y * tileHeight, tileWidth, tileHeight);

}

function setup() {
    getAudioContext().suspend()
    createCanvas(400, 400);
    frameRate(60);
    game = new Game();
    tileWidth = width / game.width;
    tileHeight = height / game.height;

    drawPieces();
    backgroundMusic.loop()
}

function* next_frame() {
    while (true) {
        if (playerMoveCount % 10 === 0) {
            lastMove = playerMoving;
            game.movePlayer(playerMoving);
            enemyMoveCount += 1;
            enemyMoveCount %= 3;
        }
        playerMoveCount += 1;
        playerMoveCount %= 10;

        if (enemyMoveCount % 3 === 0) {
            game.updateEnemies();
            enemyMoveCount += 1;
        }
        yield true;
    }
}

const frame_generator = next_frame();

function draw() {

    background(51);

    if (restart) {
        game = new Game();
        restart = false;
    }

    if (!keyFrameMode) {
        frame_generator.next();
    }
    else if (keyFrameMode) {
        if (nextFrameRequested) {
            frame_generator.next();
            nextFrameRequested = false;
        }
    }

    drawPieces();

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
            if (keyFrameMode) {
                nextFrameRequested = true;
            }
            break
        case 87:
            requestedChange = UP;
            break
        case 83:
            requestedChange = DOWN;
            break
        case 75: // k - keyframe mode
            keyFrameMode = !keyFrameMode;
            break
        case 82: // r - restart
            restart = true;
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