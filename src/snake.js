let enemyInfos;

let D_UP = "D_UP"
let D_DOWN = "D_DOWN"
let D_LEFT = "D_LEFT"
let D_RIGHT = "D_RIGHT"

function vectorOfDirection(direction) {
    switch (direction) {
        case D_UP:
            return createVector(0, -1);
            break;
        case D_DOWN:
            return createVector(0, 1);
            break;
        case D_LEFT:
            return createVector(-1, 0);
            break;
        case D_RIGHT:
            return createVector(1, 0);
            break;
        default:
            console.error(direction);
    }
}

function choose(list) {
    return list[Math.floor(Math.random() * list.length)]
}

class GameStage {
    nextFrame() {
    };

    draw() {
    };

    nextStage() {
    };

    processKey() {
    };

    processMouse() {
    }
}

class Home extends GameStage {

    playPressed;

    speed = 5;

    constructor() {
        super();

        this.stage = new AnimationStage([{start: 0, end: 1, property: "factor"}, {start: 0, end: 2 * PI, property: "rotation"}], 0, 3)
        this.stage.nextStage = this.stage;

        this.homeInfos = []
        for (let enemy of enemyInfos) {
            enemy.direction = p5.Vector.random2D();
            enemy.position = createVector(width/2, height/2);
            this.homeInfos.push(enemy);
        }
    }

    nextStage() {
        if (this.playPressed) {
            return new Game();
        } else {
            return this;
        }
    }

    draw() {

        fill(0, 255, 0);
        image(backgroundImg, 0, 0, width, height);
        background(0, 200);
        this.stage.tick();
        let view = this.stage.view();
        let rotation = view.rotation;
        let factor = view.factor;
        let y = sin(rotation) * (width/2);
        let x = cos(rotation) * (width/2);
        image(polBottom, x + width/2, y + width/2, 100, 100);
        
        y = sin(-1 * rotation) * (width/2);
        x = cos(rotation) * (width/2);
        image(polMiddle, x + width/2, y + width/2, 100, 100);

        y = sin(rotation % PI) * (width/2);
        x = cos(rotation % PI) * (width/2);
        image(polCorner, x + width/2, y + width/2, 100, 100);

        y = sin(-1 * rotation % PI) * (width/2);
        x = cos(-1 * rotation % PI) * (width/2);
        image(polTop, x + width/2, y + width/2, 100, 100);

        // triangle(x, x, x + 15, x + 15, x - 15, x - 15);

        for (let info of this.homeInfos) {
            image(info.img, info.position.x, info.position.y, width/6, height/6);
            info.position = p5.Vector.add(info.position, createVector(info.direction.x * this.speed, info.direction.y * this.speed))
            this.checkBounds(info);
        }

        textSize(64);
        textAlign(CENTER)
        text("Click to play!", width/2, width/2)
        textAlign(LEFT)
    }

    processMouse() {
        this.playPressed = true;
        userStartAudio();
        backgroundMusic.setVolume(0.8)
        backgroundMusic.loop();
    }

    checkBounds(info) {
        let iconWidth = width/6;

        if (info.position.x > (width - iconWidth)) {
            info.position.x = width - iconWidth;
            info.direction.x = -1 * info.direction.x;
        }
        if (info.position.x < 0) {
            info.position.x = 0;
            info.direction.x = -1 * info.direction.x;
        } 
        if (info.position.y > (height - iconWidth)) {
            info.position.y = height - iconWidth;
            info.direction.y = -1 * info.direction.y;
        }
        if (info.position.y < 0) {
            info.position.y = 0;
            info.direction.y = -1 * info.direction.y;
        }
    }
}

class End extends GameStage {
    clicked = false

    constructor() {
        super()
        fMegaSound.play()
        backgroundMusic.stop()
    }

    nextStage() {
        if(this.clicked) {
            fMegaSound.stop()
            backgroundMusic.loop()
            return new Game()
        } else {
            return this
        }
    }

    draw() {
        image(deathImg, 0, 0, width, height)
        textAlign(CENTER)
        fill(255,0,0)
        textSize(64)
        text("Click to restart", width/2, height/2)
        textAlign(LEFT)
    }

    processMouse() {
        this.clicked = true
    }
}

class Game extends GameStage {

    static SILVER_CHARIOT_STREAK_REQUIREMENT = 5

