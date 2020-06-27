let tileHeight;
let tileWidth;

const PLAYERTICKRATE = 10;
const DIFFICULTY = 3;
const ENEMYTICKRATE = PLAYERTICKRATE * DIFFICULTY;
const ZAWARDUODISTANCE = 5;

let playerMoveCount = 0;
let enemyMoveCount = 0;

let backgroundMusic;

let toiletImg;
let backgroundImg;
let keyFrameMode = false;
let nextFrameRequested = false;
let restart = false;
let alessiImg;
let anubisImg;
let death_13Img;
let devoImg;
let dioImg;
let enyaImg;
let holImg;
let geilImg;
let creamImg;
let judgementImg
let iggyImg
let chariotImg

function preload() {
    soundFormats('mp3')
    backgroundMusic = loadSound("sounds/sdc.mp3")
    toiletImg = loadImage('images/toilet.png');
    backgroundImg = loadImage('images/lean.jpg')
    alessiImg = loadImage('images/alessi.png')
    anubisImg = loadImage('images/anubis.png')
    death_13Img = loadImage('images/death_13.png')
    devoImg = loadImage('images/devo_ebony_devil.png')
    dioImg = loadImage('images/dio.jpg')
    enyaImg = loadImage('images/enya.png')
    holImg = loadImage('images/hol_horse.png')
    geilImg = loadImage('images/j_geil_hanged man.jpg')
    creamImg = loadImage('images/vanilla_ice_cream.png')
    judgementImg = loadImage('images/hail2u.png')
    iggyImg = loadImage('images/iggy.png')
    chariotImg = loadImage('images/silver_chariot.jpg')
}

let curStage;

function taxiDistance(vector1, vector2) {
    return ((vector) => {
        return Math.abs(vector.x) + Math.abs(vector.y)
    })(p5.Vector.sub(vector1, vector2));
}

function setup() {
    curStage = new Home();
    createCanvas(800, 800);
    frameRate(60);
    enemyInfos = [
        // img, onSpawn, onDeath, health
        {img: alessiImg, onSpawn: () => null, onDeath: () => null, health: 5},
        {img: anubisImg, onSpawn: () => null, onDeath: () => null, health: 6},
        {img: death_13Img, onSpawn: () => null, onDeath: () => null, health: 8},
        {img: devoImg, onSpawn: () => null, onDeath: () => null, health: 8},
        {
            img: dioImg, onSpawn: () => null, onDeath: () => null, health: 15, power: (outerGame) => {
                // ZA WARUDO
                const old_generator = outerGame._nextFrame;
                let zaWarudoTicks = 0;
                const player = outerGame.getHead();
                let dio = outerGame.enemies.filter(enemy => enemy.id === "DIO");
                if (dio.length > 0) {
                    dio = dio[0];
                }
                let targetPos = dio.toiletSeeker ? outerGame.fruitPos : player;
                const distance = taxiDistance(targetPos, dio.position)
                console.log("distance is: " + distance)
                if (distance < ZAWARDUODISTANCE && !dio.hasFruit) {
                    enemyMoveCount = 0; // hijack enemy move count and frame generator
                    outerGame._nextFrame = function* (game) {
                        while (zaWarudoTicks < ENEMYTICKRATE * 5) {
                            // update enemies
                            enemyMoveCount += 1;
                            enemyMoveCount %= ENEMYTICKRATE;
                            if (enemyMoveCount === 0) {
                                dio.move(game);
                            }
                            zaWarudoTicks += 1;
                            yield;
                        }
                        game._nextFrame = old_generator;
                        yield;
                    }(outerGame);
                }
            },
            id: "DIO"
        },
        {img: enyaImg, onSpawn: () => null, onDeath: () => null, health: 9},
        {img: holImg, onSpawn: () => null, onDeath: () => null, health: 5},
        {img: geilImg, onSpawn: () => null, onDeath: () => null, health: 10},
        {img: creamImg, onSpawn: () => null, onDeath: () => null, health: 11},
        {img: judgementImg, onSpawn: () => null, onDeath: () => null, health: 10},
        {img: iggyImg, onSpawn: () => null, onDeath: () => null, health: 10}
    ]
}

function draw() {

    image(backgroundImg, 0, 0, width, height)
    background(0, 200);

    curStage = curStage.nextStage();
    curStage.nextFrame();
    curStage.draw();
}

function keyPressed() {
    curStage.processKey();
}

function mousePressed() {
    curStage.processMouse();
}