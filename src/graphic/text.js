class Text {
    #group;
    #text;
    #cadre;
    #width;
    #height;
    #x = 0;
    #y = 0;
    #anchor = 'NW';
    #xAnchor = 0;
    #yAnchor = 0;

    static ANCRES = {
        "N" : {x:0.5, y:0,   clockwise:"E",  counterclockwise:"W" },
        "NE": {x:1,   y:0,   clockwise:"SE", counterclockwise:"NW"},
        "E" : {x:1,   y:0.5, clockwise:"S",  counterclockwise:"N" },
        "SE": {x:1,   y:1,   clockwise:"SW", counterclockwise:"NE"},
        "S" : {x:0.5, y:1,   clockwise:"W",  counterclockwise:"E" },
        "SW": {x:0,   y:1,   clockwise:"NW", counterclockwise:"SE"},
        "W" : {x:0,   y:0.5, clockwise:"N",  counterclockwise:"S" },
        "C" : {x:0.5, y:0.5, clockwise:"C",  counterclockwise:"C" },
    }
    constructor(parent, chaine, size) {
        this.#group = parent.group();
        this.#text = this.#group.text(chaine).fill('#000').css('font-size', size);
        let box = this.#text.node.getBBox();
        this.#text.dmove(-box.x + 0.1*box.width, -box.y + 0.1*box.height); // ancre NW
        this.#text.css({"pointer-events": "none"});
        this.#width = box.width*1.2;
        this.#height = box.height*1.2;
        this.#cadre = this.#group.rect(this.#width, this.#height).fill('none');
        this.#cadre.after(this.#text);
        this.#cadre.stroke('none');
    }

    anchor(ancre) {
        if (typeof(ancre) == 'undefined') {
            return this.#anchor;
        }
        if (typeof(Text.ANCRES[ancre]) == 'undefined') {
            throw new Error(`Ancre ${ancre} invalide.`);
        }
        let xAnchor = Text.ANCRES[ancre].x * this.#width;
        let yAnchor = Text.ANCRES[ancre].y * this.#height;
        this.#anchor = ancre;
        this.#dmove(this.#xAnchor - xAnchor, this.#yAnchor - yAnchor);
        this.#xAnchor = xAnchor;
        this.#yAnchor = yAnchor;
        return this;
    }

    #dmove(dx, dy) {
        this.#text.dmove(dx,dy);
        this.#cadre.dmove(dx,dy);
    }

    stroke(color) {
        this.#text.fill(color);
        if (this.#cadre.fill() != 'none') {
            this.#cadre.stroke(color);
        }
        return this;
    }

    fill(color) {
        if (color == 'none') {
            this.#cadre.fill('none').stroke('none');
        } else {
            this.#cadre.fill(color).stroke(this.#text.fill());
        }
        return this;
    }

    move(x, y) {
        this.#dmove(x - this.#x, y-this.#y);
        this.#x = x;
        this.#y = y;
        return this;
    }

    dmove(dx, dy) {
        this.#dmove(dx, dy);
        this.#x += dx;
        this.#y += dy;
    }

    get width() {
        return this.#width;
    }

    get height() {
        return this.#height;
    }

    get x() {
        return this.#x;
    }

    get y() {
        return this.#y;
    }

    turnClockWise() {
        this.#text.rotate(90,this.#x,this.#y);
        this.#cadre.rotate(90,this.#x,this.#y);
        return this;
    }

    turnCounterClockWise() {
        this.#text.rotate(-90,this.#x,this.#y);
        this.#cadre.rotate(-90,this.#x,this.#y);
        return this;
    }
}

export { Text };