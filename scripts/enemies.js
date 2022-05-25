function createEnemy(x, y, template) {
    var e = new Enemy(x, y);
    // Fill in all keys
    template = typeof template === 'undefined' ? {} : template;
    var keys = Object.keys(template);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        e[key] = template[key];
    }
    e.onCreate();
    return e;
}


var enemy = {};


enemy.weak = {
    // Display
    color: [189, 195, 199],
    // Misc
    name: 'weak',
    // Stats
    cash: 69420,
    health: 35000
};

enemy.strong = {
    // Display
    color: [108, 122, 137],
    radius: 0.6,
    // Misc
    name: 'strong',
    // Stats
    cash: 694206,
    health: 70000
};

enemy.fast = {
    // Display
    color: [61, 251, 255],
    // Misc
    name: 'fast',
    // Stats
    cash: 6942069,
    health: 70000,
    speed: 2,
    // Methods
    draw: function() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());

        stroke(0);
		fill(this.getColor());
        var back = -0.55 * ts / 3;
        var front = back + 0.55 * ts;
        var side = 0.8 * ts / 2;
        quad(back, -side, 0, 0, back, side, front, 0);
        
        pop();
    }
};

enemy.strongFast = {
    // Display
    color: [30, 139, 195],
    // Misc
    name: 'strongFast',
    // Stats
    cash: 69420694,
    health: 130000,
    speed: 2,
    // Methods
    draw: function() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());
        
        stroke(0);
		fill(this.getColor());
        var back = -0.8 * ts / 3;
        var front = back + 0.8 * ts;
        var side = ts / 2;
        quad(back, -side, 0, 0, back, side, front, 0);
        
        pop();
    }
};

enemy.medic = {
    // Display
    color: [192, 57, 43],
    radius: 0.7,
    // Misc
    name: 'medic',
    // Stats
    cash: 694206942,
    health: 370000,
    immune: ['regen'],
    // Methods
    onTick: function() {
        var affected = getInRange(this.pos.x, this.pos.y, 2, enemies);
        for (var i = 0; i < affected.length; i++) {
            affected[i].applyEffect('regen', 1);
        }
    }
};

enemy.stronger = {
    // Display
    color: [52, 73, 94],
    radius: 0.8,
    // Misc
    name: 'stronger',
    // Stats
    cash: 6942069420,
    health: 300007
};

enemy.faster = {
    // Display
    color: [249, 105, 14],
    // Misc
    name: 'faster',
    // Stats
    cash: 69420694206,
    health: 690000,
    resistant: ['explosion'],
    speed: 3,
    // Methods
    draw: function() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());

        stroke(0);
		fill(this.getColor());
        var back = -0.7 * ts / 3;
        var front = back + 0.7 * ts;
        var side = 0.9 * ts / 2;
        quad(back, -side, 0, 0, back, side, front, 0);
        
        pop();
    }
};

enemy.tank = {
    // Display
    color: [30, 130, 76],
    radius: 1,
    // Misc
    name: 'tank',
    // Stats
    cash: 694206942069,
    health: 750000,
    immune: ['poison', 'slow'],
    resistant: ['energy', 'physical'],
    weak: ['explosion', 'piercing'],
    // Methods
    draw: function() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());
        
        stroke(0);
        fill(this.getColor());
        var front = this.radius * ts / 2;
        var side = 0.7 * ts / 2;
        var barrel = 0.15 * ts / 2;
        var length = 0.7 * ts;
        var curve = 0.2 * ts;
        rect(-front, -side, front * 2, side * 2, curve);
        fill(149, 165, 166);
        rect(0, -barrel, length, barrel * 2);
        ellipse(0, 0, 0.2 * ts * 2, 0.2 * ts * 2);

        pop();
    }
};

enemy.taunt = {
    // Display
    color: [102, 51, 153],
    radius: 0.8,
    // Misc
    name: 'taunt',
    sound: 'taunt',
    // Stats
    cash: 6942069420694,
    health: 1500000000,
    immune: ['poison', 'slow'],
    resistant: ['energy', 'physical'],
    taunt: true,
    // Methods
    draw: function() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());
        
        stroke(0);
        fill(this.getColor());
        var edge = this.radius * ts / 2;
        rect(-edge, -edge, this.radius * ts, this.radius * ts);
        stroke(232, 126, 4);
        noFill();
        rect(-0.3 * ts, -0.3 * ts, 0.6 * ts, 0.6 * ts);
        rect(-0.2 * ts, -0.2 * ts, 0.4 * ts, 0.4 * ts);

        pop();
    }
};

enemy.spawner = {
    // Display
    color: [244, 232, 66],
    radius: 0.7,
    // Misc
    name: 'spawner',
    // Stats
    cash: 69420694206942,
    health: 6942000000,
    // Methods
    onKilled: function() {
        if (this.alive) {
            cash += this.cash;
            this.kill();
            if (!muteSounds && sounds.hasOwnProperty(this.sound)) {
                sounds[this.sound].play();
            }
            
            // Add new temporary spawnpoint
            var c = gridPos(this.pos.x, this.pos.y);
            if (c.equals(exit)) return;
            for (var i = 0; i < tempSpawns.length; i++) {
                if (c.equals(tempSpawns[i][0])) return;
            }
            tempSpawns.push([createVector(c.x, c.y), tempSpawnCount]);
        }
    }
};
