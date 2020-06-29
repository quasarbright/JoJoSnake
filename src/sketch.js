let tileHeight;
let tileWidth;

const PLAYERTICKRATE = 10;
const DIFFICULTY = 2;
const ENEMYTICKRATE = PLAYERTICKRATE * DIFFICULTY;
const CHARIOTTICKRATE = PLAYERTICKRATE;
const ZAWARDUODISTANCE = 5;

let playerMoveCount = 0;
let enemyMoveCount = 0;
let zaWarudoTicks = 0; // for how long zawarudo has been going for

let backgroundMusic;
let silverChariotSound;
let flushSound;
let lalihoSound;
let babySound;

let toiletImg;
let backgroundImg;
let dioBackgroundImg;
let normalBackgroundImg; // for swapping purposes
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
let judgementImg;
let iggyImg;
let chariotImg
let polBottom;
let polMiddle;
let polCorner;
let polTop;

let ZAWARUDOSOUND;
let MUDAMUDASOUND;
let DIOSPAWNSOUND;


function preload() {
    soundFormats('mp3')
    backgroundMusic = loadSound("sounds/sdc.mp3");

    // load sound effects
    ZAWARUDOSOUND = loadSound("sounds/ZAWARUDO.mp3");
    flushSound = loadSound("sounds/flush.mp3")

    // load onspawn sounds
    silverChariotSound = loadSound("sounds/silver_chariot.mp3")
    DIOSPAWNSOUND = loadSound("sounds/DIOSPAWN.mp3");
    lalihoSound = loadSound("sounds/laliho.mp3")

    // load ondeath sounds
    MUDAMUDASOUND = loadSound("sounds/DIODEATHMUDA.mp3")
    babySound = loadSound("sounds/baby.mp3")

    // load images
    toiletImg = loadImage('images/toilet.png');
    backgroundImg = loadImage('images/lean.jpg')
    dioBackgroundImg = loadImage('images/diobg.png')
    normalBackgroundImg = backgroundImg
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
    polBottom = loadImage('images/pol_bottom.png')
    polMiddle = loadImage('images/pol_middle.png')
    polCorner = loadImage('images/pol_corner.png')
    polTop = loadImage('images/pol_top.png')
}

let curStage;

function taxiDistance(vector1, vector2) {
    return ((vector) => {
        return Math.abs(vector.x) + Math.abs(vector.y)
    })(p5.Vector.sub(vector1, vector2));
}

let invertFactorExpand = {start: 0, end: 1, property: "factor"}
let invertFactorContract = {start: 1, end: 0, property: "factor"}
let expand;
let contract;
let curAnimationStage;

function setup() {
    curStage = new Home();
    createCanvas(800, 800);
    frameRate(60);
    let _enemyInfos;
    _enemyInfos = [
        {
            img: dioImg, onSpawn: () => {
                backgroundImg = dioBackgroundImg;
                DIOSPAWNSOUND.play();
            }, onDeath: () => {
                backgroundImg = normalBackgroundImg;
                DIOSPAWNSOUND.stop();
                MUDAMUDASOUND.play();
            }, health: 15, power: (outerGame) => {
                let targetPos = outerGame.dio.toiletSeeker ? outerGame.fruitPos : outerGame.getHead();
                const distance = taxiDistance(targetPos, outerGame.dio.position)
                if (distance < ZAWARDUODISTANCE && !outerGame.dio.hasFruit) {
                    expand = new AnimationStage([invertFactorExpand], 1, 2);
                    contract = new AnimationStage([invertFactorContract], 0, 2);
                    expand.nextStage = contract;
                    curAnimationStage = expand;
                    zaWarudoTicks = 0;
                    backgroundMusic.pause();
                    DIOSPAWNSOUND.stop();
                    ZAWARUDOSOUND.play();
                    outerGame.dioTimeStopped = true;
                    outerGame.inversionFactor = 0;
                    outerGame.inversionInProgress = true;
                    setTimeout(() => {
                        outerGame.inversionInProgress = false;
                        enemyMoveCount = 0; // hijack enemy move count and frame generator
                    }, 4000);
                }
            },
            id: "DIO"
        }
    ]
    enemyInfos = [
        // img, onSpawn, onDeath, health
        {
            img: alessiImg, onSpawn: () => null, onDeath: () => null, health: 5, id: "ALESSI", power: (outerGame) => {

            }
        },
        {
            img: anubisImg, onSpawn: () => null, onDeath: () => null, health: 6, id: "ANUBIS", power: (outerGame) => {

            }
        },
        {
            img: death_13Img,
            onSpawn: () => lalihoSound.play(),
            onDeath: () => babySound.play(),
            health: 8,
            id: "DEATH_13",
            power: (outerGame) => {

            }
        },
        {img: devoImg, onSpawn: () => null, onDeath: () => null, health: 8, id: "DEVO"},
        {
            img: dioImg, onSpawn: () => {
                backgroundImg = dioBackgroundImg;
                DIOSPAWNSOUND.play();
            }, onDeath: () => {
                backgroundImg = normalBackgroundImg;
                DIOSPAWNSOUND.stop();
                MUDAMUDASOUND.play();
            }, health: 15, power: (outerGame) => {
                let targetPos = outerGame.dio.toiletSeeker ? outerGame.fruitPos : outerGame.getHead();
                const distance = taxiDistance(targetPos, outerGame.dio.position)
                if (distance < ZAWARDUODISTANCE && !outerGame.dio.hasFruit) {
                    expand = new AnimationStage([invertFactorExpand], 1, 2);
                    contract = new AnimationStage([invertFactorContract], 0, 2);
                    expand.nextStage = contract;
                    curAnimationStage = expand;
                    zaWarudoTicks = 0;
                    backgroundMusic.pause();
                    DIOSPAWNSOUND.stop();
                    ZAWARUDOSOUND.play();
                    outerGame.dioTimeStopped = true;
                    outerGame.inversionFactor = 0;
                    outerGame.inversionInProgress = true;
                    setTimeout(() => {
                        outerGame.inversionInProgress = false;
                        enemyMoveCount = 0; // hijack enemy move count and frame generator
                    }, 4000);
                }
            },
            id: "DIO"
        },
        {img: enyaImg, onSpawn: () => null, onDeath: () => null, health: 9, id: "ENYA"},
        {img: holImg, onSpawn: () => null, onDeath: () => null, health: 5, id: "HOL"},
        {img: geilImg, onSpawn: () => null, onDeath: () => null, health: 10, id: 'GEIL'},
        {img: creamImg, onSpawn: () => null, onDeath: () => null, health: 11, id: "CREAM"},
        {img: judgementImg, onSpawn: () => null, onDeath: () => null, health: 10, id: "JUDGEMENT"},
        {img: iggyImg, onSpawn: () => null, onDeath: () => null, health: 10, id: "IGGY"}
    ]

}

function draw() {

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