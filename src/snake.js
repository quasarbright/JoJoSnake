UP = "UP"
DOWN = "DOWN"
LEFT = "LEFT"
RIGHT = "RIGHT"

function vectorOfDirection(direction) {
    switch(direction) {
        case UP:
            return createVector(0, -1)
            break
        case DOWN:
            return createVector(0, 1)
            break
        case LEFT:
            return createVector(-1, 0)
            break
        case RIGHT:
            return createVector(1, 0)
            break
        default:
            console.error(direction)
    }
}

class Game {
    constructor() {
        // first ele is head, rest is tail
        this.dead = false
        this.width = 15
        this.height = 15
        this.tail = [this.randomVector()]
        this.fruitPos = createVector(0,0)
        this.enemyPositions = [] // list of vectors
    }
    
    getEnemyPositions() {
        return this.enemyPositions
    }
    
    getHead() {
        return this.tail[0]
    }
    randomVector() {
        return createVector(random(0, this.width), random(0, this.height))
    }

    isInTail(pos) {
        ans = false
        this.tail.forEach(tailPos => {
            if (pos.equals(tailPos)) {
                ans = true
            }
        })
        return ans
    }

    movePlayer(direction) {
        if(!this.dead) {

        }
        this.updateDead()
    }

    isInBounds(pos) {
        return pos.x >= 0 && pos.x < this.width && pos.y >= 0 && pos.y < this.height
    }

    respawnFruit() {
        
    }


    shouldBeDead() {
        head = this.getHead()
        if(this.isInTail(this.tail[0])) {
            return true
        } else if(!this.isInBounds(head)) {
            return true
        } else {
            return false
        }
    }

    updateDead() {
        this.dead = this.dead || this.shouldBeDead()
    }

    updateEnemies() {

    }


}