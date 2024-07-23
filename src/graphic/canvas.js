/* Gère la création d'objets graphiques élémentaires */

import _ from 'lodash';

class Canvas {
    #group;
    #unit;
    #marge;
    constructor(parent, unit, marge=1) {
        this.#group = parent.nested();
        this.#unit = unit;
        this.#marge = marge;
    }

    unitToValue(u) {
        return (u+this.#marge)*this.#unit;
    }

    coordToArray(c) {
        return [this.unitToValue(c.x), this.unitToValue(c.y)];
    }

    rect(line, col, size) {
        let c = this.#group.rect(size*this.#unit, size*this.#unit);
        c.move((col+this.#marge)*this.#unit, (line+this.#marge)*this.#unit);
        return c;
    }

    disc(line, col, size=0.75) {
        let d = this.#group.circle(size*this.#unit, size*this.#unit);
        d.move((col+(1-size)/2+this.#marge)*this.#unit, (line+(1-size)/2+this.#marge)*this.#unit);
        return d;
    }

    line(coords) {
        let line;

        if (typeof coords == 'string') {
            return this.#group.polyline(coords);
        }
        if (!Array.isArray(coords)) {
            throw new Error('coords: mauvais type');
        }
        if (coords.length == 0) {
            return this.#group.polyline('');
        }
        let xyValues;
        if ((typeof coords[0] == 'object')&&(coords[0].constructor.name == "Coords")) {
            let that = this;
            xyValues = _.map(coords, function(c){ return that.coordToArray(c); });
        } else {
            let that = this;
            xyValues = _.map(coords, function(c){ return [that.unitToValue(c[0]), that.unitToValue(c[1])]; });
        }
        
        return this.#group.polyline(xyValues);
    }
}

export { Canvas };