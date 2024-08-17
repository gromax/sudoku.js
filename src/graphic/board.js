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
            if (this.#tryLine(com)) {
                continue;
            }
            if (this.#tryDotCage(com)) {
                continue;
            }
            if (this.#tryDigit(com)) {
                continue;
            }
            if (this.#tryTag(com)) {
                continue;
            }
            console.log(com + " ne donne rien");
        }
    }

    #tryThermo(com) {
        /* 
          Thermomomètre. exemple :ThBCDEBa:g
            Th signe la commande
            BCDEBa est le chemin
            :g, optionnel, précise une couleur
        */
        let r = new RegExp(`^Th(?<chaine>(${Coords.REGEX})+)(:(?<color>[a-zA-Z_]))?$`, "g");
        let m = r.exec(com);
        if (m === null) {
            return false;
        }
        let coords = Coords.strToCoords(m.groups.chaine);
        let color = Canvas.color(m.groups.color || '_');
        this.#canvas.disc(coords[0].line, coords[0].col).fill(color).stroke('none');
        this.#canvas.line(coords).fill('none').stroke({width:this.#cellsize/4, color:color});
        return true;
    }

    #tryLine(com){
        /* 
          Ligne. exemple :LiBCDEBa:g
            Li signe la commande ou li pour un trait plus fin
            BCDEBa est le chemin
            :g, optionnel, précise la couleur
        */
        let r = new RegExp(`^[Ll]i(?<chaine>(${Coords.REGEX})+)(:(?<color>[a-zA-Z_]))?$`, "g");
        let m = r.exec(com);
        if (m === null) {
            return false;
        }
        let w = (com[0]=='L') ? this.#cellsize/4 : this.#cellsize/8;
        let coords = Coords.strToCoords(m.groups.chaine);
        let color = Canvas.color(m.groups.color || '_');
        this.#canvas.line(coords).fill('none').stroke({width:w, color:color});
        return true;
    }

    #tryDotCage(com){
        /* 
          Cage. exemple :Dceefeff:g-{tag}
            Dc: signe la commande
            eefeff: cases concernées, tout en minuscules
            :g, optionnel, donne la couleur
            {tag}, optionnel, donne l'étiquette
        */
        let r = new RegExp(`^Dc(?<chaine>(${Coords.REGEX})+)(:(?<color>[a-zA-Z_]))?(?<continu>-)?(\{(?<tag>[^;]*)\})?$`, "g");
        let m = r.exec(com);
        if (m === null) {
            return false;
        }
        let coords = Coords.strToCoords(m.groups.chaine.toLowerCase());
        let color = Canvas.color(m.groups.color || '_');
        let polygons = this.#canvas.cadre(coords);
        for (let pol of polygons) {
            pol.fill('none').stroke({width:3, color:color});
            if (m.groups.continu != '-'){
                pol.attr('stroke-dasharray', '10');
            }
        }
        if (m.groups.tag) {
            let text = this.#canvas.text(m.groups.tag, coords[0], 0.3);
            text.stroke(color).fill('#fff');
        }
        return true;
    }

    #tryDigit(com){
        /*
          Écriture d'un chiffre simple
          4EG:g: 4 le digit, E8 sa position, [:g sa couleur]
        */
        let r = new RegExp(`^(?<digit>[0-9])(?<pos>${Coords.REGEX})(:(?<color>[a-zA-Z_]))?$`, "g");
        let m = r.exec(com);
        if (m === null) {
            return false;
        }
        let color = Canvas.color(m.groups.color || '_');
        let coord = Coords.paireToCoord(m.groups.pos);
        let text = this.#canvas.text(m.groups.digit, coord, 0.8);
        text.anchor('C');
        text.stroke(color);
        text.fill('none');
        return true;
    }

    #tryTag(com){
        /*
        Écriture d'un texte, Tag{tag}Ee:gb.NEh45r90
          Tag: signature de la commande
          {tag}: texte affiché
          Ee: position
          :gb, optionnels, couleurs du texte (et bordure le cas échéant) et du fond
            (si pas de fond, transparent)
          .NE, ancre, optionnel parmi N, NE, E, SE, S, SW, W, NW, C
          h45: optionnel, hauteur (ou largeur) en pourcents (h ou w)
          rR: optionel, rotation Right (R, L, D pour demi tour)
        */
        let r = new RegExp(`^Tag(\{(?<tag>[^;]*)\})(?<pos>${Coords.REGEX})(:(?<color>[a-zA-Z_]{1,2}))?(\.(?<anchor>(N|NE|E|SE|S|SW|W|NW|C)))?(?<size>s[0-9]{1,2})?(r(?<angle>(R|L|D)))?$`, "g");
        let m = r.exec(com);
        if (m === null) {
            return false;
        }
        let stringColor = m.groups.color || '_';
        let color = Canvas.color(stringColor[0]);
        let backColor = (stringColor.length == 2)? Canvas.color(stringColor[1]) : 'none';
        let anchor = m.groups.anchor || 'C';
        let stringSize = m.groups.size || 'h99';
        let size = parseInt(stringSize.substring(1))/100;
        let coord = Coords.paireToCoord(m.groups.pos);
        let angle = m.groups.angle || '0';
        let text = this.#canvas.text(m.groups.tag, coord, size);
        text.stroke(color).fill(backColor);
        text.anchor(anchor);
        switch(angle) {
            case 'R': text.turnClockWise(); break;
            case 'L': text.turnCounterClockWise(); break;
            case 'D': text.turnClockWise().turnClockWise(); break;
        }
        return true;

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