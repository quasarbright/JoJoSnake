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

    nextStage() {
        if (this.playPressed) {
            return new Game();
        } else {
            return this;
        }
    }

    draw() {
        fill(0, 255, 0);
        triangle(width / 2, width / 2, width / 2 + 15, width / 2 + 15, width / 2 + 15, width / 2);
    }

    processMouse() {
        this.playPressed = true;
        userStartAudio();
        backgroundMusic.setVolume(.5)
        backgroundMusic.loop();
    }
}

class Game extends GameStage {

    movementQueue = []; // the queue of moves to make when it is the players turn
    lastMove = D_RIGHT; // the last move the player actually made
    static SILVER_CHARIOT_STREAK_REQUIREMENT = 5


    _nextFrame = function* (game) {
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
    };

    constructor() {
        super();
        // first ele is head, rest is tail

        this.dead = false
        this.deathAcknowledged = false
        this.width = 15
        this.height = 15
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
        this._nextFrame = this._nextFrame(this);
    }

    nextFrame() {
        if (restart) {
            curStage = new Game();
            backgroundMusic.stop();
            backgroundMusic.play(0);
            restart = false;
        }

        if (!keyFrameMode) {
            this._nextFrame.next();
        } else if (keyFrameMode) {
            if (nextFrameRequested) {
                this._nextFrame.next();
                nextFrameRequested = false;
            }
        }

    }

    draw() {
        fill(255, 255, 255);

        let tail = this.tail;
        for (let piece of tail) {
            fill(255, 0, 0);
            rect(piece.x * tileWidth, piece.y * tileHeight, tileWidth, tileHeight);
        }

        for (let enemy of this.enemies) {
            image(enemy.sprite, enemy.position.x * tileWidth, enemy.position.y * tileHeight, tileWidth, tileHeight);
        }

        for (let ally of this.allies) {
            image(ally.sprite, ally.position.x * tileWidth, ally.position.y * tileHeight, tileWidth, tileHeight)
        }

        image(toiletImg, this.fruitPos.x * tileWidth, this.fruitPos.y * tileHeight, tileWidth, tileHeight);
    }

    nextStage() {
        return this;
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
        this.streak++
        if (this.streak == Game.SILVER_CHARIOT_STREAK_REQUIREMENT) {
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
                console.log(hitNumber);
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