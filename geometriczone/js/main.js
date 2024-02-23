/* All Global Variables */
var cvs = document.getElementById('MainDisplay'), ctx = cvs.getContext('2d'),
    isFullScreen = false,
    leftControlAngle = null, rightControlAngle = null,
    touchData = { leftControl: { x: null, y: null }, rightControl: { x: null, y: null } },
    game, deltaTime, timeStamp;

function openFullScreen() { if (cvs.requestFullscreen) { cvs.requestFullscreen(); } else if (cvs.mozRequestFullScreen) { cvs.mozRequestFullScreen(); } else if (cvs.webkitRequestFullscreen) { cvs.webkitRequestFullscreen(); } else if (cvs.msRequestFullscreen) { cvs.msRequestFullscreen(); }; }

/* User Interaction Functions */
function resetRightControl() { touchData.rightControl = { x: null, y: null }; rightControlAngle = null; }
function resetLeftControl() { touchData.leftControl = { x: null, y: null }; leftControlAngle = null; }
window.addEventListener('touchstart', function (e) {
    var t = e.changedTouches, TD = touchData;
    function setTouchData(x, y) {
        if (x > window.innerWidth / 2) { TD.rightControl.x = x; TD.rightControl.y = y; }
        else { TD.leftControl.x = x; TD.leftControl.y = y; };
    };
    if (t[0] !== undefined) { setTouchData(t[0].clientX, t[0].clientY); };
    if (t[1] !== undefined) { setTouchData(t[1].clientX, t[1].clientY); };
}, false);
window.addEventListener('touchmove', function (e) {
    var t = e.changedTouches, TD = touchData;
    function setControlAngle(x, y) {
        if (x > window.innerWidth / 2) {
            if (TD.rightControl.x !== null && x > window.innerWidth / 1.5) {
                rightControlAngle = Math.atan2(y - TD.rightControl.y, x - TD.rightControl.x);
            } else { resetRightControl(); };
        } else {
            if (TD.leftControl.x !== null && x < window.innerWidth / 2.5) {
                leftControlAngle = Math.atan2(y - TD.leftControl.y, x - TD.leftControl.x);
            } else { resetLeftControl(); };
        };
    };
    if (t[0] !== undefined) { setControlAngle(t[0].clientX, t[0].clientY); };
    if (t[1] !== undefined) { setControlAngle(t[1].clientX, t[1].clientY); };
}, false);
window.addEventListener('touchend', function (e) {
    var t = e.changedTouches;
    function setTouchData(x, y) { if (x > window.innerWidth / 2) { resetRightControl(); } else { resetLeftControl(); }; }
    if (t[0] !== undefined) { setTouchData(t[0].clientX, t[0].clientY); };
    if (t[1] !== undefined) { setTouchData(t[1].clientX, t[1].clientY); };
}, false);

/* Math Functions */
function radian(angle) { return angle * (Math.PI / 180); }
function randomInteger(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; };
function randomAngle() { return radian(randomInteger(0, 360)); }

/* Vector Functions */
class Vec {
    constructor(x, y) { this.x = x || 0; this.y = y || 0; }
    clone() { return new Vec(this.x, this.y); }
    add(v) { this.x += v.x; this.y += v.y; return this; }
    sub(v) { this.x -= v.x; this.y -= v.y; return this; }
    mult(scalar) { this.x *= scalar; this.y *= scalar; return this; }
    div(scalar) { this.x /= scalar; this.y /= scalar; return this; }
    negate() { this.x = -this.x; this.y = -this.y; return this; }
    magSq() { return this.x * this.x + this.y * this.y; }
    mag() { return Math.sqrt(this.x * this.x + this.y * this.y); }
    normalize() { return this.div(this.mag() || 1); }
    angle() { return Math.atan2(this.y, this.x); }
    setAngle(angle) { var mag = this.mag(); this.x = Math.cos(angle) * mag; this.y = Math.sin(angle) * mag; return this; }
    distSq(v) { return Math.pow(this.x - v.x, 2) + Math.pow(this.y - v.y, 2); }
    dist(v) { return Math.sqrt(this.distSq(v)); }
    setMag(mag) { return this.normalize().mult(mag); }
    rotate(angle) { var c = Math.cos(angle), s = Math.sin(angle); var x = this.x; var y = this.y; this.x = x * c - y * s; this.y = x * s + y * c; return this; }
    limit(mag) { if (this.mag() > mag) { this.setMag(mag); }; return this; }
}
Vec.prototype.add = function (v) { this.x += v.x; this.y += v.y; return this; }
Vec.prototype.sub = function (v) { this.x -= v.x; this.y -= v.y; return this; }
function VecFromAngle(angle, mag) { return new Vec(Math.cos(angle) * mag, Math.sin(angle) * mag); }
function VecFromArray(array) { var i; for (i = array.length - 1; i > -1; i--) { array[i] = new Vec(array[i][0], array[i][1]); }; return array; }



