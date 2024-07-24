/* Gère la création d'objets graphiques élémentaires */

import _ from 'lodash';

import { Contour } from '../utils/contour';

class Canvas {
    #group;
    #unit;
    #marge;
    constructor(parent, unit, marge=1) {
        this.#group = parent.nested();
        this.#unit = unit;
        this.#marge = marge;
    }

    color(code) {
        switch(code) {
            case 'b': return '#36f'; // bleu
            case 'r': return '#b00'; // rouge
            case 'p': return '#ff33cc'; // purple
            case 'o': return '#ff6600'; // orange
            case 'y': return '#ffcc00'; // yellow
            case '_': return '#aaa'; // gris
            case 'v': return '#90c'; // violet
            case 'w': return '#fff'; // white
            case 'g': return '#690'; // green
            case 't': return '#0ff'; // turquoise
            case 'm': return '#960'; // marron
            default: return '#000';
        }
    }

    unitToValue(u) {
        if (Array.isArray(u)) {
            let that = this;
            return _.map(u, function(v){ return that.unitToValue(v); });
        }
        if ((typeof u == 'object') && (u.constructor.name == 'Coords')) {
            return this.unitToValue([u.x, u.y]);
        }
        return (u+this.#marge)*this.#unit;
    }

    rect(line, col, size) {
        let c = this.#group.rect(size*this.#unit, size*this.#unit);
        c.move((col+this.#marge)*this.#unit, (line+this.#marge)*this.#unit);
        return c;
    }

    disc(line, col, size=0.75) {
        /* line, col: positions du centre du disque
           size: diamètre
           dessine un disque
        */
        let d = this.#group.circle(size*this.#unit, size*this.#unit);
        d.move((col-size/2+this.#marge)*this.#unit, (line-size/2+this.#marge)*this.#unit);
        return d;
    }

    line(coords) {
        if (typeof coords == 'string') {
            return this.#group.polyline(coords);
        }
        if (!Array.isArray(coords)) {
            throw new Error('coords: mauvais type');
        }
        if (coords.length == 0) {
            return this.#group.polyline('');
        }
        let xyValues = this.unitToValue(coords);
        return this.#group.polyline(xyValues);
    }

    text(chaine, coord) {
        let [x, y] = this.unitToValue(coord);
        let subgroup = this.#group.nested();
        let textSvg = subgroup.text(chaine).fill('#000');
        subgroup.move(x, y);
        let box = textSvg.node.getBBox();
        textSvg.dmove(2, box.height);
        let rect = subgroup.rect(box.width+4, box.height+4).fill('#fff');
        rect.after(textSvg);
        return subgroup;
    }

    polygon(coords) {
        if (typeof coords == 'string') {
            return this.#group.polygon(coords);
        }
        if (!Array.isArray(coords)) {
            throw new Error('coords: mauvais type');
        }
        if (coords.length == 0) {
            return this.#group.polygon('');
        }
        let xyValues = this.unitToValue(coords);
        return this.#group.polygon(xyValues);
    }

    cadre(coords) {
        if (!Array.isArray(coords) || (coords.length ==0)) {
            throw new Error('coords: mauvais format');
        }
        let c = new Contour(coords);
        let paths = c.getPaths(0.1);
        let that = this;
        return _.map(paths, function(p){ return that.polygon(p); });
    }
}

export { Canvas };