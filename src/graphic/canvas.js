/* Gère la création d'objets graphiques élémentaires */

import _ from 'lodash';

import { SVG } from '@svgdotjs/svg.js';
import { Contour } from '../utils/contour';
import { Text } from './text.js';
import { Coords } from '../utils/coords.js';

class Canvas {
    /** @type {SVG.SVG} */
    #group;
    /** @type {number} */
    #unit;
    /** @type {number} */
    #marge;

    /**
     * Constructeur
     * @param {SVG.SVG} parent 
     * @param {number} unit 
     * @param {number} marge 
     */
    constructor(parent, unit, marge=1) {
        this.#group = parent.nested();
        this.#unit = unit;
        this.#marge = marge;
    }
    /**
     * Construit un sous-canvas fonctionnant comme un calque.
     * @returns {Canvas}
     */
    sublayer() {
        return new Canvas(this.#group, this.#unit, this.#marge);
    }

    /**
     * renvoie un groupe
     * @returns {SVG.G}
     */
    group() {
        return this.#group.group();
    }

    /**
     * renvoie le nœud svg
     * @returns {SVG.SVG}
     */
    node() {
        return this.#group;
    }

    /**
     * Renvoie un code #rgb d'après une lettre codant la couleur
     * @param {string} code 
     * @returns {string}
     */
    static color(code) {
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
            case 'x': return 'none'; // transparent
            default: return '#000';
        }
    }

    /**
     * calcule une (ou plusieurs) coordonnées tenant compte de la taille de l'unité
     * en pixels et de la marge.
     * @param {Array<number>|Array<Coords>|Coords|number} u 
     * @returns {Array<number>|number[][]|number}
     */
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

    /**
     * calcule une (ou plusieurs) valeurs dans l'unitécoordonnées tenant compte de la taille de l'unité
     * en pixels et de la marge.
     * @param {Array<number>|number} x 
     * @returns {Array<number>|number}
     */
    valueToUnit(x) {
        if (Array.isArray(x)) {
            let that = this;
            return _.map(x, function(v){ return that.valueToUnit(v); });
        }
        return x/this.#unit - this.#marge;
    }

    /**
     * Renvoie un SVG représentant un carré dont le con supérieur gauche est
     * en line, col et de talle size, le tout exprimé en unité du canvas.
     * @param {number} line 
     * @param {number} col 
     * @param {number} size 
     * @param {number} radius
     * @returns {SVG.Rect}
     */
    square(line, col, size, radius=0) {
        let c = this.#group.rect(size*this.#unit, size*this.#unit).radius(radius*this.#unit);
        c.move((col+this.#marge)*this.#unit, (line+this.#marge)*this.#unit);
        return c;
    }

    /**
     * Renvoie un SVG représentant un rect dont le con supérieur gauche est
     * en line, col et de talle size, le tout exprimé en unité du canvas.
     * @param {number} line 
     * @param {number} col 
     * @param {number} width
     * @param {number} height
     * @param {number} radius
     * @returns {SVG.Rect}
     */
    rect(line, col, width, height, radius=0) {
        let r = this.#group.rect(width*this.#unit, height*this.#unit).radius(radius*this.#unit);
        r.move((col+this.#marge)*this.#unit, (line+this.#marge)*this.#unit);
        return r;
    }

    /**
     * Renvoie un disque SVG en line, col et de taille size
     * exprimé en unité du canvas
     * @param {number} line 
     * @param {number} col 
     * @param {number} size valeur par défaut: 0.75
     * @returns {SVG.Circle}
     */
    disc(line, col, size=0.75) {
        /* line, col: positions du centre du disque
           size: diamètre
           dessine un disque
        */
        let d = this.#group.circle(size*this.#unit);
        d.move((col-size/2+this.#marge)*this.#unit, (line-size/2+this.#marge)*this.#unit);
        return d;
    }

    /**
     * Renvoie le SVG d'une ligne brisée
     * @param {string|Array<number>} coords : soit une chaine de coordonnées, soit une liste
     * @returns {SVG.Polyline}
     */
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
    
    /**
     * renvoie un nœud ligne
     * @param {Coords|[number, number]} start 
     * @param {Coords|[number, number]} end 
     * @returns {SVG.Line}
     */
    segment(start, end) {
        let [x1, y1] = this.unitToValue(start);
        let [x2, y2] = this.unitToValue(end);
        return this.#group.line(x1, y1, x2, y2);
    }

    /**
     * Crée un objet texte SVG
     * @param {string} chaine la chaine à afficher
     * @param {Coords, [number,number]} coord objet Coords ou tableau [x,y]
     * @param {number} size 
     * @returns {Text}
     */
    text(chaine, coord, size) {
        let [x, y] = this.unitToValue(coord);
        let text = new Text(this, chaine, size*this.#unit);
        text.move(x,y);
        return text;
    }

    /**
     * Renvoi un objet svg polygone
     * @param {string|Array<number>|Array<[number,number]>|Array<Coords>} coords 
     * @returns {SVG.polygon}
     */
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
        let xyValues = _.flatten(this.unitToValue(coords));
        return this.#group.polygon(xyValues);
    }

    /**
     * À partir d'une liste de coordonnées, crée le ou les cadres qui entoure les
     * cellules correspondantes. Les cellules n'étant pas forcément connexes, il peut
     * y avoir plusieurs cadres. Le résultat renvoyé est alors toujours un tableau
     * contenant des SVG.Polygon
     * @param {Array<coords>} coords tableau de coordonnées, liste des cellules à cadrer
     * @param {number} margin Marge intérieur par rapport au cadre des cellules
     * @returns {Array<SVG.Polygon>}
     */
    cadre(coords, margin) {
        if (!Array.isArray(coords) || (coords.length ==0)) {
            throw new Error('coords: mauvais format');
        }
        let c = new Contour(coords);
        let paths = c.getPaths(margin);
        let that = this;
        return _.map(paths, function(p){ return that.polygon(p); });
    }

    /**
     * Renvoie les cellules dessinées
     * @param {number} height Nombre de lignes
     * @param {number} width Nombre de colonnes
     * @param {Object} stroke options pour le style de ligne
     * @param {number} xstep taille du motif de grille, horizontalement, en nombre de cases
     * @param {number} ystep taille du motif de grille, verticalement, en nombre de cases
    * @returns 
     */
    grid(height, width, stroke, xstep, ystep) {
        let cells = [];
        for (let line=0; line<height; line+=ystep) {
            for (let col=0; col<width; col+=xstep) {
                let c = this.rect(line, col, xstep, ystep);
                c.fill('none').stroke(stroke);
                cells.push(c);
            }
        }
        return cells;
    }

    /**
     * vide le canvas
     */
    clear() {
        this.#group.clear();
    }

    /**
     * Accesseur vers l'échelle en pixels/unité
     * @returns {number}
     */
    get unit() {
        return this.#unit;
    }
}

export { Canvas };