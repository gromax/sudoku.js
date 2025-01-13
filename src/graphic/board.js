/* Gère la création des la grille */
import _ from 'lodash';
import { DIRECTION } from '../constantes';
import { SVG } from '@svgdotjs/svg.js';

import { Canvas } from './canvas';
import { Coords } from '../utils/coords';
import { Selection } from './selection';
import { GCell } from './cell';
import { Borders } from './borders';

class Board {
    static SIZE = 1100;
    static DEFAULTCELLSIZE = 100;
    static GRIDSTROKE = { width:2, color:'#000' };
    static GRIDTHICKSTROKE = { width:5, color:'#000' };
    /** @type {number} */
    #height;    // nombre de cellules en hauteur
    /** @type {number} */
    #width;     // nombre de cellules en largeur
    #content;   // groupe svg pour le contenu
    /** @type {number} */
    #cellsize;  // taille d'une cellule carrée, en unités svg
    /** @type {Canvas} */
    #canvas;    // conteneur pour tous les dessins
    /** @type {Canvas} */
    #decorations;    // conteneur pour les dessins faits sur la grille
    /** @type {Canvas} */
    #subgridLayer; // canvas en dessous de la grille
    /** @type {Selection} */
    #selection // canvas pour dessiner la sélection
    /** @type {Canvas} */
    #backCellLayer // canvas pour dessiner la partie arrière des cellules
    /** @type {Canvas} */
    #frontCellLayer // canvas pour dessiner la partie avant sélection
    /** @type {Array<GCell} */
    #cells;
    /** @type {Borders} */
    #borders;

    /**
     * constructure
     * @param {string} id identifiant dom du conteneur
     * @param {string} format chaîne indiquant le format de la grille
     * @param {string} commande ensemble de commandes des éléments à tracer
     */
    constructor(id, format, commande) {
        this.#content = SVG().addTo(id).size(Board.SIZE, Board.SIZE);
        this.#cellsize = Board.DEFAULTCELLSIZE;
        this.#content.rect(Board.SIZE, Board.SIZE).fill('#fff').stroke('none');
        this.#makeGrid(format.trim());
        this.parse(commande.trim());
        let self = this;
        this.#content.click(function(e){self.click(e);});
    }

    /**
     * gestion événement de click
     * @param {Event} e 
     */
    click(e) {
        let altPressed = e.altKey;
        let ctrlPressed = e.ctrlKey;
        let shiftPressed = e.shiftKey;
        let x = e.offsetX;
        let y = e.offsetY;
        this.#selection.select(x, y, shiftPressed);
    }

    /**
     * construit et dessine la grille de base
     * @param {string} format 8x9S ou encore 9S. S indique une grille de Sudoku
     */
    #makeGrid(format) {
        let r = new RegExp("^(?<height>[1-9][0-9]*)(x(?<width>[1-9][0-9]*))?(?<type>S)?$", "g");
        let matchs = r.exec(format);
        if (matchs === null){
            throw new Error(`Format ${format} invalide`);
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
        
        this.#subgridLayer = this.#canvas.sublayer();
        this.#backCellLayer = this.#canvas.sublayer();
        this.#drawGrid(g.type);
        this.#decorations = this.#canvas.sublayer();
        this.#frontCellLayer = this.#canvas.sublayer();
        this.#selection = new Selection(this.#canvas.sublayer(), this.#width, this.#height);
        
        this.#cells = [];
        for (let line=0; line < this.#height; line++){
            for (let col=0; col < this.#width; col++){
                let c = new GCell(this.#backCellLayer, this.#frontCellLayer, line, col);
                this.#cells.push(c);
            }
        }

        this.#borders = new Borders(this.#frontCellLayer, this.#width, this.#height);
    }

    /**
     * exécute les commandes de dessin
     * @param {string} commandes chaine de forme com1;com2;...
     */
    parse(commandes) {
        let coms = commandes.split(';');
        for (let com of coms) {
            if (this.#tryThermo(com)) {
                continue;
            }
            if (this.#tryLine(com)) {
                continue;
            }
            if (this.#tryCage(com)) {
                continue;
            }
            if (this.#tryDigit(com)) {
                continue;
            }
            if (this.#tryTag(com)) {
                continue;
            }
            if (this.#tryColorCell(com)) {
                continue;
            }
            console.log(`commande ${com} n'est pas reconnue.`);
        }
    }

    /**
     * Thermomomètre. exemple :ThBCDEBa:g
     *      Th signe la commande
     *      BCDEBa est le chemin
     *      :g, optionnel, précise une couleur
     * renvoi true en cas de succès
     * @param {string} com 
     * @returns {boolean}
     */
    #tryThermo(com) {
        let r = new RegExp(`^Th(?<chaine>(${Coords.REGEX})+)(:(?<color>[a-zA-Z_]))?$`, "g");
        let m = r.exec(com);
        if (m === null) {
            return false;
        }
        let coords = Coords.strToCoords(m.groups.chaine);
        let color = Canvas.color(m.groups.color || '_');
        this.#decorations.disc(coords[0].line, coords[0].col).fill(color).stroke('none');
        this.#decorations.line(coords).fill('none').stroke({width:this.#cellsize/4, color:color});
        return true;
    }

