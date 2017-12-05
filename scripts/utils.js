// Build 2d array of value
function buildMap(cols, rows, value) {
    var arr = [];
    for (var col = 0; col < cols; col++) {
        arr[col] = [];
        for (var row = 0; row < rows; row++) {
            arr[col][row] = value;
        }
    }
    return arr;
}

// Get center of tile at coords
function getCenter(col, row) {
    return {x: col*ts + ts/2, y: row*ts + ts/2};
}

// Copy 2d array
function copyMap(myMap) {
    var copy = [];
    for (var col = 0; col < myMap.length; col++) {
        copy[col] = [];
        for (var row = 0; row < myMap[0].length; row++) {
            copy[col][row] = myMap[col][row];
        }
    }
    return copy;
}

// Convert coords to a string
function cts(col, row) {
    return col + ',' + row;
}

// Get non-diagonal walkable neighbors in a rectangular array
function getNeighbors(walkMap, x, y) {
    var neighbors = [];
    if (x !== 0 && walkMap[x - 1][y] === 0) {
        neighbors.push(cts(x - 1, y));
    }
    if (y !== 0 && walkMap[x][y - 1] === 0) {
        neighbors.push(cts(x, y - 1));
    }
    if (x !== walkMap.length - 1 && walkMap[x + 1][y] === 0) {
        neighbors.push(cts(x + 1, y));
    }
    if (y !== walkMap[x].length - 1 && walkMap[x][y + 1] === 0) {
        neighbors.push(cts(x, y + 1));
    }
    return neighbors;
}

// Return column and row
function getTile(x, y) {
    return {x: floor(x / ts), y: floor(y / ts)};
}

// Return center of current tile (combination of getTile() and getCenter())
function getTileCenter(x, y) {
    var c = getTile(x, y);
    return getCenter(c.x, c.y);
}

function isBetween(num, min, max) {
    return num > Math.min(min, max) && num < Math.max(min, max);
}

function isOutsideRect(x, y, cx, cy, w, h) {
    return x < cx || y < cy || x > cx + w || y > cy + h;
}

// Convert obj to vector
function otv(obj) {
    return createVector(obj.x, obj.y);
}

// Convert string to coords
function stc(str) {
    var arr = str.split(',');
    return {x: parseInt(arr[0]), y: parseInt(arr[1])};
}

// Convert string to p5.Vector
function stv(str) {
    var pos = stc(str);
    return createVector(pos.x, pos.y);
}