let tileHeight;
let tileWidth;
let game;
let playerMoving = D_RIGHT;
let playerMoveCount = 0;
let enemyMoveCount = 0;
let lastMove = playerMoving;
let backgroundMusic;

let toiletImg;
let alessiImg;
let anubisImg;
let death_13Img;
let devoImg;
let dioImg;
let enyaImg;
let holImg;
let geilImg;
let creamImg;

function preload() {
    soundFormats('mp3')
    backgroundMusic = loadSound("sounds/sdc.mp3")
    toiletImg = loadImage('images/toilet.png');
    alessiImg = loadImage('images/alessi.png')
    anubisImg = loadImage('images/anubis.png')
    death_13Img = loadImage('images/death_13.png')
    devoImg = loadImage('images/devo_ebony_devil.png')
    dioImg = loadImage('images/dio.jpg')
    enyaImg = loadImage('images/enya.png')
    holImg = loadImage('images/hol_horse.png')
    geilImg = loadImage('images/j_geil_hanged man.jpg')
    creamImg = loadImage('images/vanilla_ice_cream.png')
}


function setup() {
    getAudioContext().suspend()
    createCanvas(800, 800);
    frameRate(60);
    enemyInfos = [
        [alessiImg, () => null, () => null]
        [anubisImg, () => null, () => null],
        [death_13Img, () => null, () => null],
        [devoImg, () => null, () => null],
        [dioImg, () => null, () => null],
        [enyaImg, () => null, () => null],
        [holImg, () => null, () => null],
        [geilImg, () => null, () => null],
        [creamImg, () => null, () => null],
    ]
    game = new Game();
    tileWidth = width / game.width;
    tileHeight = height / game.height;
    let tail = game.tail;
    // for (let piece of tail) {
    //     fill(255, 0, 0);
    //     rect(piece.x * tileWidth, piece.y * tileHeight, tileWidth, tileHeight);
    // }

    // for (let enemyPos of game.getEnemyPositions()) {
    //     fill(0, 255, 0);
    //     rect(enemyPos.x * tileWidth, enemyPos.y * tileHeight, tileWidth, tileHeight);
    // }

    // image(toiletImg, game.fruitPos.x * tileWidth, game.fruitPos.y * tileHeight, tileWidth, tileHeight);
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

    for (let enemy of game.enemies) {
        image(enemy.sprite, enemy.position.x * tileWidth, enemy.position.y * tileHeight, tileWidth, tileHeight);
    }

}

function keyPressed() {
    userStartAudio()
    let requestedChange;
    switch (keyCode) {
        case LEFT_ARROW:
            requestedChange = D_LEFT;
            break
        case RIGHT_ARROW:
            requestedChange = D_RIGHT;
            break
        case UP_ARROW:
            requestedChange = D_UP;
            break
        case DOWN_ARROW:
            requestedChange = D_DOWN;
            break

        case 65:
            requestedChange = D_LEFT;
            break
        case 68:
            requestedChange = D_RIGHT;
            break
        case 87:
            requestedChange = D_UP;
            break
        case 83:
            requestedChange = D_DOWN;
            break
    }
    if (requestedChange !== undefined) {
        if (lastMove === D_LEFT) {
            if (requestedChange !== D_RIGHT) {
                playerMoving = requestedChange
            }
        }
        if (lastMove === D_RIGHT) {
            if (requestedChange !== D_LEFT) {
                playerMoving = requestedChange
            }
        }
        if (lastMove === D_UP) {
            if (requestedChange !== D_DOWN) {
                playerMoving = requestedChange
            }
        }
        if (lastMove === D_DOWN) {
            if (requestedChange !== D_UP) {
                playerMoving = requestedChange
            }
        }
    }
}

function mousePressed() {
    userStartAudio()
}