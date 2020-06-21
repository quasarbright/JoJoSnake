let tileHeight;
let tileWidth;
let playerMoveCount = 0;
let enemyMoveCount = 0;
let backgroundMusic;

let toiletImg;
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

let curStage;

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
        {img: dioImg, onSpawn: () => null, onDeath: () => null, health: 15},
        {img: enyaImg, onSpawn: () => null, onDeath: () => null, health: 9},
        {img: holImg, onSpawn: () => null, onDeath: () => null, health: 5},
        {img: geilImg, onSpawn: () => null, onDeath: () => null, health: 10},
        {img: creamImg, onSpawn: () => null, onDeath: () => null, health: 11}
    ]
}

function draw() {

    background(51);

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