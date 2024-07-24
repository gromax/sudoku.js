/* Gère la création de la grille */

import { SVG } from '@svgdotjs/svg.js';

import { Canvas } from './canvas';
import { Coords } from '../utils/coords';

class Board {
    static SIZE = 1100;
    static DEFAULTCELLSIZE = 100;
    static GRIDSTROKE = { width:2, color:'#000' };
    static GRIDTHICKSTROKE = { width:5, color:'#000' };
    #height;
    #width;
    #content;
    #cellsize;
    #cellgrid;
    #canvas;
    constructor(id, commande) {
        this.#content = SVG().addTo('#board').size(Board.SIZE, Board.SIZE);
        this.#cellsize = Board.DEFAULTCELLSIZE;
        this.#content.rect(Board.SIZE, Board.SIZE).fill('#fff').stroke('none');
        this.#cellgrid = [];
        
        this.#parse_commande(commande.trim());
    }

    #parse_commande(commande) {
        let r = new RegExp("^(?<height>[1-9][0-9]*)(x(?<width>[1-9][0-9]*))?(?<type>S)?:(?<coms>.*)$", "g");
        let matchs = r.exec(commande);
        if (matchs === null){
            throw new Error("Commande invalide");
        }
        let g = matchs.groups;
        this.#height = parseInt(g.height);
        if (g.width) {
            this.#width = parseInt(g.width);
        } else {
            this.#width = this.#height;
        }
        /* on compte une marge d'une case de tous les côtés */
        this.#cellsize = Math.min(Board.SIZE/(this.#height+2), Board.SIZE/(this.#width+2));
        this.#canvas = new Canvas(this.#content, this.#cellsize);
        this.#drawGrid();
        if (g.type == 'S') {
            this.#drawSudoku();
        }

        let coms = g.coms.split(';');
        for (let com of coms) {
            if (this.#tryThermo(com)) {
                continue;
            }
            if (this.#tryThickCenterLine(com)) {
                continue;
            }
            if (this.#tryDotCage(com)) {
                continue;
            }
            console.log(com + " ne donne rien")
        }
    }

    #getCoords(chaine) {
        let r2 = new RegExp("([A-Z])([0-9]+)", "g");
        let points = chaine.match(r2);
        if (points === null) {
            throw new Error(chaine + ": pas une chaine de coordonnées valide");
        }
        let output = [];
        for (let p of points) {
            let line = p.charCodeAt(0) - 65;
            let colonne = parseInt(p.substring(1));
            let c = new Coords(colonne, line);
            output.push(c);
        }
        return output;
    }

    #tryThermo(com) {
        let r = new RegExp("^Th(?<chaine>([A-Z][0-9]+)+)(?<color>[a-zA-Z_])?$", "g");
        let m = r.exec(com);
        if (m === null) {
            return false;
        }
        let coords = this.#getCoords(m.groups.chaine);
        let color = this.#canvas.color(m.groups.color || '_');
        this.#canvas.disc(coords[0].line, coords[0].col).fill(color).stroke('none');
        this.#canvas.line(coords).fill('none').stroke({width:this.#cellsize/4, color:color}).dmove(this.#cellsize/2, this.#cellsize/2);
        return true;
    }

    #tryThickCenterLine(com){
        let r = new RegExp("^Tcl(?<chaine>([A-Z][0-9]+)+)(?<color>[a-zA-Z_])?$", "g");
        let m = r.exec(com);
        if (m === null) {
            return false;
        }
        let coords = this.#getCoords(m.groups.chaine);
        let color = this.#canvas.color(m.groups.color || '_');
        this.#canvas.line(coords).fill('none').stroke({width:this.#cellsize/4, color:color}).dmove(this.#cellsize/2, this.#cellsize/2);
        return true;
    }

    #tryDotCage(com){
        let r = new RegExp("^Dc(?<chaine>([A-Z][0-9]+)+)(?<color>[a-zA-Z_])?$", "g");
        let m = r.exec(com);
        if (m === null) {
            return false;
        }
        let coords = this.#getCoords(m.groups.chaine);
        let color = this.#canvas.color(m.groups.color || '_');
        let polygons = this.#canvas.cadre(coords);
        for (let pol of polygons) {
            pol.fill('none').stroke({width:3, color:color}).attr('stroke-dasharray', '10');
        }
        return true;
    }

    #drawGrid() {
        for (let line=0; line<this.#height; line++) {
            for (let col=0; col<this.#width; col++) {
                let c = this.#canvas.rect(line, col, 1);
                c.fill('none').stroke(Board.GRIDSTROKE);
                this.#cellgrid.push(c);
            }
        }
    }

    #drawSudoku() {
        if ((this.#height != 9) || (this.#width != 9)){
            throw new Error("Dimensions invalides pour une grille de Sudoku")
        }
        for (let line=0; line<this.#height; line+=3) {
            for (let col=0; col<this.#width; col+=3) {
                let c = this.#canvas.rect(line, col, 3);
                c.fill('none').stroke(Board.GRIDTHICKSTROKE);
            }
        }
    }
}

export { Board };