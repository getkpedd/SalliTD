var divw;
var divh;

var enemies;
var newEnemies;
var towers;
var newTowers;

var grid;
var paths;
var spawnpoints;
var exit;

var cols;
var rows;
var ts = 24;            // tile size
var zoom = 2;

var paused;
var maxHealth;
var health;
var cash;
var wave;

var gridMode = true;
var pathMode = false;
var spawnCount = 1;
var tHold = 1;          // turning threshold
var wallChance = 0.1;


// Misc functions

function createWave(pattern) {
    newEnemies = [];
    for (var i = 0; i < pattern.length; i++) {
        var t = pattern[i];
        if (Array.isArray(t)) {
            if (t.length === 1) {
                newEnemies.push(t[0]);
            } else if (t.length > 1) {
                for (var j = 0; j < t[1]; j++) {
                    newEnemies.push(t[0]);
                }
            }
        } else {
            newEnemies.push(t);
        }
    }
}

function generateMap() {
    // Generate empty tiles and walls
    grid = [];
    for (var col = 0; col < cols; col++) {
        grid[col] = [];
        for (var row = 0; row < rows; row++) {
            grid[col][row] = random() < wallChance ? 1 : 0;
        }
    }

    // Generate exit
    exit = getEmpty(grid);

    // Generate enemy spawnpoints
    spawnpoints = [];
    for (var i = 0; i < spawnCount; i++) {
        var pos;
        while (true) {
            pos = getEmpty(grid);
            if (pos.x !== exit.x && pos.y !== exit.y) break;
        }
        spawnpoints.push(pos);
    }

    // TODO remove this
    var pos = getEmpty();
    towers.push(createTower(pos.x, pos.y, tower.laser));
    createWave([
        enemy.basic
    ]);

    generatePaths(exit.x, exit.y);
}

// Generates shortest path to target tile from every map tile
// Algorithm from https://www.redblobgames.com/pathfinding/tower-defense/
function generatePaths(col, row) {
    var walkMap = walkable();
    var frontier = new Queue();
    var target = cts(col, row);
    frontier.enqueue(target);
    var cameFrom = {};
    cameFrom[target] = null;

    // Fill cameFrom for every tile
    while (!frontier.isEmpty()) {
        var current = frontier.dequeue();
        var pos = stc(current);
        var neighbors = getNeighbors(walkMap, pos.x, pos.y);

        for (var i = 0; i < neighbors.length; i++) {
            var next = neighbors[i];
            if (!(next in cameFrom)) {
                frontier.enqueue(next);
                cameFrom[next] = current;
            }
        }
    }

    // Generate path direction for every tile
    paths = buildMap(cols, rows, null);
    var keys = Object.keys(cameFrom);
    for (var i = 0; i < keys.length; i++) {
        var curKey = keys[i];
        var curVal = cameFrom[curKey];

        if (curKey === null || curVal === null) continue;
        var current = stv(curKey);
        var next = stv(curVal);
        var dir = next.sub(current);
        if (dir.x < 0) paths[current.x][current.y] = 'left';
        if (dir.y < 0) paths[current.x][current.y] = 'up';
        if (dir.x > 0) paths[current.x][current.y] = 'right';
        if (dir.y > 0) paths[current.x][current.y] = 'down';
    }
}

// Find an empty tile on the map
function getEmpty() {
    var walkMap = walkable();
    while (true) {
        var col = floor(random(cols));
        var row = floor(random(rows));
        if (walkMap[col][row] === 1) continue;
        if (typeof spawnpoints !== 'undefined') {
            for (var i = 0; i < spawnpoints.length; i++) {
                var s = spawnpoints[i];
                if (s.x === col && s.y === row) continue;
            }
        }
        if (typeof exit !== 'undefined' && exit.x === col && exit.y === row) {
            continue;
        }
        return {x: col, y: row};
    }
}