    constructor() {
        super();
        // first ele is head, rest is tail
        this.movementQueue = []; // the queue of moves to make when it is the players turn
        this.lastMove = D_RIGHT; // the last move the player actually made
        this.dioTimeStopped = false; // whether ZAWARUDO is active
        this.inversionFactor = 0.0; // how much to invert screen if time stopped
        this.dio = undefined;
        this.dead = false
        this.deathAcknowledged = false
        this.width = 12
        this.height = 12
        this.streak = 0
        tileWidth = width / this.width;
        tileHeight = height / this.height;
        this.allPositions = []
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                this.allPositions.push(createVector(x, y))
            }
        }
        this.tail = [createVector(floor(this.width / 2), floor(this.height / 2))]
        this.fruitPos = null
        this.enemies = []
        this.allies = []
        this.respawnFruit()
        this.spawnEnemy()
        this.fruitEatCount = 0
        this.enemySpawnPeriod = 3
        this._nextFrame = function* (game) {
            while (true) {
                if (playerMoveCount % PLAYERTICKRATE === 0) {
                    if (game.movementQueue.length === 0) {
                        game.movePlayer(game.lastMove);
                    }
                    for (let move of game.movementQueue) {
                        game.lastMove = move;
                        game.movePlayer(move);
                    }
                    game.movementQueue = [];
                }
                enemyMoveCount += 1;
                enemyMoveCount %= ENEMYTICKRATE;
                playerMoveCount += 1;
                playerMoveCount %= PLAYERTICKRATE;

                game.updateEnemies();
                game.updateAllies()

                yield;
            }
        }(this);
        this._dioNextFrame = function* (game) {
            while (true) {
                if (!game.inversionInProgress && game.dioTimeStopped) {
                    if (zaWarudoTicks <= ENEMYTICKRATE * ZAWARDUODISTANCE) {
                        // update enemies
                        enemyMoveCount += 1;
                        enemyMoveCount %= ENEMYTICKRATE;
                        if (enemyMoveCount === 0) {
                            game.dio.move(game);
                            let dead = game.enemyInPlayerOrAlly(game.dio);
                            if (dead) {
                                // do some stuff
                                game.dioTimeStopped = false;
                                backgroundMusic.play();
                                yield;
                            }
                        }
                        zaWarudoTicks += 1;
                        yield;
                    } else {
                        game.dioTimeStopped = false;
                        yield;
                    }
                } else {
                    yield;
                }
            }
        }(this)
    }

    nextFrame() {
        if (restart) {
            curStage = new Game();
            backgroundImg = normalBackgroundImg;
            backgroundMusic.stop();
            backgroundMusic.loop(0);
            restart = false;
        }

        if (!keyFrameMode) {
            if (!this.dioTimeStopped) {
                this._nextFrame.next();
            } else {
                this._dioNextFrame.next();
            }
        } else if (keyFrameMode) {
            if (nextFrameRequested) {
                if (!this.dioTimeStopped) {
                    this._nextFrame.next();
                } else {
                    this._dioNextFrame.next();
                }
                nextFrameRequested = false;
            }
        }
    }

    draw() {

        image(backgroundImg, 0, 0, width, height);
        background(0, 200);

        fill(255, 255, 255);

        for (let i = 0; i < this.tail.length; i++) {
            push()
            imageMode(CENTER)
            let piece = this.tail[i]
            translate((piece.x + 1 / 2) * tileWidth, (piece.y + 1 / 2) * tileHeight)
            let sprite
            if (i === 0) {
                sprite = polBottom
                switch (this.lastMove) {
                    case D_DOWN:
                        break;
                    case D_UP:
                        rotate(PI);
                        break;
                    case D_RIGHT:
                        rotate(-PI / 2);
                        break;
                    case D_LEFT:
                        rotate(PI / 2);
                        break;
                    default:
                        console.error("unknown last move")
                        break;
                }
            } else if (i > 0 && i < this.tail.length - 1) {
                let prev = this.tail[i - 1]
                let next = this.tail[i + 1]
                let toPrev = p5.Vector.sub(prev, piece)
                let toNext = p5.Vector.sub(next, piece)
                if (toPrev.equals(createVector(-1, 0)) && toNext.equals(createVector(1, 0))) {
                    rotate(PI / 2)
                    sprite = polMiddle
                } else if (toPrev.equals(createVector(1, 0)) && toNext.equals(createVector(-1, 0))) {
                    rotate(-PI / 2)
                    sprite = polMiddle
                } else if (toPrev.equals(createVector(0, 1)) && toNext.equals(createVector(0, -1))) {
                    sprite = polMiddle
                } else if (toPrev.equals(createVector(0, -1)) && toNext.equals(createVector(0, 1))) {
                    rotate(PI)
                    sprite = polMiddle
                } else if (toPrev.equals(createVector(0, 1)) && toNext.equals(-1, 0)) {
                    sprite = polCorner
                } else if (toPrev.equals(createVector(-1, 0)) && toNext.equals(0, -1)) {
                    rotate(PI / 2)
                    sprite = polCorner
                } else if (toPrev.equals(createVector(0, -1)) && toNext.equals(1, 0)) {
                    rotate(PI)
                    sprite = polCorner
                } else if (toPrev.equals(createVector(1, 0)) && toNext.equals(0, 1)) {
                    rotate(-PI / 2)
                    sprite = polCorner
                } else if (toPrev.equals(createVector(0, 1)) && toNext.equals(1, 0)) {
                    scale(-1, 1)
                    sprite = polCorner
                } else if (toPrev.equals(createVector(-1, 0)) && toNext.equals(0, 1)) {
                    rotate(PI / 2)
                    scale(1, -1)
                    sprite = polCorner
                } else if (toPrev.equals(createVector(0, -1)) && toNext.equals(-1, 0)) {
                    rotate(PI)
                    scale(-1, 1)
                    sprite = polCorner
                } else if (toPrev.equals(createVector(1, 0)) && toNext.equals(0, -1)) {
                    rotate(-PI / 2)
                    scale(1, -1)
                    sprite = polCorner
                }
            } else if (i > 0 && i === this.tail.length - 1) {
                let prev = this.tail[i - 1]
                let toPrev = p5.Vector.sub(prev, piece)
                sprite = polTop
                if (toPrev.equals(createVector(0, -1))) {
                    rotate(PI)
                } else if (toPrev.equals(createVector(-1, 0))) {
                    rotate(PI / 2)
                } else if (toPrev.equals(createVector(1, 0))) {
                    rotate(-PI / 2)
                } else if (toPrev.equals(createVector(0, 1))) {
                }
            }
            image(sprite, 0, 0, tileWidth, tileHeight)
            pop()
            // rect(piece.x * tileWidth, piece.y * tileHeight, tileWidth, tileHeight);
        }

        for (let enemy of this.enemies) {
            image(enemy.sprite, enemy.position.x * tileWidth, enemy.position.y * tileHeight, tileWidth, tileHeight);
        }

        for (let ally of this.allies) {
            image(ally.sprite, ally.position.x * tileWidth, ally.position.y * tileHeight, tileWidth, tileHeight)
        }

        image(toiletImg, this.fruitPos.x * tileWidth, this.fruitPos.y * tileHeight, tileWidth, tileHeight);

        // score screen
        textSize(16);
        let score = `Score: ${this.tail.length}`
        let rectYOffset = textAscent()
        text(score, 5, rectYOffset)
        let scoreWidth = textWidth(score);
        let streakStr = "Streak: ";
        let streakWidth = textWidth(streakStr);
        let outerRectWidth = width / 5.0;
        let innerRectWidth = (outerRectWidth * (Math.min(Game.SILVER_CHARIOT_STREAK_REQUIREMENT, this.streak) / Game.SILVER_CHARIOT_STREAK_REQUIREMENT));
        fill(0, 255, 0)
        text(streakStr, scoreWidth + 10, rectYOffset);
        fill(128, 128, 128);
        rect(scoreWidth + streakWidth + 10, 5, outerRectWidth, 10);
        fill(0, 255, 0);
        rect(scoreWidth + streakWidth + 10, 5, innerRectWidth, 10);

        if (this.dioTimeStopped) {
            curAnimationStage = curAnimationStage.tick();
            if (this.inversionInProgress && curAnimationStage.curTime > curAnimationStage.startTime && curAnimationStage.curTime < curAnimationStage.endTime) {
                // calculate new inversion factor
                this.inversionFactor = curAnimationStage.view().factor;
                let widthAmt = Math.ceil(width * this.inversionFactor);
                let heightAmt = Math.ceil(height * this.inversionFactor);
                let centerX = width / 2;
                let centerY = height / 2;
                let x = centerX - (widthAmt / 2);
                let y = centerY - (heightAmt / 2);
                let cutOut = get(x, y, widthAmt, heightAmt);
                filter(INVERT);
                image(cutOut, x, y);
                filter(INVERT);
            }
        }
    }

    nextStage() {
        if(this.dead) {
            return new End();
        } else {
            return this;
        }
    }

    processKey() {
        let requestedChange;
        switch (keyCode) {
            case LEFT_ARROW:
                requestedChange = D_LEFT;
                break
            case RIGHT_ARROW:
                if (keyFrameMode) {
                    nextFrameRequested = true;
                }
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
            case 75: // k - keyframe mode
                keyFrameMode = !keyFrameMode;
                if (keyFrameMode) {
                    backgroundMusic.pause();
                } else {
                    backgroundMusic.play();
                }
                break
            case 82: // r - restart
                restart = true;
                break
        }
        if (!this.dioTimeStopped) {
            if (requestedChange !== undefined) {
                if ((this.lastMove === D_LEFT && requestedChange !== D_RIGHT) ||
                    (this.lastMove === D_RIGHT && requestedChange !== D_LEFT) ||
                    (this.lastMove === D_UP && requestedChange !== D_DOWN) ||
                    (this.lastMove === D_DOWN && requestedChange !== D_UP)) {
                    this.lastMove = requestedChange
                    let found = this.movementQueue.find((val) => {
                        return val === this.lastMove;
                    });
                    if (found === undefined) {
                        this.movementQueue.push(this.lastMove);
                    }
                }
            }
        }
    }

    getHead() {
        return this.tail[0]
    }

    isInTail(pos) {
        // DOESN'T INCLUDE HEAD
        let ans = false
        this.tail.slice(1).forEach(tailPos => {
            if (pos.equals(tailPos)) {
                ans = true
            }
        })
        return ans
    }

    movePlayer(direction) {
        if (!this.dead) {
            direction = vectorOfDirection(direction)
            let newPos = p5.Vector.add(this.getHead(), direction)
            this.tail.unshift(newPos)
            if (this.getHead().equals(this.fruitPos)) {
                this.onFruitEat();
            } else {
                this.tail.pop()
            }
        }
        this.updateDead()
    }

    isInBounds(pos) {
        return pos.x >= 0 && pos.x < this.width && pos.y >= 0 && pos.y < this.height
    }

    onFruitEat() {
        flushSound.play()
        this.streak++
        if (this.streak === Game.SILVER_CHARIOT_STREAK_REQUIREMENT) {
            this.silverChariot()
        }
        this.respawnFruit()
        this.fruitEatCount++
        if (this.fruitEatCount % this.enemySpawnPeriod === 0) {
            this.spawnEnemy()
        }
    }

    onDeath() {
        if (!this.deathAcknowledged) {
            backgroundMusic.pause()
            this.deathAcknowledged = true
        }
    }

    respawnFruit() {
        this.fruitPos = this.generatePositionNotInTail();
    }

    silverChariot() {
        this.allies.push(new silverChariot(this.getHead().copy()))
    }

    generatePositionNotInTail() {
        let goodPositions = this.allPositions.filter((pos) => !this.isInTail(pos) && !pos.equals(this.getHead()))
        return choose(goodPositions).copy()
    }

    shouldBeDead() {
        let head = this.getHead()
        return this.isInTail(head) || !this.isInBounds(head);
    }

    updateDead() {
        this.dead = this.dead || this.shouldBeDead()
        if (this.dead) {
            this.onDeath()
        }
    }

    addEnemy(enemy) {
        this.enemies.push(enemy)
    }

    takeHit() {
        this.streak = 0
        if (this.tail.length > 1) {
            this.tail.pop();
        } else if (this.tail.length === 1) {
            this.dead = true;
        }
    }

    positionHasEnemy(p) {
        for (let enemy of this.enemies) {
            if (enemy.position.equals(p)) {
                return enemy
            }
        }
        return false
    }

    updateEnemies() {
        if (this.dead) {
            return;
        }
        // check if enemies are at player
        if (!this.dioTimeStopped) {
            for (let i = this.enemies.length - 1; i >= 0; i--) {
                let enemy = this.enemies[i]
                let enemyDead = this.enemyInPlayerOrAlly(enemy);
                if (!enemyDead) {
                    if (enemyMoveCount % ENEMYTICKRATE === 0) {
                        enemy.move(this);
                        enemy.power(this);
                    }
                    this.enemyInPlayerOrAlly(enemy);
                }
            }
        }
    }

    enemyInPlayerOrAlly(enemy) {
        let index = this.enemies.indexOf(enemy);
        for (let ally of this.allies) {
            if (ally.position.equals(enemy.position)) {
                ally.health--
                if (enemy.id === "DIO") {
                    ally.health = 0;
                }
                this.enemies.splice(index, 1);
                enemy.onDeath();
                return true;
            }
        }
        if (enemy.position.equals(this.getHead())) {
            if (enemy.id === "DIO") {
                let hitNumber = Math.max(Math.floor(this.tail.length / 3), 1);
                for (let i = 0; i < hitNumber; i++) {
                    this.takeHit();
                }
            } else {
                this.takeHit();
            }
            this.enemies.splice(index, 1);
            enemy.onDeath();
            return true;
        }
        return false;
    }

    updateAllies() {
        if (enemyMoveCount % CHARIOTTICKRATE === 0) {
            for (let i = this.allies.length - 1; i >= 0; i--) {
                let ally = this.allies[i]
                if (ally.health <= 0) {
                    this.allies.splice(i, 1)
                    ally.onDeath()
                    if (ally.id === "silver chariot") {
                        this.streak = 0
                    }
                } else {
                    ally.move(this)
                }
            }
        }
    }

    spawnEnemy() {
        let info = choose(enemyInfos)
        let position = this.generatePositionNotInTail()
        let enemy = new Enemy(position, info.id, info.img, info.onSpawn, info.onDeath, info.health, info.power)
        if (enemy.id === "DIO") {
            if (this.enemies.find((enemy) => enemy.id === "DIO") !== undefined) {
                this.spawnEnemy();
                return;
            } else {
                this.dio = enemy;
            }
        }
        this.addEnemy(enemy)
        enemy.onSpawn()
    }


}

