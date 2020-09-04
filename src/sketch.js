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
let alessiSpawnSound, alessiDeathSound
let anubisSpawnSound, anubisDeathSound
let devoSpawnSound, devoDeathSound
let enyaSpawnSound, enyaDeathSound
let holSpawnSound, holDeathSound
let geilSpawnSound, geilDeathSound
let creamSpawnSound, creamDeathSound
let judgementSpawnSound, judgementDeathSound
let iggySpawnSound, iggyDeathSound

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
    alessiSpawnSound = loadSound("sounds/alessi_spawn.mp3")
    anubisSpawnSound = loadSound("sounds/anubis_spawn.mp3")
    devoSpawnSound = loadSound("sounds/devo_spawn.mp3")
    enyaSpawnSound = loadSound("sounds/enya_spawn.mp3")
    holSpawnSound = loadSound("sounds/hol_spawn.mp3")
    geilSpawnSound = loadSound("sounds/geil_spawn.mp3")
    creamSpawnSound = loadSound("sounds/cream_spawn.mp3")
    judgementSpawnSound = loadSound("sounds/judgement_spawn.mp3")
    iggySpawnSound = loadSound("sounds/iggy_spawn.mp3")

    // load ondeath sounds
    MUDAMUDASOUND = loadSound("sounds/DIODEATHMUDA.mp3")
    babySound = loadSound("sounds/baby.mp3")
    alessiDeathSound = loadSound("sounds/alessi_death.mp3")
    anubisDeathSound = loadSound("sounds/anubis_death.mp3")
    devoDeathSound = loadSound("sounds/devo_death.mp3")
    enyaDeathSound = loadSound("sounds/enya_death.mp3")
    holDeathSound = loadSound("sounds/hol_death.mp3")
    geilDeathSound = loadSound("sounds/geil_death.mp3")
    creamDeathSound = loadSound("sounds/cream_death.mp3")
    judgementDeathSound = loadSound("sounds/judgement_death.mp3")
    iggyDeathSound = loadSound("sounds/iggy_death.mp3")

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
            img: alessiImg, onSpawn: () => alessiSpawnSound.play(), onDeath: () => alessiDeathSound.play(), health: 5, id: "ALESSI", power: (outerGame) => {

            }
        },
        {
            img: anubisImg, onSpawn: () => anubisSpawnSound.play(), onDeath: () => anubisDeathSound.play(), health: 6, id: "ANUBIS", power: (outerGame) => {

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
        {img: devoImg, onSpawn: () => devoSpawnSound.play(), onDeath: () => devoDeathSound.play(), health: 8, id: "DEVO"},
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
        {img: enyaImg, onSpawn: () => enyaSpawnSound.play(), onDeath: () => enyaDeathSound.play(), health: 9, id: "ENYA"},
        {img: holImg, onSpawn: () => holSpawnSound.play(), onDeath: () => holDeathSound.play(), health: 5, id: "HOL"},
        {img: geilImg, onSpawn: () => geilSpawnSound.play(), onDeath: () => geilDeathSound.play(), health: 10, id: 'GEIL'},
        {img: creamImg, onSpawn: () => creamSpawnSound.play(), onDeath: () => creamDeathSound.play(), health: 11, id: "CREAM"},
        {img: judgementImg, onSpawn: () => judgementSpawnSound.play(), onDeath: () => judgementDeathSound.play(), health: 10, id: "JUDGEMENT"},
        {img: iggyImg, onSpawn: () => iggySpawnSound.play(), onDeath: () => iggyDeathSound.play(), health: 10, id: "IGGY"}
    ]
    curStage = new Home();

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