// Find tower at specific column and row
function getTower(col, row) {
    for (var i = 0; i < towers.length; i++) {
        var t = towers[i];
        if (t.pos.x === col && t.pos.y === row) return t;
    }
    return null;
}

function initEntities() {
    enemies = [];
    newEnemies = [];
    towers = [];
    newTowers = [];
}

function isOutsideMap(e) {
    return isOutsideRect(e.pos.x, e.pos.y, 0, 0, width, height);
}

function removeDead(entities) {
    for (var i = entities.length - 1; i >= 0; i--) {
        var e = entities[i];
        if (e.alive) continue;
        entities.splice(i, 1);
        e.onDeath();
    }
}

function resetGame() {
    initEntities();
    generateMap();
    paused = true;
    maxHealth = 100;
    health = maxHealth;
    cash = 150;
    wave = 1;
}

// Sets tile width and height based on canvas size and map dimensions
function resizeTiles() {
    cols = floor(divw / ts);
    rows = floor(divh / ts);
    resizeCanvas(cols * ts, rows * ts, true);
}

// Update status display
function updateStatus() {
    document.getElementById('wave').innerHTML = 'Wave ' + wave;
    document.getElementById('health').innerHTML = health + '/' + maxHealth;
    document.getElementById('cash').innerHTML = '$' + cash;
}

// Generate map indicating walkability of each tile (0 = walkable)
function walkable() {
    var walkable = copyMap(grid);
    for (var i = 0; i < towers.length; i++) {
        var t = towers[i];
        walkable[t.pos.x][t.pos.y] = 1;
    }
    return walkable;
}


// Main p5 functions

function setup() {
    // Properly size canvas and place inside div
    var div = document.getElementById('sketch-holder');
    divw = div.offsetWidth;
    var canvas = createCanvas(divw, div.offsetHeight);
    canvas.parent('sketch-holder');
    divh = div.offsetHeight;
    resizeCanvas(divw, divh, true);
    // Setup proper tile size
    resizeTiles();
    // Initialize
    resetGame();
}

function draw() {
    background(0);

    // Empty tiles and walls
    for (var col = 0; col < cols; col++) {
        for (var row = 0; row < rows; row++) {
            var t = grid[col][row];
            if (t === 0 && gridMode) {
                noFill();
                stroke(255, 31);
                rect(col * ts, row * ts, ts, ts);
            } else if (t === 1) {
                fill(1, 50, 67);
                gridMode ? stroke(255, 31) : stroke(255, 63);
                rect(col * ts, row * ts, ts, ts);
            }
        }
    }

    // Spawnpoints
    for (var i = 0; i < spawnpoints.length; i++) {
        var t = spawnpoints[i];
        fill(0, 230, 64);
        stroke(255);
        rect(t.x * ts, t.y * ts, ts, ts);
        if (newEnemies.length > 0 && !paused) {
            var pos = getCenter(t.x, t.y);
            enemies.push(createEnemy(pos.x, pos.y, newEnemies.pop()));
        }
    }

    // Exit
    fill(207, 0, 15);
    stroke(255);
    rect(exit.x * ts, exit.y * ts, ts, ts);

    // Enemies
    for (var i = 0; i < enemies.length; i++) {
        var e = enemies[i];
        if (!paused) {
            var t = getTile(e.pos.x, e.pos.y);
            e.steer(paths[t.x][t.y]);
            e.update();
            if (t.x === exit.x && t.y === exit.y) {
                e.onExit();
                e.kill();
            }
        }
        if (isOutsideMap(e)) e.kill();
        e.draw();
    }

    // Towers
    for (var i = 0; i < towers.length; i++) {
        var t = towers[i];
        if (!paused) {
            t.update();
        }
        t.draw();
    }

    removeDead(enemies);
    removeDead(towers);
}


// User input