    /**
     * Essaie d'exécuter la commande en tant que tracer de ligne brisée
     * Exemple de commande valide : LiBCDEBa:g
     * Li: identifie la commande ; li pour un trait plus fin
     * BCDEBa: chemin
     * [:g] : couleur
     * @param {string} com 
     * @returns {boolean}
     */
    #tryLine(com){
        let r = new RegExp(`^[Ll]i(?<chaine>(${Coords.REGEX})+)(:(?<color>[a-zA-Z_]))?$`, "g");
        let m = r.exec(com);
        if (m === null) {
            return false;
        }
        let w = (com[0]=='L') ? this.#cellsize/4 : this.#cellsize/8;
        let coords = Coords.strToCoords(m.groups.chaine);
        let color = Canvas.color(m.groups.color || '_');
        this.#decorations.line(coords).fill('none').stroke({width:w, color:color});
        return true;
    }

    /**
     * Essaie d'exécuter la commande en tant que tracer de cage,
     * c'est à dire une ligne pointillée à l'intérieur du cadre d'un ensemble de cellules
     * Exemple de commande valide : Cageefeff:g:0-{tag}
     * Cag: identifie la commande
     * eefeff: cases concernées, tout en minuscules
     * [:g]: couleur
     * [:0]: marge, en %
     * [-]: trait continu, = pour gros trait
     * [{tag}]: étiquette
     * @param {string} com 
     * @returns {boolean}
     */
    #tryCage(com){
        let r = new RegExp(`^Cag(?<chaine>(${Coords.REGEX})+)(:(?<color>[a-zA-Z_]{1,2}))?(:(?<margin>[0-9]{1,2}))?(?<continu>(-|=))?(\{(?<tag>[^;]*)\})?$`, "g");
        let m = r.exec(com);
        if (m === null) {
            return false;
        }
        let coords = Coords.strToCoords(m.groups.chaine.toLowerCase());
        let stringColor = m.groups.color || '_';
        let color = Canvas.color(stringColor[0]);
        let backColor = (stringColor.length==2)?Canvas.color(stringColor[1]):'none';
        let margin = parseInt(m.groups.margin || '10')/100;
        let polygons = this.#decorations.cadre(coords, margin);
        let strokeWidth = Board.GRIDSTROKE.width;
        if (m.groups.continu == '=') {
            strokeWidth = Board.GRIDTHICKSTROKE.width;
        }
        
        for (let pol of polygons) {
            pol.fill('none').stroke({width:strokeWidth, color:color});
            if (typeof(m.groups.continu) == 'undefined'){
                pol.attr('stroke-dasharray', '10');
            }
        }
        if (backColor != 'none') {
            let backPolygons = this.#subgridLayer.cadre(coords, margin);
            for (let pol of backPolygons) {
                pol.fill(backColor).stroke('none');
            }
        }

        if (m.groups.tag) {
            let text = this.#decorations.text(m.groups.tag, coords[0], 0.3);
            text.stroke(color).fill('#fff');
        }
        return true;
    }

    /**
     * Essaie d'exécuter la commande en tant qu'écriture d'un digit au centre d'une cellule
     * Exemple de commande valide: 4EG:g
     * 4: le chiffre à afficher
     * EG: position
     * [:g]: couleur
     * @param {string} com 
     * @returns {boolean}
     */
    #tryDigit(com){
        /*
          Écriture d'un chiffre simple
          
        */
        let r = new RegExp(`^(?<digit>[0-9])(?<pos>${Coords.REGEX})(:(?<color>[a-zA-Z_]))?$`, "g");
        let m = r.exec(com);
        if (m === null) {
            return false;
        }
        let color = Canvas.color(m.groups.color || '_');
        let coord = Coords.paireToCoord(m.groups.pos);
        let text = this.#decorations.text(m.groups.digit, coord, 0.8);
        text.anchor('C');
        text.stroke(color);
        text.fill('none');
        return true;
    }

    /**
     * Écriture d'un texte, Tag{tag}Ee:gb.NEh45r90
     *    Tag: signature de la commande
     *    {tag}: texte affiché
     *    Ee: position
     *    [:gb], optionnels, couleurs du texte (et bordure le cas échéant) et du fond
     *      (si pas de fond, transparent)
     *    [.NE], ancre, optionnel parmi N, NE, E, SE, S, SW, W, NW, C
     *    [s45]: taille en pourcents
     *    [rR]: rotation Right (R, L, D pour demi tour)
     * @param {string} com 
     * @returns {boolean}
     */
    #tryTag(com){
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
        let text = this.#decorations.text(m.groups.tag, coord, size);
        text.stroke(color).fill(backColor);
        text.anchor(anchor);
        switch(angle) {
            case 'R': text.turnClockWise(); break;
            case 'L': text.turnCounterClockWise(); break;
            case 'D': text.turnClockWise().turnClockWise(); break;
        }
        return true;
    }

    /**
     * Coloration de cellules, ColE3E4F4:g:0.95
     *    Col: signature de la commande
     *    E3E4F4: adresse cellules
     *    [:g] couleur
     *    [:0] marge, en %
     *    [.95] opacité
     * @param {string} com 
     * @returns {boolean}
     */
    #tryColorCell(com){
        let r = new RegExp(`^Col(?<chaine>(${Coords.REGEX})+)(:(?<color>[a-zA-Z_]))?(:(?<margin>[0-9]{1,2}))?(\.(?<opacity>[0-9]{1,2}))?$`, "g");
        let m = r.exec(com);
        if (m === null) {
            return false;
        }
        let color = Canvas.color(m.groups.color || '_');
        let margin = parseInt(m.groups.margin || '0')/100;
        let opacity = parseInt(m.groups.opacity || '100')/100;
        let coords = Coords.strToCoords(m.groups.chaine.toLowerCase());
        let backPolygons = this.#subgridLayer.cadre(coords,margin);
        for (let pol of backPolygons) {
            pol.fill({color:color, opactiy:opacity}).stroke('none');
        }
        return true;
    }

    /**
     * Dessine la grille
     * @param {string} type 'S' ou 'G'
     */
    #drawGrid(type) {
        if ((type == 'G') || (type=='S')){
            this.#canvas.grid(this.#height, this.#width, Board.GRIDSTROKE, 1);
        }
        if (type == 'S') {
            this.#canvas.grid(this.#height, this.#width, Board.GRIDTHICKSTROKE, 3);
        }
    }
    
    /**
     * change l'état de la couleur donnée pour les cellules de la sélection
     * @param {string} color
     */
    toggleSelColor(color) {
        let indexes = this.#selection.get_selecteds_index();
        if (indexes.length == 0) {
            return;
        }
        if (indexes.length == 1) {
            this.#cells[indexes[0]].toggleColor(color);
            return;
        }
        let all_have = true;
        for (let i of indexes) {
            if (!this.#cells[i].hasColor(color)) {
                all_have = false;
                break;
            }
        }
        for (let i of indexes) {
            if (all_have) {
                this.#cells[i].removeColor(color);
            } else {
                this.#cells[i].addColor(color);
            }
        }
    }

    /**
     * supprime les couleurs de la sélection
     */
    clearColors() {
        let indexes = this.#selection.get_selecteds_index();
        for (let i of indexes) {
            this.#cells[i].clearColors();
        }
    }

    /**
     * change l'état de des segments dans la direction indiquée sur la sélection
     * @param {string} color
     * @param {number} direction
     */
    toggleBorderColor(color, direction) {
        let index = this.#selection.getBorder(direction);
        if (index.length == 0) {
            return;
        }
        if (index.length == 1) {
            let [line, col] = this.#selection.lineCol(index[0]);
            this.#borders.border(direction, line, col).toggleColor(color);
            return;
        }
        let segs = [];
        for (let i of index) {
            let [line, col] = this.#selection.lineCol(i);
            let s = this.#borders.border(direction, line, col);
            segs.push(s);
        }
        let all_have = _.every(segs, function(s){ return s.color == color});
        for (let s of segs) {
            if (all_have) {
                s.hide();
            } else {
                s.setColor(color);
            }
        }
    }

    /**
     * change l'état des bords extérieurs de la sélection
     * @param {string} color 
     */
    toggleOuterBorderColor(color) {
        let segs = _.union(
            this.#borders.borderByIndex(DIRECTION.UP, this.#selection.getBorder(DIRECTION.UP)),
            this.#borders.borderByIndex(DIRECTION.DOWN, this.#selection.getBorder(DIRECTION.DOWN)),
            this.#borders.borderByIndex(DIRECTION.LEFT, this.#selection.getBorder(DIRECTION.LEFT)),
            this.#borders.borderByIndex(DIRECTION.RIGHT, this.#selection.getBorder(DIRECTION.RIGHT))
        );
        if (_.every(segs, function(s){ return s.color == color})) {
            for (let s of segs) {
                s.hide();
            }
        } else {
            for (let s of segs) {
                s.setColor(color);
            }
        }
    }

    /**
     * active le verrou sur la sélection
     */
    setSelectionVerrou() {
        this.#selection.setVerrou();
    }

    /**
     * désactive le verrou sur la sélection
     */
    resetSelectionVerrou() {
        this.#selection.resetVerrou();
    }

    /**
     * ajoute ou supprime un digit
     * @param {number|string} digit
     * @param {string} anchor
     * @param {string} color
     */
    toggleDigit(digit, anchor, color) {
        let indexes = this.#selection.get_selecteds_index();
        if (indexes.length == 0) {
            return;
        }
        let cells = this.#cells;
        if (_.every(indexes, function(i){ return cells[i].hasDigit(digit, anchor); })) {
            for (let i of indexes) {
                this.#cells[i].removeDigit(digit, anchor);
            }
        } else {
            for (let i of indexes) {
                this.#cells[i].addDigit(digit, anchor, color);
            }
        }
    }

    /**
     * supprime les candidats
     * @param {string} anchor 
     */
    clearDigits(anchor) {
        let indexes = this.#selection.get_selecteds_index();
        if (indexes.length == 0) {
            return;
        }
        let cells = this.#cells;
        if (_.every(indexes, function(i){ return !cells[i].hasAnchor(anchor); })) {
            for (let i of indexes) {
                this.#cells[i].clearAllCandidats();
            }
        } else {
            for (let i of indexes) {
                this.#cells[i].clearCandidats(anchor);
            }
        }
    }


}

export { Board };