/* Canvas Draw Functions */
function fillArc(x, y, r, s, e) { if (s === undefined || e === undefined) { s = 0; e = 2 * Math.PI; }; ctx.beginPath(); ctx.arc(x, y, r, s, e); ctx.fill(); }
function strokeArc(x, y, r, s, e) { if (s === undefined || e === undefined) { s = 0; e = 2 * Math.PI; }; ctx.beginPath(); ctx.arc(x, y, r, s, e); ctx.stroke(); }
function strokeLine(array) { ctx.beginPath(); ctx.moveTo(array[0].x, array[0].y); ctx.lineTo(array[1].x, array[1].y); ctx.stroke(); }
function strokePath(array) { var i, l = array.length; ctx.beginPath(); ctx.moveTo(array[0].x, array[0].y); for (i = 1; i < l; i++) { ctx.lineTo(array[i].x, array[i].y) }; ctx.stroke(); }
function strokePolygon(array) { var i, l = array.length; ctx.beginPath(); ctx.moveTo(array[0].x, array[0].y); for (i = 1; i < l; i++) { ctx.lineTo(array[i].x, array[i].y) }; ctx.closePath(); ctx.stroke(); }
function strokeTransformedPolygon(array, scale, rotation, translation) {
    var i, l = array.length, point;
    ctx.beginPath();
    point = array[0].clone().mult(scale).rotate(rotation).add(translation);
    ctx.moveTo(point.x, point.y);
    for (i = 1; i < l; i++) {
        point = array[i].clone().mult(scale).rotate(rotation).add(translation);
        ctx.lineTo(point.x, point.y);
    };
    ctx.closePath();
    ctx.stroke();
}
function strokeTransformedLine(array, scale, rotation, translation) {
    var point;
    ctx.beginPath();
    point = array[0].clone().mult(scale).rotate(rotation).add(translation);
    ctx.moveTo(point.x, point.y);
    point = array[1].clone().mult(scale).rotate(rotation).add(translation);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
}
function strokeTransformedPath(array, scale, rotation, translation) {
    var i, l = array.length, point;
    ctx.beginPath();
    point = array[0].clone().mult(scale).rotate(rotation).add(translation);
    ctx.moveTo(point.x, point.y);
    for (i = 1; i < l; i++) {
        point = array[i].clone().mult(scale).rotate(rotation).add(translation);
        ctx.lineTo(point.x, point.y);
    };
    ctx.stroke();
}