class Enemy {
    static toilerSeekerProbability = 0.2;

    constructor(position, id, sprite, onSpawn, onDeath, health, power) {
        this.hasFruit = false;
        this.position = position
        this.sprite = sprite
        this.onSpawn = onSpawn
        this.onDeath = onDeath
        this.health = health
        if (power !== undefined) {
            this.power = power;
        } else {
            this.power = (game) => {
            };
        }
        if (id !== undefined) {
            this.id = id;
        } else {
            this.id = "NAMELESS";
        }
        this.toiletSeeker = Math.random() <= Enemy.toilerSeekerProbability;
    }

    move(game) {
        if (this.position.equals(game.fruitPos)) {
            this.hasFruit = true
            this.toiletSeeker = true
            game.fruitPos = this.position
        }
        let target
        let seeking = !this.toiletSeeker || !this.hasFruit
        if (!this.toiletSeeker || this.hasFruit) {
            target = game.getHead()
        } else {
            target = game.fruitPos
        }

        let goodDir = dir => {
            let newPos = p5.Vector.add(dir, this.position)
            return !game.positionHasEnemy(newPos) && game.isInBounds(newPos)
        }

        let dirVectors = this.getDirVectors(target, seeking, goodDir)
        dirVectors = dirVectors.filter(dir => {
            let newPos = p5.Vector.add(dir, this.position)
            return !game.positionHasEnemy(newPos) && game.isInBounds(newPos)
        })
        if (dirVectors.length > 0) {
            let dir = dirVectors[0]
            this.position.add(dir)
        }
    }

