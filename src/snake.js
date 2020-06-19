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

class Game {

    constructor() {
        // first ele is head, rest is tail
        this.dead = false
        this.deathAcknowledged = false
        this.width = 15
        this.height = 15
        this.allPositions = []
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                this.allPositions.push(createVector(x, y))
            }
        }
        this.tail = [createVector(floor(this.width / 2), floor(this.height / 2))]
        this.fruitPos = null
        this.respawnFruit()
        this.enemies = []
        this.spawnEnemy()
        this.fruitEatCount = 0
        this.enemySpawnPeriod = 3
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
                this.respawnFruit()
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
        if (this.fruitEatCount % this.enemySpawnPeriod == 0) {
            this.spawnEnemy()
        }
    }

    onDeath() {
        if(!this.deathAcknowledged) {
            backgroundMusic.pause()
            this.deathAcknowledged = true
        }
    }


    respawnFruit() {
        this.fruitPos = this.generatePositionNotInTail();
    }

    generatePositionNotInTail() {
        let goodPositions = this.allPositions.filter((pos) => !this.isInTail(pos) && !pos.equals(this.getHead()))
        return choose(goodPositions)
    }


    shouldBeDead() {
        let head = this.getHead()
        return this.isInTail(head) || !this.isInBounds(head);
    }

    updateDead() {
        this.dead = this.dead || this.shouldBeDead()
        if(this.dead) {
            this.onDeath()
        }
    }

    addEnemy(enemy) {
        this.enemies.push(enemy)
    }

    takeHit() {
        if (this.tail.length > 1) {
            this.tail.pop();
        }
        else if (this.tail.length === 1) {
            this.dead = true;
        }
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
                if (dirVector.dot(direction) > max_value) {
                    max_value = dirVector.dot(direction);
                    max_direction = dirVector;
                }
            }
            enemy.position.add(max_direction);
        }

        // check if enemies are at player
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            let enemy = this.enemies[i]
            if (enemy.position.equals(player)) {
                this.takeHit();
                this.enemies.splice(i,1)
                enemy.onDeath()
            }
        }
    }

    spawnEnemy() {
        let [sprite, onSpawn, onDeath, health] = Object.values(choose(enemyInfos))
        let position = this.generatePositionNotInTail()
        let enemy = new Enemy(position, sprite, onSpawn, onDeath)
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