/* Collision Functions */
function putCircleInSquare(cp, cr, sp, ss) {
    if ((cp.x - cr) < sp.x) { cp.x = cr + sp.x; } else if ((cp.x + cr) > sp.x + ss) { cp.x = (sp.x + ss) - cr; };
    if ((cp.y - cr) < sp.y) { cp.y = cr + sp.y; } else if ((cp.y + cr) > sp.y + ss) { cp.y = (sp.y + ss) - cr; };
    return cp;
}
function areCirclesColliding(c1, r1, c2, r2) { return (c1.dist(c2) < r1 + r2); }
function isCircleInSquare(cp, cr, sp, ss) { return (((cp.x - cr) >= sp.x) && ((cp.x + cr) <= sp.x + ss) && ((cp.y - cr) >= sp.y) && ((cp.y + cr) <= sp.y + ss)); }
function isPointInSquare(pp, sp, ss) { return (((pp.x) >= sp.x) && ((pp.x) <= sp.x + ss) && ((pp.y) >= sp.y) && ((pp.y) <= sp.y + ss)); }
function isPointInCircle(pointPosition, circlePosition, circleRadius) { return (pointPosition.dist(circlePosition) < circleRadius); }
function putPointInSqaure(pp, sp, ss) {
    if (pp.x < sp.x) { pp.x = sp.x; } else if (pp.x > sp.x + ss) { pp.x = sp.x + ss; };
    if (pp.y < sp.y) { pp.y = sp.y; } else if (pp.y > sp.y + ss) { pp.y = sp.y + ss; };
    return pp;
}
function bouncePointInSquareOffSides(pp, v, sp, ss) {
    if (pp.x < sp.x) { pp.x = sp.x; v.x = -v.x; } else if (pp.x > sp.x + ss) { pp.x = sp.x + ss; v.x = -v.x; };
    if (pp.y < sp.y) { pp.y = sp.y; v.y = -v.y; } else if (pp.y > sp.y + ss) { pp.y = sp.y + ss; v.y = -v.y; };
    return pp;
}
function bounceCircleInSquareOffSides(cp, cr, v, sp, ss) {
    if ((cp.x - cr) < sp.x) { cp.x = cr + sp.x; v.x = -v.x; } else if ((cp.x + cr) > sp.x + ss) { cp.x = (sp.x + ss) - cr; v.x = -v.x; };
    if ((cp.y - cr) < sp.y) { cp.y = cr + sp.y; v.y = -v.y; } else if ((cp.y + cr) > sp.y + ss) { cp.y = (sp.y + ss) - cr; v.y = -v.y; };
    return cp;
}
function isPloygonInSquare(points, scale, rotation, position, sp, ss) {
    var i;
    for (i = points.length - 1; i > -1; i--) {
        if (!isPointInSquare(points[i].clone().mult(scale).rotate(rotation).add(position), sp, ss)) {
            return false;
        };
    };
    return true;
}
function lineSegmentsIntersect(line1, line2, calcIntersection) {
    var x1 = line1[0].x, y1 = line1[0].y,
        x2 = line1[1].x, y2 = line1[1].y,
        x3 = line2[0].x, y3 = line2[0].y,
        x4 = line2[1].x, y4 = line2[1].y;
    var intersection;
    // calculate the distance to intersection point
    var uA = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
    var uB = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
    // if uA and uB are between 0-1, lines are colliding
    if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
        if (calcIntersection) {
            // calc the point where the lines meet
            var intersectionX = x1 + (uA * (x2 - x1));
            var intersectionY = y1 + (uA * (y2 - y1));
        };
        if (calcIntersection) {
            intersection = {
                "x": intersectionX,
                "y": intersectionY
            }
            return intersection;
        } else {
            return true;
        };
    };
    if (calcIntersection) {
        intersection = {
            "x": false,
            "y": false
        };
        return intersection;
    };
    return false;
}

/* Game Objects Constructor */

class Pinwheel {
    constructor(position, velocity) {
        this.position = position;
        this.velocity = velocity;
        this.rotation = 0;
        this.life = 1;
        this.opacity = 0;
    }
    update() {
        this.opacity += deltaTime * 2;
        if (this.opacity > 1) { this.opacity = 1; }
        this.rotation += this.deltaRotation * deltaTime;
        this.position.add(this.velocity.clone().mult(deltaTime));
    }
    draw() {
        ctx.globalAlpha = this.opacity;
        ctx.strokeStyle = this.design.color;
        ctx.lineWidth = this.design.lineWidth;
        strokeTransformedPolygon(this.design.body, this.design.scale, this.rotation, this.position);
        strokeTransformedPolygon(this.design.body, this.design.scale, this.rotation + radian(90), this.position);
        ctx.globalAlpha = 1;
    }
}
Pinwheel.prototype.score = 100;
Pinwheel.prototype.deltaRotation = radian(180);
Pinwheel.prototype.design = {
    color: '#ff00ff',
    lineWidth: 0.1,
    scale: 1,
    body: VecFromArray([[0, -1], [0.5, -0.5], [-0.5, 0.5], [0, 1]])
}
Pinwheel.prototype.collision = {
    circle: {
        radius: 1
    }
}


