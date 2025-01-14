import _ from 'lodash';

import { SVG } from '@svgdotjs/svg.js';
import { Canvas } from './canvas';
import { Coords } from '../utils/coords';
import { DIRECTION } from '../constantes';

class Junction {
    static DEFAULTFILL = '#000000';
    /** @type {SVG.Line} */
    #node;

    /** @type {Array<Segment>} */
    #edges;

    /**
     * constructeur
     * @param {Canvas} canvas 
     * @param {number} line 
     * @param {number} col 
     */
    constructor(canvas, line, col) {
        this.#node = canvas.disc(line, col, Segment.WIDTH/canvas.unit);
        this.#node.fill('none').stroke('none');
        this.#edges = [];
    }    

    /**
     * assigne un segment attaché à la jonction
     * @param {Segment} edge
     * @returns {Junction}
     */
    attachEdge(edge) {
        this.#edges.push(edge);
        return this;
    }

    refresh() {
        let colors = [];
        for (let s of this.#edges) {
            let c = s.color;
            if ((c == 'none')||(colors.indexOf(c) != -1)) {
                continue;
            }
            colors.push(c);
        }
        if (colors.length == 0) {
            this.#node.fill('none');
        } else if (colors.length == 1) {
            this.#node.fill(colors[0]);
        } else {
            this.#node.fill(Junction.DEFAULTFILL);
        }
    }


}

class Segment {
    static WIDTH = 10;
    /** @type {SVG.Line} */
    #node

    /** @type {Array<Junction>} */
    #extremity;

    /** @type {string} */
    #color;

    /**
     * constructeur
     * @param {Canvas} canvas 
     * @param {number} line 
     * @param {number} col 
     * @param {boolean} vert 
     */
    constructor(canvas, line, col, vert) {
        let start = new Coords(col, line);
        let end = vert? new Coords(col,line+1) : new Coords(col+1,line);
        this.#node = canvas.segment(start, end);
        this.#node.fill('none').stroke('none');
        this.#extremity = []
        this.#color = 'none';
    }

    /**
     * assigne les extrémités
     * @param {Junction} a 
     * @returns {Segment}
     */
    attachJunction(a) {
        this.#extremity.push(a);
        a.attachEdge(this);
        return this;
    }

    /**
     * accesseur
     * @returns {string}
     */
    get color() {
        return this.#color;
    }

    /**
     * assigne une couleur
     * @param {string} color 
     * @returns {Segment}
     */
    setColor(color) {
        this.#color = color;
        this.#node.stroke({color:color, width:Segment.WIDTH});
        for (let j of this.#extremity) {
            j.refresh();
        }
        return this;
    }

    /**
     * Bascule la couleur du segment
     * @param {string} color
     * @returns {Segment}
     */
    toggleColor(color) {
        if (this.color == color) {
            return this.hide();
        } else {
            return this.setColor(color);
        }
    }

    /**
     * cache le segment
     * @returns {Segment}
     */
    hide() {
        return this.setColor('none');
    }

}

class Borders {
    /** @type {number} */
    #width

    /** @type {number} */
    #height

    /** @type {Array<Segment>} */
    #verticals

    /** @type {Array<Segment>} */
    #horizontals

    /**
     * constructeur
     * @param {Canvas} canvas 
     * @param {number} width 
     * @param {number} height 
     */
    constructor(canvas, width, height) {
        this.#width = width;
        this.#height = height;
        this.#verticals = [];
        for (let line=0; line<height; line++) {
            for (let col=0; col<width+1; col++){
                this.#verticals.push(new Segment(canvas, line, col, true));
            }
        }
        this.#horizontals = [];
        for (let line=0; line<height+1; line++) {
            for (let col=0; col<width; col++){
                this.#horizontals.push(new Segment(canvas, line, col, false));
            }
        }
        for (let col=0; col<width+1; col++){
            for (let line=0; line<height+1; line++) {
                let j = new Junction(canvas, line, col);
                if (line>0) {
                    this.#verticals[(line-1)*(this.#width+1) + col].attachJunction(j);
                }
                if (line<this.#height) {
                    this.#verticals[line*(this.#width+1) + col].attachJunction(j);
                }
                if (col>0) {
                    this.#horizontals[line*this.#width + col-1].attachJunction(j);
                }
                if (col<this.#width) {
                    this.#horizontals[line*this.#width + col].attachJunction(j);
                }
            }
        }
    }

    /**
     * renvoie [line, col] correspondant à un index
     * @param {number} index 
     * @returns {[number,number]}
     */
    #lineCol(index) {
        let line = Math.floor(index/this.#width);
        let col = index - line*this.#width;
        return [line, col];
    }