    /**
     * gets legal movement vectors sorted in decreasing optimality
     *
     * @param {pt.Vector} target
     * @param {boolean} seeking
     */
    getDirVectors(target, seeking) {
        let dirs = [createVector(1, 0), createVector(-1, 0), createVector(0, 1), createVector(0, -1)]
        let key
        let disp = p5.Vector.sub(target, this.position)
        if (seeking) {
            key = dir => dir.dot(disp)
        } else {
            key = dir => -dir.dot(disp)
        }
        dirs.sort((a, b) => key(b) - key(a)) // sort backward

        return dirs
    }
}

class silverChariot extends Enemy {
    constructor(position) {
        let nothing = () => {
        }
        let health = Math.floor(Math.random() * 4 + 2)
        silverChariotSound.play()
        super(position, "silver chariot", chariotImg, nothing, nothing, health, nothing)
    }

    move(game) {
        let enemyPositions = game.enemies.map(e => e.position)
        let target = argmax(enemyPositions, p => taxiDistance(this.position, p))
        if (target === undefined) {
            target = game.getHead().copy()
        }
        let dirVectors = this.getDirVectors(target, true, game)
        if (dirVectors.length > 0) {
            let dir = dirVectors[0]
            this.position.add(dir)
        }
    }
}

function argmax(xs, key) {
    let max
    let maxVal = Number.NEGATIVE_INFINITY
    xs.forEach(x => {
        val = key(x)
        if (val > maxVal) {
            max = x
            maxVal = val
        }
    });
    return max
}