class Diamond {
    constructor(position, topSpeed) {
        this.position = position;
        this.velocity = new Vec(0, 0);
        this.topSpeed = topSpeed;
        this.rotation = 0;
        this.opacity = 0;
        this.life = 1;
    }
    update(game) {
        this.opacity += deltaTime * 2;
        if (this.opacity > 1) { this.opacity = 1; }
        this.rotation += this.deltaRotation * deltaTime;
        var acceleration = (Math.pow(this.topSpeed, 2) / this.position.dist(game.player.position)) + this.topSpeed;
        this.velocity.add(game.player.position.clone().sub(this.position).setMag(acceleration).mult(deltaTime)).limit(this.topSpeed);
        this.position.add(this.velocity.clone().mult(deltaTime));
    }
    draw() {
        ctx.globalAlpha = this.opacity;
        ctx.strokeStyle = this.design.color;
        ctx.lineWidth = this.design.lineWidth;
        strokeTransformedPolygon(this.design.sqaure, this.design.scale, this.rotation, this.position);
        strokeTransformedLine(this.design.diagonal, this.design.scale, this.rotation, this.position);
        strokeTransformedLine(this.design.diagonal, this.design.scale, this.rotation + radian(90), this.position);
        ctx.globalAlpha = 1;
    }
}
Diamond.prototype.deltaRotation = radian(90);
Diamond.prototype.score = 150;
Diamond.prototype.design = {
    color: '#00ffff',
    lineWidth: 0.2,
    scale: 1,
    sqaure: VecFromArray([[-1, - 1], [1, -1], [1, 1], [-1, 1]]),
    diagonal: VecFromArray([[1, 1], [-1, -1]])
};
Diamond.prototype.collision = {
    circle: { radius: 1.41 },
    ploygon: { points: VecFromArray([[-1, - 1], [1, -1], [1, 1], [-1, 1]]), }
}

class Deflector {
    constructor(position, topSpeed) {
        this.position = position;
        this.velocity = new Vec(0, 0);
        this.rotation = 0;
        this.topSpeed = topSpeed;
        this.opacity = 0;
        this.life = 1;
    }
    update(game) {
        this.opacity += deltaTime * 2;
        if (this.opacity > 1) { this.opacity = 1; }
        this.rotation += this.deltaRotation * deltaTime;
        var acceleration = (Math.pow(this.topSpeed, 2) / this.position.dist(game.player.position)) + this.topSpeed;
        this.velocity.add(game.player.position.clone().sub(this.position).setMag(acceleration).mult(deltaTime)).limit(this.topSpeed);
        var i, d1, d2;
        for (i = game.objects.missiles.length - 1; i > -1; i--) {
            d1 = this.position.dist(game.objects.missiles[i].position);
            d2 = this.position.dist(game.objects.missiles[i].position.clone().sub(game.objects.missiles[i].velocityNormal));
            if (d1 < this.collision.circle.radius * 5 && d2 > d1) {
                this.velocity.add(this.position.clone().sub(game.objects.missiles[i].position).setMag(acceleration * 10).mult(deltaTime));
            };
        };
        this.position.add(this.velocity.clone().mult(deltaTime));
    }
    draw() {
        ctx.globalAlpha = this.opacity;
        ctx.strokeStyle = this.design.color;
        ctx.lineWidth = this.design.lineWidth;
        strokeTransformedPolygon(this.design.outerSquare, this.design.scale, this.rotation, this.position);
        strokeTransformedPolygon(this.design.innerSquare, this.design.scale, this.rotation, this.position);
        ctx.globalAlpha = 1;
    }
}
Deflector.prototype.deltaRotation = radian(90);
Deflector.prototype.score = 150;
Deflector.prototype.design = {
    scale: 1,
    color: '#00ff00',
    lineWidth: 0.2,
    outerSquare: VecFromArray([[-1, - 1], [1, -1], [1, 1], [-1, 1]]),
    innerSquare: VecFromArray([[0, -1], [1, 0], [0, 1], [-1, 0]])
};
Deflector.prototype.collision = {
    circle: { radius: 1.41 },
    ploygon: { points: VecFromArray([[-1, - 1], [1, -1], [1, 1], [-1, 1]]), }
}