function keyPressed() {
    switch (keyCode) {
        case 17:
            // Ctrl
            gridMode = !gridMode;
            break;
        case 219:
            // Left bracket
            if (ts > 16) {
                ts -= zoom;
                resizeTiles();
                resetGame();
            }
            break;
        case 221:
            // Right bracket
            if (ts < 40) {
                ts += zoom;
                resizeTiles();
                resetGame();
            }
            break;
    }
}

/*
// Misc functions
// Generate map of ideal path to exit tile
function generatePathMap(walkMap, col, row) {
    var frontier = new Queue();
    var pos = coordsToString(col, row);
    frontier.enqueue(pos);
    var cameFrom = {};
    cameFrom[pos] = null;
    
    while (!frontier.isEmpty()) {
        var current = frontier.dequeue();
        pos = stringToCoords(current);
        var neighbors = getNeighbors(walkMap, pos.x, pos.y);
        
        for (var i = 0; i < neighbors.length; i++) {
            var next = neighbors[i];
            if (!(next in cameFrom)) {
                frontier.enqueue(next);
                cameFrom[next] = current;
            }
        }
        
    }

    return cameFrom;
}

// Generate map of walkability for each tile
function generateWalkMap() {
    var walkMap = [];
    for (var col = 0; col < cols; col++) {
        walkMap[col] = [];
        for (var row = 0; row < rows; row++) {
            walkMap[col][row] = grid[col][row].canWalk;
        }
    }
    return walkMap;
}


// Main p5 functions

function draw() {
    background(0);

    // Tiles
    for (var col = 0; col < cols; col++) {
        for (var row = 0; row < rows; row++) {
            var tile = grid[col][row];
            tile.update();
            tile.draw();
        }
    }

    // Enemies
    for (var i = 0; i < enemies.length; i++) {
        var e = enemies[i];
        e.update();
        e.draw();
        var t = getCoords(e.pos.x, e.pos.y);
        var c = coordsToString(t.col, t.row);
        if (pathMap[c] !== null) {
            var next = stringToCoords(pathMap[c]);
            var center = getCenter(next.x, next.y);
            e.pos = createVector(center.x, center.y);
        }
    }
    
    updateStatus();
}
*/
















// TODO generate walk map whenever a tile is changed, only update changed tile to be more efficient

/*
var enemies;
var newEnemies;
var towers;

var tileWidth;
var tileHeight;

var cols;
var rows;

var meta;
var grid;
var palette;

var cash;
var health;
var wave;

var showGrid = true;


// Misc functions

function loadMap(template) {
    meta = template.meta;
    grid = template.grid;
    palette = template.palette;
    var dim = getDimensions(grid);
    cols = dim.cols;
    rows = dim.rows;
    resizeTiles(cols, rows);
    resetMap();
}

// Remove all entities and return to starting state
function resetMap() {
    initEntities();
    cash = meta.cash;
    health = meta.health;
    wave = 1;
    updateStatus();
}



// Main p5 functions

function setup() {
    // Properly size canvas and place inside div
    var div = document.getElementById('sketch-holder');
    var w = div.offsetWidth;
    var canvas = createCanvas(w, div.offsetHeight);
    canvas.parent('sketch-holder');
    resizeCanvas(w, div.offsetHeight, true);
    // Resize tiles based on initial cols and rows
    loadMap(maps[0]);
    // Initialize entities
    initEntities();
    var p = getCenter(2, 2);
    enemies[0] = new Enemy(p.x, p.y, enemies.basic);
    enemies[0].vel = createVector(1, 0);
    enemies[0].color = [127, 38, 99];
}

function draw() {
    background(0);

    // Draw tiles
    for (var col = 0; col < cols; col++) {
        for (var row = 0; row < rows; row++) {
            var tile = palette[grid[row][col]];
            tile.draw(col, row);
        }
    }

    // Update and draw enemies
    for (var i = 0; i < enemies.length; i++) {
        var e = enemies[i];
        e.steer();
        e.update();
        e.draw();
    }

    // Update and draw towers
    for (var i = 0; i < towers.length; i++) {
        ;
    }
}
*/