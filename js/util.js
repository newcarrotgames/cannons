/**
 * degrees to radians conversion constant
 * @type {number}
 */
var d2r = Math.PI / 180;

/**
 * 360 degrees (2pi)
 * @type {number}
 */
var PI2 = 2 * Math.PI;

/**
 * 90 degrees
 * @type {number}
 */
var PI_2 = Math.PI / 2;

/**
 * Converts real world coordinates to map data coordinates
 * @param val
 * @returns {number}
 */
function w(val) {
    return Math.floor(val / 100) + world.width / 2;
}

/**
 * Converts radians to degrees
 * @param val
 * @returns {number}
 */
function r2d(val) {
    return val * 180 / Math.PI;
}

/**
 * Trims rotational angles so they don't get beyond 360 or below 0 (for developer's sanity)
 * @param rot
 * @returns {*}
 */
function trimRot(rot) {
    if (rot < 0)
        rot = PI2;
    else
        if (rot > PI2)
            rot = 0;
    return rot;
}