class Rocket {
    constructor(position, topSpeed) {
        this.position = position;
        this.velocity = new Vec(0, 0);
        this.topSpeed = topSpeed;
        this.rotation = 0;
        this.opacity = 0;
        this.life = 1;
    }
    update(game) {
        this.opacity += deltaTime * 2;
        if (this.opacity > 1) { this.opacity = 1; }
        var acceleration = (Math.pow(this.topSpeed, 2) / this.position.dist(game.player.position)) + this.topSpeed;
        this.velocity.add(game.player.position.clone().sub(this.position).setMag(acceleration).mult(deltaTime)).limit(this.topSpeed);
        this.position.add(this.velocity.clone().mult(deltaTime));
    }
    draw() {
        ctx.globalAlpha = this.opacity;
        ctx.strokeStyle = this.design.color;
        ctx.lineWidth = this.design.lineWidth;
        strokeTransformedPolygon(this.design.body, this.design.scale, this.velocity.angle() + radian(90), this.position);
        ctx.globalAlpha = 1;
    }
}
Rocket.prototype.score = 200;
Rocket.prototype.design = {
    color: '#ff0000',
    lineWidth: 0.2,
    scale: 1,
    body: VecFromArray([[0, -1], [1, 1], [0, 0.5], [-1, 1]])
};
Rocket.prototype.collision = {
    circle: { radius: 1.41 },
    ploygon: { points: VecFromArray([[0, -1], [1, 1], [0, 0.5], [-1, 1]]) }
}


class Missile {
    constructor(position, velocity) {
        this.position = position;
        this.velocity = velocity;
        this.velocityNormal = velocity.clone().normalize();
    }
    draw() {
        ctx.lineWidth = this.design.lineWidth;
        ctx.strokeStyle = this.design.color;
        strokeLine([this.position, this.position.clone().sub(this.velocityNormal)]);
    }
    update() {
        this.position.add(this.velocity.clone().mult(deltaTime));
    }
}


Missile.prototype.design = {
    lineWidth: 0.3,
    color: '#ffff00'
};

class Player {
    constructor(position) {
        this.position = position;
        this.rotation = radian(-90);
    }
    update() {
        if (rightControlAngle !== null) { this.rotation = rightControlAngle; }
        else if (leftControlAngle !== null) { this.rotation = leftControlAngle; };
        if (leftControlAngle !== null) { this.position.add(VecFromAngle(leftControlAngle, this.topSpeed * deltaTime)); };
    }
    show() {
        ctx.lineWidth = this.design.lineWidth;
        ctx.strokeStyle = this.design.color;
        strokeTransformedPath(this.design.body, this.design.scale, this.rotation + radian(90), this.position);
        strokeTransformedLine(this.design.gun, this.design.scale, this.rotation + radian(90), this.position);
    }
}
Player.prototype.topSpeed = 40;
Player.prototype.design = {
    lineWidth: 0.3,
    scale: 1,
    color: "#ffffff",
    body: VecFromArray([[0.7, -0.7], [1, 0], [0, 1], [-1, 0], [-0.7, -0.7]]),
    gun: VecFromArray([[0, 0], [0, -1]])
};
Player.prototype.collision = {
    circle: {
        radius: 1
    }
};

