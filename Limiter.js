/**
 * Rate limiter class
 */
class Limit {
    /**
     * Sets the current points as well as the maximum points
     * @param {*} points the points to use
     * @param {*} timeout timeout in ms for points to be added back
     */
    constructor(points, timeout) {
        this.MAX_POINTS = points;
        this.points = points;
        this.TIMEOUT = timeout;
    }

    /**
     * Resets point count to the maximum
     */
    resetPoints() {
        this.points = this.MAX_POINTS;
    }
    
    /**
     * Gets the remaining points
     */
    getPoints() {
        return this.points;
    }

    /**
     * Gets the maximum points
     */
    getMaxPoints() {
        return this.MAX_POINTS;
    }

    /**
     * Sets the remaining points
     * @param {*} points the points to use
     */
    setPoints(points) {
        this.points = points;
    }

    /**
     * Sets the maximum points
     * @param {*} maxPoints the points to use
     */
    setMaxPoints(maxPoints) {
        this.MAX_POINTS = maxPoints;
    }

    /**
     * Tries to remove points from the Limit.
     * If no points are available, waits until
     * points are available before resolving.
     * @param {*} num number of points to remove
     */
    removePoints(num) {
        // Promise that resolves when num points can be removed
        return new Promise((resolve) => {
            let self = this;
            // Repeats checking until there are enough points
            (function wait() {
                if(self.points - num >= 0) { // If there is room to remove the points
                    self.points = self.points - num; // Remove the points
                    setTimeout(() => self.addPoints(num), self.timeout); // Add the points back timeout ms after
                    return resolve();
                } else {
                    setTimeout(wait, 1000); // Else try again after 1 second
                }
            })();
        });
    }

    /**
     * Adds points to the point count
     * If number of points would add
     * over max points, then set
     * points equal to max points
     * @param {*} num number of points to add
     */
    addPoints(num) {
        if(num + this.points > this.MAX_POINTS) {
            this.points = this.MAX_POINTS;
        } else {
            this.points += num;
        }
        return this.points;
    }
}
module.exports = Limit;