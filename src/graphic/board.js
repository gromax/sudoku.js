/* Gère la création des la grille */
import _ from 'lodash';
import { SVG } from '@svgdotjs/svg.js';
import { Canvas } from './canvas';
import { Coords } from '../utils/coords';
import { Events } from '../utils/events';
import { CELLSIZE } from '../constantes';

const SUDOKU_STEP = {
    9: { xstep: 3, ystep:3 },
    6: { xstep: 3, ystep:2 },
    4: { xstep: 2, ystep:2 },
    16: { xstep:4, ystep:4 }
}


/**
 * @typedef {Object.<string,Canvas>} Layers
 */

class Board {
    static SIZE = 800;
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

    /** @type {Layers} */
    #layers;

    /**
     * constructure
     * @param {string} id identifiant dom du conteneur
     * @param {string} format chaîne indiquant le format de la grille
     * @param {string} commandes ensemble de commandes des éléments à tracer
     * @param {Events} eventsGest gestionnaire d'événements
     */
    constructor(id, format, commandes, eventsGest) {
        this.#layers = {};
        this.#content = SVG().addTo(id).size(Board.SIZE, Board.SIZE);
        this.#cellsize = CELLSIZE;
        this.#content.rect(Board.SIZE, Board.SIZE).fill('#fff').stroke('none');
        this.#makeGrid(format.trim());
        this.#parse(commandes.trim());
        this.#content.click(function(e){eventsGest.triggerEvent("gridClick", e, null);});
    }

    /**
     * renvoie un calque
     * @returns {Canvas}
     */
    layer(name) {
        if (typeof this.#layers[name] == "undefined") {
            throw new Error(`Le calque ${name} n'existe pas !`);
        }
        return this.#layers[name];
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
        
        this.#layers.subgrid = this.#canvas.sublayer();
        this.#layers.backCell = this.#canvas.sublayer();
        this.#drawGrid(g.type);
        this.#layers.decorations = this.#canvas.sublayer();
        this.#layers.frontCell = this.#canvas.sublayer();
        this.#layers.selection = this.#canvas.sublayer();
    }

    /**
     * exécute les commandes de dessin
     * @param {string} commandes chaine de forme com1;com2;...
     */
    #parse(commandes) {
        let coms = commandes.split(';');
        for (let com of coms) {
            if (this.#tryThermo(com)) {
                continue;
            }
            if (this.#tryLine(com)) {
                continue;
            }
            if (this.#tryDisc(com)) {
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
        this.#layers.decorations.disc(coords[0].line, coords[0].col).fill(color).stroke('none');
        this.#layers.decorations.line(coords).fill('none').stroke({width:this.#cellsize/4, color:color});
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
        this.#layers.decorations.line(coords).fill('none').stroke({width:w, color:color});
        return true;
    }

    /**
     * Essaie d'éxécuter la commamande en tant que tracer un disque
     * Exemple de commande : DiBC:gb45
     * Di: identifie la commande
     * BC: position
     * [:gb]:couleur, première stroke Color, second fill color
     * [45]: diamètre en % de l'unité
     * @param {string} com 
     * @returns {boolean}
     */
    #tryDisc(com){
        let r = new RegExp(`^[D|d]i(?<chaine>(${Coords.REGEX}){1})(:(?<color>[a-zA-Z_]{1,2}))?(?<size>[0-9]{1,2})?$`, "g");
        let m = r.exec(com);
        if (m === null) {
            return false;
        }
        let coords = Coords.strToCoords(m.groups.chaine);
        let stringColor = m.groups.color || '_';
        let strokeColor = Canvas.color(stringColor[0]);
        let fillColor = (stringColor.length == 2)? Canvas.color(stringColor[1]) : 'none';
        let stringSize = m.groups.size || '100';
        let size = parseInt(stringSize)/100;
        console.log(size, coords, fillColor, strokeColor);
        const w = (com[0]=='D') ? 6 : 3;
        this.#layers.decorations.disc(coords[0].line, coords[0].col, size).fill(fillColor).stroke({width:w, color:strokeColor});
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
        let polygons = this.#layers.decorations.cadre(coords, margin);
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
            let backPolygons = this.layer("subgrid").cadre(coords, margin);
            for (let pol of backPolygons) {
                pol.fill(backColor).stroke('none');
            }
        }

        if (m.groups.tag) {
            let text = this.layer("decorations").text(m.groups.tag, coords[0], 0.3);
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
        let r = new RegExp(`^(?<digit>[0-9])(?<pos>${Coords.REGEX})(:(?<color>[a-zA-Z_]))?(?:s(?<size>[0-9]{1,2}))?$`, "g");
        let m = r.exec(com);
        if (m === null) {
            return false;
        }
        let color = Canvas.color(m.groups.color || '_');
        let coord = Coords.paireToCoord(m.groups.pos);
        let size = Number(m.groups.size || '80') / 100
        let text = this.layer("decorations").text(m.groups.digit, coord, size);
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
        let r = new RegExp(`^Tag(\{(?<tag>[^;]*)\})(?<pos>${Coords.REGEX})(:(?<color>[a-zA-Z_]{1,2}))?(\.(?<anchor>(N|NE|E|SE|S|SW|W|NW|C)))?(?<size>s[0-9]{1,2})?(r(?<angle>(R|L|D|[0-9]+)))?$`, "g");
        let m = r.exec(com);
        if (m === null) {
            return false;
        }
        let stringColor = m.groups.color || '_';
        let color = Canvas.color(stringColor[0]);
        let backColor = (stringColor.length == 2)? Canvas.color(stringColor[1]) : 'none';
        let anchor = m.groups.anchor || 'C';
        let stringSize = m.groups.size || 's100';
        let size = parseInt(stringSize.substring(1))/100;
        let coord = Coords.paireToCoord(m.groups.pos);
        let angle = m.groups.angle || '0';
        let text = this.layer("decorations").text(m.groups.tag, coord, size);
        text.stroke(color).fill(backColor);
        text.anchor(anchor);
        switch(angle) {
            case 'R': text.turnClockWise(); break;
            case 'L': text.turnCounterClockWise(); break;
            case 'D': text.turnClockWise().turnClockWise(); break;
            default: text.turnClockWise(parseInt(angle));
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
        let backPolygons = this.layer("subgrid").cadre(coords,margin);
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
            this.#canvas.grid(this.#height, this.#width, Board.GRIDSTROKE, 1, 1);
        }
        if (type == 'S') {
            if (this.#height != this.#width) {
                console.log("[S] : Une grille de sudoku recquiert une grille carrée.")
            }
            const steps = SUDOKU_STEP[this.#height]
            if (typeof steps === "undefined") {
                console.log(`[S] : Je ne sais pas traiter les secteurs sudoku pour la taille ${this.#height}.`)
            }
            const xstep = steps.xstep
            const ystep = steps.ystep
            this.#canvas.grid(this.#height, this.#width, Board.GRIDTHICKSTROKE, xstep, ystep)
        }
    }
    
    /**
     * accesseur width
     * @returns {number}
     */
    get width() {
        return this.#width;
    }

    /**
     * accesseur height
     * @returns {number}
     */
    get height() {
        return this.#height;
    }
}

export { Board };