class Blast {
    constructor(position, color, totalParticals, radius, time) {
        this.position = position;
        this.color = color;
        this.totalParticals = totalParticals;
        this.time = time;
        this.radius = radius;
        this.particals = [];
        this.remove = false;
        var pn = this.totalParticals, randomVelocity;
        while (pn-- > 0) {
            randomVelocity = VecFromAngle(randomAngle(), randomInteger(Math.floor((this.radius / this.time) * 100) / 100, Math.floor((this.radius / (this.time / 5)) * 100) / 100));
            this.particals.push({
                position: position.clone(),
                velocity: randomVelocity,
                alpha: 1,
            });
        };
    }
    update(game) {
        var i, alpha;
        this.remove = true;
        for (i = this.particals.length - 1; i > -1; i--) {
            this.particals[i].alpha -= deltaTime / this.time;
            if (this.particals[i].alpha < 0) { this.particals[i].alpha = 0; } else {
                this.remove = false;
                bouncePointInSquareOffSides(this.particals[i].position, this.particals[i].velocity, new Vec(0, 0), game.zoneSize);
            };
            this.particals[i].position.add(this.particals[i].velocity.clone().mult(deltaTime));
        };
    }
    draw(game) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 0.1;
        var i, vp;
        for (i = this.particals.length - 1; i > -1; i--) {
            if (this.particals[i].alpha > 0) {
                vp = this.particals[i].position.clone().sub(this.particals[i].velocity.clone().normalize());
                if (isPointInSquare(vp, new Vec(0, 0), game.zoneSize)) {
                    ctx.globalAlpha = this.particals[i].alpha;
                    bouncePointInSquareOffSides(this.particals[i].position, this.particals[i].velocity, new Vec(0, 0), game.zoneSize);
                    strokeLine([this.particals[i].position, vp]);
                };
            }
        };
        ctx.globalAlpha = 1;
    }
}


