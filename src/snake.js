let enemyInfos;

let D_UP = "D_UP"
let D_DOWN = "D_DOWN"
let D_LEFT = "D_LEFT"
let D_RIGHT = "D_RIGHT"

DIRECTIONS = new Map([["D_UP", D_UP], ["D_DOWN", D_DOWN], ["D_LEFT", D_LEFT], ["D_RIGHT", D_RIGHT]]);


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
        backgroundMusic.loop();
    }
}

class Game extends GameStage {

    movementQueue = []; // the queue of moves to make when it is the players turn
    lastMove = D_RIGHT; // the last move the player actually made


    _nextFrame = function* (game) {
        while (true) {
            if (playerMoveCount % 10 === 0) {
                if (game.movementQueue.length === 0) {
                    game.movePlayer(game.lastMove);
                }
                for (let move of game.movementQueue) {
                    game.lastMove = move;
                    game.movePlayer(move);
                }
                game.movementQueue = [];
                enemyMoveCount += 1;
                enemyMoveCount %= 3;
            }
            playerMoveCount += 1;
            playerMoveCount %= 10;

            if (enemyMoveCount % 3 === 0) {
                game.updateEnemies();
                enemyMoveCount += 1;
            }
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
                this.movementQueue.push(this.lastMove);
            }
        }
    }

    getEnemyPositions() {
        return this.enemies.map(e => e.position)
    }

    getHead() {
        return this.tail[0]
    }

    randomVector() {
        return createVector(floor(random(0, this.width)), floor(random(0, this.height)))
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
        let player = this.getHead()
        if (this.dead) {
            return;
        }
        for (let enemy of this.enemies) {
            let direction = p5.Vector.sub(player, enemy.position);
            let max_value = Number.NEGATIVE_INFINITY;
            let max_direction;
            for (let value of DIRECTIONS.values()) {
                let dirVector = vectorOfDirection(value);
                let newPos = p5.Vector.add(enemy.position, dirVector)
                if (dirVector.dot(direction) > max_value && !this.positionHasEnemy(newPos)) {
                    max_value = dirVector.dot(direction);
                    max_direction = dirVector;
                }
            }
            if(max_direction !== undefined) {
                enemy.position.add(max_direction);
            }
            if (enemy.position.equals(this.fruitPos)) {
                this.fruitPos = enemy.position
            }
        }

        // check if enemies are at player
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            let enemy = this.enemies[i]
            if (enemy.position.equals(player)) {
                this.takeHit();
                this.enemies.splice(i, 1)
                enemy.onDeath()
            }
        }
    }

    spawnEnemy() {
        let info = choose(enemyInfos)
        let position = this.generatePositionNotInTail()
        let enemy = new Enemy(position, info.img, info.onSpawn, info.onDeath, info.health)
        this.addEnemy(enemy)
        enemy.onSpawn()
    }
}

class Enemy {
    constructor(position, sprite, onSpawn, onDeath, health) {
        this.position = position
        this.sprite = sprite
        this.onSpawn = onSpawn
        this.onDeath = onDeath
        this.health = health
    }
}