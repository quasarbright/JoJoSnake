/**
 * Unity animations: simple lerps of a variable over time.
 *
 * An AnimationStage is just a (possibly-cyclic) graph that has optional transitions to other stages
 */

const timeLerp = (animatable, curTime) => {
    let start = animatable.start;
    let end = animatable.end;
    let minTime = animatable.minTime;
    let maxTime = animatable.maxTime;
    if (curTime > minTime) {
        return lerp(start, end, (curTime - minTime) / (maxTime - minTime));
    } else {
        return 0;
    }
}

/**
 *
 * @param Animatable objects are an object with a property key and then options defined:
 *  valid options are
 *  min: the minimum value to lerp from (default 0)
 *  max: the maximum value to lerp from (required)
 *  strategy: a function with signature (Animatable, time) => state, that returns the state of an animatable at a given
 *  time. Defaults to a standard time lerp.
 *
 */
class Animatable {
    /**
     *
     * @param props the object with the above described properties
     * @param minTime start lerp time
     * @param maxTime end lerp time
     */
    constructor(props, minTime, maxTime) {
        const {start = 0, end, strategy = timeLerp} = props;
        this.start = start;
        this.minTime = minTime;
        this.end = end;
        this.maxTime = maxTime;
        this.updateStrategy = strategy;
        this.property = props.property;
    }

    /**
     * Return a view of this animatable object at a certain time
     * @param curTime the time
     */
    view(curTime) {
        return this.updateStrategy(this, curTime)
    }

    static fromOther(animatable, field) {
        let copy = new Animatable(animatable, animatable.minTime, animatable.maxTime);
        copy.property = field;
        return copy;
    }
}

/**
 * Animate a group of fields F over 2 values Fv1->Fv2 over a period of time t1 -> t2
 */

class AnimationStage {

    nextStage; // either a transition or stage

    /**
     * Move the animation forward, to the next stage if necessary.
     * @param manualTime for dev use
     */
    tick(manualTime) {
        this.curTime += manualTime === undefined ? (deltaTime / 1000) : manualTime;
        if (this.curTime > this.endTime) {
            if (this.nextStage !== undefined) {
                let diff = this.curTime - this.endTime;
                this.curTime = this.startTime;
                this.nextStage.tick(diff);
                return this.nextStage;
            } else {
                this.curTime = this.endTime;
            }
        }
        this.animatableMapping.forEach((value, key) => {
            this.states.set(key, value.view(this.curTime));
        })
        return this;
    }

    constructor(animatableObjects, startTime, endTime) {
        this.curTime = 0;
        this.endTime = endTime;
        this.startTime = startTime;
        this.states = new Map();
        this.animatableMapping = new Map();

        for (let animatable of animatableObjects) {
            let instance = new Animatable(animatable, startTime, endTime);
            this.animatableMapping.set(instance.property, instance);
            this.states.set(instance.property, instance.view(this.curTime));
        }
    }

    view() {
        return Object.fromEntries(this.states);
    }

}