/* Game Constructor */
class Game {
    constructor() {
        this.zoneSize = 80;
        this.zoneLineWidth = 0.3;
        this.zoneColor = '#ffffff';
        this.missileLastFired = 0;
        this.missilesFireInterval = 200;
        this.missilesSpeed = 60;
        this.bestScore = 0;
    }
    reset() {
        this.isGameStarted = false;
        this.isGameOver = false;
        this.missileNumber = 1;
        this.timePassed = 0;
        this.score = 0;
        this.startPad = { tapToStart: { opacity: 1, fadding: true } };
        this.player = new Player(new Vec(this.zoneSize / 2, this.zoneSize / 2));
        this.playerBlast = null;
        this.objects = {
            blasts: [],
            missiles: [],
            enemies: [],
        };
        this.enemiesPower = 0;
    }
    update() {
        if (game.isGameStarted) {
            this.timePassed += deltaTime;
            if (!this.isGameOver) {
                this.player.update();
                /* Add Missiles */
                if (rightControlAngle !== null && timeStamp - this.missileLastFired > this.missilesFireInterval) {
                    this.missileLastFired = timeStamp;
                    if (this.missileNumber === 1 || this.missileNumber === 3) {
                        this.objects.missiles.push(new Missile(this.player.position.clone(), VecFromAngle(rightControlAngle, this.missilesSpeed)));
                    };
                    if (this.missileNumber === 2 || this.missileNumber === 3) {
                        this.objects.missiles.push(new Missile(this.player.position.clone(), VecFromAngle(rightControlAngle + radian(3), this.missilesSpeed)));
                        this.objects.missiles.push(new Missile(this.player.position.clone(), VecFromAngle(rightControlAngle - radian(3), this.missilesSpeed)));
                    };
                };

                /* Add Objects */
                if (this.objects.enemies.length < 1 + (this.timePassed / 10) && !this.isGameOver) {
                    var swanPosition = new Vec(randomInteger(0, this.zoneSize), randomInteger(0, this.zoneSize));
                    putCircleInSquare(swanPosition, 2, new Vec(0, 0), this.zoneSize);
                    if (swanPosition.dist(this.player.position) > this.zoneSize / 2) {
                        var rn = randomInteger(1, 17);
                        if (rn < 7) {
                            this.objects.enemies.push(new Pinwheel(swanPosition, VecFromAngle(randomAngle(), randomInteger(120, 200) / 10)));
                        } else if (rn < 11) {
                            this.objects.enemies.push(new Deflector(swanPosition, randomInteger(40, 120) / 10));
                        } else if (rn < 15) {
                            this.objects.enemies.push(new Diamond(swanPosition, randomInteger(120, 200) / 10));
                        } else if (rn < 18) {
                            this.objects.enemies.push(new Rocket(swanPosition, randomInteger(200, 240) / 10));
                        };
                    };
                };

                /* Power Up Player */
                if (this.timePassed > 60) {
                    this.missileNumber = 3;
                } else if (this.timePassed > 30) {
                    this.missileNumber = 2;
                };

            } else {
                this.playerBlast.update(this);
                if (this.playerBlast.remove) {
                    this.reset();
                };
            };

            this.objects.blasts = this.objects.blasts.filter(function (b) { return !b.remove; });
            /* Update All Object */
            var i, objectType;
            for (objectType in this.objects) {
                for (i = this.objects[objectType].length - 1; i > -1; i--) {
                    this.objects[objectType][i].update(this);
                };
            };
        } else {
            var text = this.startPad.tapToStart;
            if (text.opacity === 0.3) { text.fadding = false; };
            if (text.opacity === 1) { text.fadding = true; };
            if (text.fadding) { text.opacity -= 0.7 * deltaTime; }
            else { text.opacity += 0.7 * deltaTime; };
            if (text.opacity > 1) { text.opacity = 1; }
            else if (text.opacity < 0.3) { text.opacity = 0.3; }
        };

    }
    checkAndSolveCollisions() {
        if (game.isGameStarted) {
            putCircleInSquare(this.player.position, this.player.collision.circle.radius, new Vec(0, 0), this.zoneSize);

            var i, j, selectedObject;
            /* Bounce Enemies Off The Zone */
            for (i = this.objects.enemies.length - 1; i > -1; i--) {
                selectedObject = this.objects.enemies[i];
                if (!isCircleInSquare(selectedObject.position, selectedObject.collision.circle.radius, new Vec(0, 0), this.zoneSize)) {
                    if (selectedObject.collision.ploygon !== undefined) {
                        if (!isPloygonInSquare(selectedObject.collision.ploygon.points, selectedObject.design.scale, selectedObject.rotation, selectedObject.position, new Vec(0, 0), this.zoneSize)) {
                            bounceCircleInSquareOffSides(selectedObject.position, selectedObject.collision.circle.radius, selectedObject.velocity, new Vec(0, 0), this.zoneSize);
                        };
                    }
                    else if (selectedObject.collision.circle !== undefined) {
                        bounceCircleInSquareOffSides(selectedObject.position, selectedObject.collision.circle.radius, selectedObject.velocity, new Vec(0, 0), this.zoneSize);
                    };
                };

            }

            /* Filter Missiles Out Of Zone */
            for (i = this.objects.missiles.length - 1; i > -1; i--) {
                if (!isPointInSquare(this.objects.missiles[i].position, new Vec(0, 0), this.zoneSize)) {
                    this.objects.blasts.push(new Blast(this.objects.missiles[i].position, this.objects.missiles[i].design.color, 6, 3, 1));
                    this.objects.missiles.splice(i, 1);
                }

                /* Blast Enemies */
                else {
                    for (j = this.objects.enemies.length - 1; j > -1; j--) {
                        if (isPointInCircle(this.objects.missiles[i].position, this.objects.enemies[j].position, this.objects.enemies[j].collision.circle.radius)) {
                            this.objects.missiles.splice(i, 1);
                            if (this.objects.enemies[j].life === 1) {
                                this.score += this.objects.enemies[j].score;
                                this.setBestScore();
                                this.objects.blasts.push(new Blast(this.objects.enemies[j].position, this.objects.enemies[j].design.color, 30, 10, 2));
                                this.objects.enemies.splice(j, 1);
                            } else {
                                this.objects.enemies[j].life--;
                            };
                            break;
                        };
                    };
                }
            };

            if (!this.isGameOver) {
                for (j = this.objects.enemies.length - 1; j > -1; j--) {
                    if (areCirclesColliding(this.player.position, this.player.collision.circle.radius, this.objects.enemies[j].position, this.objects.enemies[j].collision.circle.radius)) {
                        this.isGameOver = true;
                        this.playerBlast = new Blast(this.player.position.clone(), this.player.design.color, 160, 20, 2);
                        break;
                    };
                };
                if (this.isGameOver) {
                    for (j = this.objects.enemies.length - 1; j > -1; j--) {
                        this.objects.blasts.push(new Blast(this.objects.enemies[j].position, this.objects.enemies[j].design.color, 30, 10, 2));
                    };
                    this.objects.enemies = [];
                    for (i = this.objects.missiles.length - 1; i > -1; i--) {
                        this.objects.blasts.push(new Blast(this.objects.missiles[i].position, this.objects.missiles[i].design.color, 6, 3, 1));
                    };
                    this.objects.missiles = [];
                };
            };

        };
    }
    draw() {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, cvs.width, cvs.height);

