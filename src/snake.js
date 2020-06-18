let UP = "UP"
let DOWN = "DOWN"
let LEFT = "LEFT"
let RIGHT = "RIGHT"

DIRECTIONS = new Map([["UP", UP], ["DOWN", DOWN], ["LEFT", LEFT], ["RIGHT", RIGHT]]);

function vectorOfDirection(direction) {
    switch (direction) {
        case UP:
            return createVector(0, -1);
            break;
        case DOWN:
            return createVector(0, 1);
            break;
        case LEFT:
            return createVector(-1, 0);
            break;
        case RIGHT:
            return createVector(1, 0);
            break;
        default:
            console.error(direction);
    }
}

class Game {

    constructor() {
        // first ele is head, rest is tail
        this.dead = false
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
        this.enemyPositions = [] // list of vectors
        this.spawnEnemy()
    }

    getEnemyPositions() {
        return this.enemyPositions
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


    respawnFruit() {
        this.fruitPos = this.generatePositionNotInTail()
    }

    generatePositionNotInTail() {
        let goodPositions = this.allPositions.filter((pos) => !this.isInTail(pos) && !pos.equals(this.getHead()))
        return goodPositions[Math.floor(Math.random() * goodPositions.length)]
    }


    shouldBeDead() {
        let head = this.getHead()
        return this.isInTail(head) || !this.isInBounds(head);
    }

    updateDead() {
        this.dead = this.dead || this.shouldBeDead()
    }

    addEnemy(enemy) {
        this.enemyPositions.push(enemy)
    }

    takeHit() {
        if (this.tail.length > 1) {
            this.tail.pop();
        }
        if (this.tail.length === 1) {
            this.dead = true;
        }
    }

    updateEnemies() {
        let player = this.getHead()
        if (player === undefined) {
            return;
        }
        for (let enemy of this.enemyPositions) {
            let direction = p5.Vector.sub(player, enemy);
            let max_value = Number.NEGATIVE_INFINITY;
            let max_direction;
            for (let value of DIRECTIONS.values()) {
                let dirVector = vectorOfDirection(value);
                if (dirVector.dot(direction) > max_value) {
                    max_value = dirVector.dot(direction);
                    max_direction = dirVector;
                }
            }
            // console.log("moving enemy in direction");
            // console.log(max_direction);

            enemy.add(max_direction);
        }

        // check if enemies are at player
        for (let i = this.enemyPositions.length - 1; i >= 0; i--) {//let enemy of this.enemyPositions) {
            let enemy = this.enemyPositions[i]
            if (enemy.equals(player)) {
                this.takeHit();
                this.enemyPositions.splice(i,1)
                this.spawnEnemy()
            }
        }
    }

    spawnEnemy() {
        this.addEnemy(this.generatePositionNotInTail())
    }


}