    /**
     * renvoie les segments sur le bord demandé
     * @param {number[]} indexes liste des index des cellules
     * @param {number} direction
     * @returns {Array<Segment>}
     */
    get(indexes, direction) {
        if (direction == DIRECTION.LEFT) {
            return this.#getLeft(indexes);
        } else if (direction == DIRECTION.RIGHT) {
            return this.#getRight(indexes);
        } else if (direction == DIRECTION.UP) {
            return this.#getTop(indexes);
        } else if (direction == DIRECTION.DOWN) {
            return this.#getBottom(indexes);
        } 
        return _.union(
            this.#getLeft(indexes),
            this.#getRight(indexes),
            this.#getTop(indexes),
            this.#getBottom(indexes)
        );
    }


    /**
     * renvoie les segments des cellules sur le bord gauche
     * @param {number[]} indexes liste des index des cellules
     * @returns {Array<Segment>}
     */
    #getLeft(indexes) {
        let out = [];
        for (let i of indexes) {
            let [line, col] = this.#lineCol(i);
            let iCellNeighbour = line*this.#width + col - 1;
            if ((col==0) || (indexes.indexOf(iCellNeighbour)<0)) {
                out.push(this.#left(line, col));
            }
        }
        return out;
    }

    /**
     * renvoie les segments des cellules sur le bord droit
     * @param {number[]} indexes liste des index des cellules
     * @returns {Array<Segment>}
     */
    #getRight(indexes) {
        let out = [];
        for (let i of indexes) {
            let [line, col] = this.#lineCol(i);
            let iCellNeighbour = line*this.#width + col + 1;
            if ((col==this.#width-1) || (indexes.indexOf(iCellNeighbour)<0)) {
                out.push(this.#right(line, col));
            }
        }
        return out;
    }

    /**
     * renvoie les segments des cellules sur le bord haut
     * @param {number[]} indexes liste des index des cellules
     * @returns {Array<Segment>}
     */
    #getTop(indexes) {
        let out = [];
        for (let i of indexes) {
            let [line, col] = this.#lineCol(i);
            let iCellNeighbour = (line-1)*this.#width + col;
            if ((line==0) || (indexes.indexOf(iCellNeighbour)<0)) {
                out.push(this.#up(line, col));
            }
        }
        return out;
    }

    /**
     * renvoie les segments des cellules sur le bord haut
     * @param {number[]} indexes liste des index des cellules
     * @returns {Array<Segment>}
     */
    #getBottom(indexes) {
        let out = [];
        for (let i of indexes) {
            let [line, col] = this.#lineCol(i);
            let iCellNeighbour = (line+1)*this.#width + col;
            if ((line==this.#height-1) || (indexes.indexOf(iCellNeighbour)<0)) {
                out.push(this.#down(line, col));
            }
        }
        return out;
    }

    /**
     * renvoie le segment supérieur
     * @param {number} line 
     * @param {number} col 
     * @returns {Segment}
     */
    #up(line, col) {
        if ((line<0) || (line>=this.#height) || (col<0) || (col>=this.#width)) {
            throw new Error(`line:${line} col:${col} n'est pas dans la grille !`);
        }
        return this.#horizontals[line*this.#width + col];
    }

    /**
     * renvoie le segment inférieur
     * @param {number} line 
     * @param {number} col 
     * @returns {Segment}
     */
    #down(line, col) {
        if ((line<0) || (line>=this.#height) || (col<0) || (col>=this.#width)) {
            throw new Error(`line:${line} col:${col} n'est pas dans la grille !`);
        }
        return this.#horizontals[(line+1)*this.#width + col];
    }

    /**
     * renvoie le segment de gauche
     * @param {number} line 
     * @param {number} col 
     * @returns {Segment}
     */
    #left(line, col) {
        if ((line<0) || (line>=this.#height) || (col<0) || (col>=this.#width)) {
            throw new Error(`line:${line} col:${col} n'est pas dans la grille !`);
        }
        return this.#verticals[line*(this.#width+1) + col];
    }

    /**
     * renvoie le segment de droite
     * @param {number} line 
     * @param {number} col 
     * @returns {Segment}
     */
    #right(line, col) {
        if ((line<0) || (line>=this.#height) || (col<0) || (col>=this.#width)) {
            throw new Error(`line:${line} col:${col} n'est pas dans la grille !`);
        }
        return this.#verticals[line*(this.#width+1) + col+1];
    }
}


export { Borders }
