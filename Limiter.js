/**
 * Rate limiter class
 */
class Limit {
    /**
     * Sets the current points as well as the maximum points
     * @param {*} points the points to use
     */
    constructor(points) {
        this.MAX_POINTS = points;
        this.points = points;
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
                if(self.getPoints() - num >= 0) { // If there is room to remove the points
                    self.setPoints(self.getPoints() - num); // Remove the points
                    setTimeout(() => self.addPoints(num), 65000); // Add the points back 65 seconds after
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
        if(num + this.points > this.maxPoints) {
            this.points = this.maxPoints;
        } else {
            this.points += num;
        }
        return this.points;
    }

    /**
     * Alias for removePoints(num)
     * @param {*} num number of points to remove
     */
    removeTokens(num) {
        return this.removePoints(num);
    }
}
module.exports = Limit;