        var canvasScaledWidth, canvasScaledHeight, canvasScale;

        if (cvs.width > cvs.height) {
            canvasScaledWidth = this.zoneSize;
            canvasScaledHeight = this.zoneSize * (cvs.height / cvs.width);
            canvasScale = cvs.width / this.zoneSize;
        } else {
            canvasScaledHeight = this.zoneSize;
            canvasScaledWidth = this.zoneSize * (cvs.width / cvs.height);
            canvasScale = cvs.height / this.zoneSize;
        };
        ctx.scale(canvasScale, canvasScale);

        if (this.isGameStarted) {
            var scoreText;
            if (this.bestScore > this.score) { scoreText = this.score + ' - ' + this.bestScore; } else { scoreText = this.score; };
            scoreText = 'Score: ' + scoreText;
            ctx.font = "2px Arial";
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";
            ctx.fillText(scoreText, canvasScaledWidth / 2, 3);
        };

        ctx.translate((canvasScaledWidth / 2) - this.player.position.x, (canvasScaledHeight / 2) - this.player.position.y);
        if (game.isGameStarted) {
            /* Show All Objects */
            var i, objectType;
            for (objectType in this.objects) {
                for (i = this.objects[objectType].length - 1; i > -1; i--) {
                    this.objects[objectType][i].draw(this);
                };
            };
        } else {
            ctx.globalAlpha = this.startPad.tapToStart.opacity;
            ctx.font = "3px Arial";
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";
            ctx.fillText("Tap To Start", this.zoneSize / 2, this.zoneSize / 1.5);
            ctx.globalAlpha = 1;
        };

        if (!this.isGameOver) { this.player.show(); }
        else { this.playerBlast.draw(this); };

        ctx.strokeStyle = this.zoneColor;
        ctx.lineWidth = this.zoneLineWidth;
        ctx.strokeRect(-this.zoneLineWidth / 2, -this.zoneLineWidth / 2, this.zoneSize + this.zoneLineWidth, this.zoneSize + this.zoneLineWidth);
    }
    setBestScore() {
        if (this.score > this.bestScore) { this.bestScore = this.score; window.localStorage.gzbestScore = String(this.bestScore); };
        if (window.localStorage.gzbestScore !== undefined) { this.bestScore = Number(window.localStorage.gzbestScore); };
    }
}

function gameLoop() {
    deltaTime = (Date.now() - timeStamp) / 1000;
    timeStamp = Date.now();
    game.update();
    game.checkAndSolveCollisions();
    game.draw();
    window.requestAnimationFrame(gameLoop);
}

/* Game Startup */
function setCanvas() { cvs.width = window.innerWidth * 2; cvs.height = window.innerHeight * 2; cvs.style.width = window.innerWidth + 'px'; cvs.style.height = window.innerHeight + 'px'; }
setCanvas(); window.addEventListener('resize', setCanvas);

cvs.addEventListener("click", function () {
    if (isFullScreen) {
        game.isGameStarted = true;
    };
    isFullScreen = true;
    openFullScreen();
});


game = new Game();
game.reset();
game.setBestScore();
timeStamp = Date.now();
window.requestAnimationFrame(gameLoop);