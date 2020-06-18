let UP = "UP"
let DOWN = "DOWN"
let LEFT = "LEFT"
let RIGHT = "RIGHT"

DIRECTIONS = new Map([["UP", UP], ["DOWN", DOWN], ["LEFT", LEFT], ["RIGHT", RIGHT]]);

function vectorOfDirection(direction) {
    switch(direction) {
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
        this.tail = [createVector(floor(this.width / 2), floor(this.height / 2))]
        this.fruitPos = createVector(0,0)
        this.enemyPositions = [] // list of vectors
        this.allPositions = []
        for(let x = 0; x < this.width; x++) {
            for(let y = 0; y < this.height; y++) {
                this.allPositions.push(createVector(x, y))
            }
        }
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
        if(!this.dead) {
            direction = vectorOfDirection(direction)
            let newPos = p5.Vector.add(this.getHead(), direction)
            this.tail.unshift(newPos)
            if(this.getHead() === this.fruitPos) {
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
        return this.allPositions.filter((pos) => !this.isInTail(pos) && !pos.equals(this.head()))
    }


    shouldBeDead() {
        let head = this.getHead()
        if(this.isInTail(head)) {
            return true
        } else return !this.isInBounds(head);
    }

    updateDead() {
        this.dead = this.dead || this.shouldBeDead()
    }

    addEnemy(enemy) {
        this.enemyPositions.push(enemy)
    }

    updateEnemies() {
        let player = this.getHead()
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
            enemy.add(max_direction);
        }
    }


}