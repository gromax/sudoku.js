/* Gère la création d'objets graphiques élémentaires */

import _ from 'lodash';

import { SVG } from '@svgdotjs/svg.js';
import { Contour } from '../utils/contour';
import { Text } from './text.js';
import { Coords } from '../utils/coords.js';

class Canvas {
    #group;
    #unit;
    #marge;

    /**
     * Constructeur
     * @param {SVG.SVG} parent 
     * @param {Number} unit 
     * @param {Number} marge 
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
     * @param {Array|Coords|number} u 
     * @returns {Array|Number}
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
     * Renvoie un SVG représentant un carré dont le con supérieur gauche est
     * en line, col et de talle size, le tout exprimé en unité du canvas.
     * @param {Number} line 
     * @param {Number} col 
     * @param {Number} size 
     * @returns {SVG.Rect}
     */
    square(line, col, size) {
        let c = this.#group.rect(size*this.#unit, size*this.#unit);
        c.move((col+this.#marge)*this.#unit, (line+this.#marge)*this.#unit);
        return c;
    }

    /**
     * Renvoie un disque SVG en line, col et de taille size
     * exprimé en unité du canvas
     * @param {Number} line 
     * @param {Number} col 
     * @param {Number} size valeur par défaut: 0.75
     * @returns {SVG.Circle}
     */
    disc(line, col, size=0.75) {
        /* line, col: positions du centre du disque
           size: diamètre
           dessine un disque
        */
        let d = this.#group.circle(size*this.#unit, size*this.#unit);
        d.move((col-size/2+this.#marge)*this.#unit, (line-size/2+this.#marge)*this.#unit);
        return d;
    }

    /**
     * Renvoie le SVG d'une ligne brisée
     * @param {string|Array} coords : soit une chaine de coordonnées, soit une liste
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
     * Crée un objet texte SVG
     * @param {string} chaine la chaine à afficher
     * @param {Coords, Array} coord objet Coords ou tableau [x,y]
     * @param {Number} size 
     * @returns {Text}
     */
    text(chaine, coord, size) {
        let [x, y] = this.unitToValue(coord);
        let text = new Text(this.#group, chaine, size*this.#unit);
        text.move(x,y);
        return text;
    }

    /**
     * Renvoi un objet svg polygone
     * @param {string|Array} coords 
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
        let xyValues = this.unitToValue(coords);
        return this.#group.polygon(xyValues);
    }

    /**
     * À partir d'une liste de coordonnées, crée le ou les cadres qui entoure les
     * cellules correspondantes. Les cellules n'étant pas forcément connexes, il peut
     * y avoir plusieurs cadres. Le résultat renvoyé est alors toujours un tableau
     * contenant des SVG.Polygon
     * @param {Array} coords tableau de coordonnées, liste des cellules à cadrer
     * @param {Number} margin Marge intérieur par rapport au cadre des cellules
     * @returns {Array}
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
     * @param {Number} height Nombre de lignes
     * @param {Number} width Nombre de colonnes
     * @param {*} stroke options pour le style de ligne
     * @param {Number} step taille du motif de grille en nombre de cases
     * @returns 
     */
    grid(height, width, stroke, step) {
        let cells = [];
        for (let line=0; line<height; line+=step) {
            for (let col=0; col<width; col+=step) {
                let c = this.square(line, col, step);
                c.fill('none').stroke(stroke);
                cells.push(c);
            }
        }
        return cells;
    }

    /**
     * Accesseur vers l'échelle en pixels/unité
     * @returns {Number}
     */
    get unit() {
        return this.#unit;
    }
}

export { Canvas };