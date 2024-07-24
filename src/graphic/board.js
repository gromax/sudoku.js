/* Gère la création des la grille */

import { SVG } from '@svgdotjs/svg.js';

import { Canvas } from './canvas';
import { Coords } from '../utils/coords';

class Board {
    static SIZE = 1100;
    static DEFAULTCELLSIZE = 100;
    static GRIDSTROKE = { width:2, color:'#000' };
    static GRIDTHICKSTROKE = { width:5, color:'#000' };
    #height;    // nombre de cellules en hauteur
    #width;     // nombre de cellules en largeur
    #content;   // groupe svg pour le contenu
    #cellsize;  // taille d'une cellule carrée, en unités svg
    #cellsgrid; // liste des cellules de la grille
    #canvas;    // objet chargé d'exécuter les dessins élémentaires
    constructor(id, commande) {
        this.#content = SVG().addTo('#board').size(Board.SIZE, Board.SIZE);
        this.#cellsize = Board.DEFAULTCELLSIZE;
        this.#content.rect(Board.SIZE, Board.SIZE).fill('#fff').stroke('none');
        this.#cellsgrid = [];
        this.#parse_commande(commande.trim());
    }

    #parse_commande(commande) {
        /*
        commande: chaine au format (par ex) 8x9S:commande1;commande2;...
        ou encore 9S:com1;com2... pour une grille carrée
        S indique qu'il faut ajouter les cadres pour les secteurs de Sudoku
        Le commandes possibles sont détaillées ensuite
        */
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
            if (this.#tryThickLine(com)) {
                continue;
            }
            if (this.#tryDotCage(com)) {
                continue;
            }
            console.log(com + " ne donne rien")
        }
    }

    #tryThermo(com) {
        /* 
          Thermomomètre. exemple :ThA3A5B5g
          A3A5B5: donne le chemin (voir Coords.strToCoords) et g[optionnel] est la couleur (voir Canvas.color)
        */
        let r = new RegExp("^Th(?<chaine>([A-Za-z][0-9]+)+)(?<color>[a-zA-Z_])?$", "g");
        let m = r.exec(com);
        if (m === null) {
            return false;
        }
        let coords = Coords.strToCoords(m.groups.chaine);
        let color = this.#canvas.color(m.groups.color || '_');
        this.#canvas.disc(coords[0].line, coords[0].col).fill(color).stroke('none');
        this.#canvas.line(coords).fill('none').stroke({width:this.#cellsize/4, color:color});
        return true;
    }

    #tryThickLine(com){
        /* 
          Ligne épaisse. exemple :TlA3A5B5g
          A3A5B5: donne le chemin (voir Coords.strToCoords) et g[optionnel] est la couleur (voir Canvas.color)
        */
        let r = new RegExp("^Tl(?<chaine>([A-Za-z][0-9]+)+)(?<color>[a-zA-Z_])?$", "g");
        let m = r.exec(com);
        if (m === null) {
            return false;
        }
        let coords = Coords.strToCoords(m.groups.chaine);
        let color = this.#canvas.color(m.groups.color || '_');
        this.#canvas.line(coords).fill('none').stroke({width:this.#cellsize/4, color:color});
        return true;
    }

    #tryDotCage(com){
        /* 
          Cage. exemple :Dce5f5f6-p
          DcE5F5F6: donne le chemin (voir Coords.strToCoords) et p[optionnel] est la couleur (voir Canvas.color)
          -: optionnel, pour un trait continu
          tag: étiquette optionnelle, toujours en haut à gauche de la première case
        */
        let r = new RegExp("^Dc(?<chaine>([A-Za-z][0-9]+)+)(?<continu>-)?(?<color>[a-zA-Z_])?(#\{(?<tag>[^;]*)\})?$", "g");
        let m = r.exec(com);
        if (m === null) {
            return false;
        }
        let coords = Coords.strToCoords(m.groups.chaine);
        let color = this.#canvas.color(m.groups.color || '_');
        let polygons = this.#canvas.cadre(coords);
        for (let pol of polygons) {
            pol.fill('none').stroke({width:3, color:color});
            if (m.groups.continu != '-'){
                pol.attr('stroke-dasharray', '10');
            }
        }
        if (m.groups.tag) {
            let text = this.#canvas.text(m.groups.tag, coords[0]);
            text.dmove(-.5,-.5);
            let [subrec, subtext] = text.children();
            subrec.stroke(color);
            subtext.fill(color);
        }
      
        return true;
    }

    #tryDigit(com){
        /*
          Écriture d'un chiffre simple
          ne4E8_g: [ne le point cardinal], 4 le digit, E8 sa position, [_ avec un cadre et fond blanc][g sa couleur]
        */
        let r = new RegExp("^Dc(?<chaine>([A-Za-z][0-9]+)+)(?<continu>-)?(?<color>[a-zA-Z_])?$", "g");
    }

    #drawGrid() {
        for (let line=0; line<this.#height; line++) {
            for (let col=0; col<this.#width; col++) {
                let c = this.#canvas.rect(line, col, 1);
                c.fill('none').stroke(Board.GRIDSTROKE);
                this.#cellsgrid.push(c);
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