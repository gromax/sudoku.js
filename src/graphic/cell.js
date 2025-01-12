import { SVG } from '@svgdotjs/svg.js';
import { Coords } from '../utils/coords';
import { Canvas } from './canvas';
import { ANCRES } from '../constantes';
import { Text } from './text';

/**
 * insère le digit à sa place, dans l'ordre
 * @param {string} chaine
 * @param {string} digit
 * @returns {string}
 */
function addDigitIntoString(chaine, digit) {
    for (let i in chaine) {
        let car = chaine[i];
        if (car == digit) {
            return chaine;
        }
        if (car > digit) {
            return chaine.substring(0,i) + digit + chaine.substring(i);
        }
    }
    return chaine + digit;
}

/**
 * enlève la première apparition de digit dans chaine
 * @param {string} chaine 
 * @param {string} digit 
 * @returns {string}
 */
function removeDigitFromString(chaine, digit) {
    for (let i in chaine) {
        let car = chaine[i];
        if (car == digit) {
            return chaine.substring(0,i) + chaine.substring(i+1);
        }
    }
    return chaine;
}




class GCell {
    static OPACITY = 0.5;
    /** @type {number} */
    #line;
    /** @type {number} */
    #col;
    /** @type {Canvas} */
    #front;
    /** @type {Canvas} */
    #back;
    /** @type {SVG.G} */
    #backGroup;
    /** @type {SVG.G} */
    #frontGroup;
    /** @type {Array<string>} */
    #colors;
    /** @type {Object.<string, Text>} */
    #texts;

    /**
     * constructeur
     * @param {Canvas} back 
     * @param {Canvas} front 
     * @param {number} line 
     * @param {number} col 
     */
    constructor(back, front, line, col) {
        this.#back = back;
        this.#front = front;
        this.#line = line;
        this.#col = col;
        this.#backGroup = back.group();
        this.#frontGroup = front.group();
        this.#colors = [];
        this.#texts = {};
    }

    /**
     * ajoute une couleur à la liste
     * Ne fait rien s'il y a déjà 4 couleurs
     * @param {string} color 
     * @returns {GCell}
     */
    addColor(color) {
        if ((this.#colors.length >= 4) || this.hasColor(color)) {
            return this;
        }
        this.#colors.push({color:color, opacity:GCell.OPACITY});
        this.#refreshColor();
        return this;
    }

    /**
     * ôte la couleur de la liste
     * @param {string} color 
     * @returns {GCell}
     */
    removeColor(color) {
        for (let i in this.#colors) {
            if (this.#colors[i].color == color) {
                this.#colors.splice(i,1);
                this.#refreshColor();
                return this;
            }
        }
        return this;
    }

    /**
     * Enlève toutes les couleurs
     * @returns {GCell}
     */
    clearColors(){
        this.#colors = [];
        this.#refreshColor();
        return this;
    }

    /**
     * renvoie vrai si la couleur est présente
     * @param string*} color 
     * @returns {boolean}
     */
    hasColor(color) {
        for (let i in this.#colors) {
            if (this.#colors[i].color == color) {
                return true;
            }
        }
        return false;
    }

    /**
     * bascule la présence d'une couleur
     * @param {string} color 
     * @returns {GCell}
     */
    toggleColor(color) {
        if (this.hasColor(color)) {
            return this.removeColor(color);
        }
        return this.addColor(color);
    }

    /**
     * ajoute un digit à la position voulue
     * @param {number|string} digit 
     * @param {string} anchor
     * @param {string} color
     * @returns {GCell}
     */
    addDigit(digit, anchor, color){
        if (typeof digit == 'number'){
            digit = digit.toString();
        }
        if (digit.length != 1) {
            throw new Error(`[${digit}] : Un seul digit à la fois !`);
        }
        if (anchor == 'P') {
            this.setPrincipalDigit(digit, color);
            return this;
        }
        if (typeof ANCRES[anchor] == 'undefined') {
            throw new Error(`[${anchor}] : ancre indéfinie !`);
        }
        if (typeof this.#texts.P != 'undefined') {
            // la valeur est choisie, on ne peut pas ajouter de digit
            return this;
        }
        let currentText = '';
        if (typeof this.#texts[anchor] != 'undefined'){
            currentText = this.#texts[anchor].text;
            this.#texts[anchor].removeSVG();
        }
        let newText = addDigitIntoString(currentText, digit);
        this.#texts[anchor] = this.#front.text(newText, this.anchor(anchor), .3).anchor(anchor).stroke(color);
        return this;
    }

    /**
     * enlève un digit à l'ancre indiquée
     * @param {number|string} digit 
     * @param {string} anchor 
     * @returns {GCell}
     */
    removeDigit(digit, anchor) {
        if (typeof digit == 'number'){
            digit = digit.toString();
        }
        if (digit.length != 1) {
            throw new Error(`[${digit}] : Un seul digit à la fois !`);
        }
        if ((anchor!='P')&&(typeof ANCRES[anchor] == 'undefined')) {
            throw new Error(`[${anchor}] : ancre indéfinie !`);
        }
        if (typeof this.#texts[anchor] == 'undefined'){
            // rien à faire
            return this;
        }
        let currentText = this.#texts[anchor].text;
        let color = this.#texts[anchor].strokeColor;
        if (typeof color == 'object') {
            color == color.color;
        }
        this.#texts[anchor].removeSVG();
        let newText = removeDigitFromString(currentText, digit);
        if (newText == "") {
            delete this.#texts[anchor]
        } else {
            this.#texts[anchor] = this.#front.text(newText, this.anchor(anchor), .3).anchor(anchor).stroke(color);
        }
        return this;
    }

    /**
     * 
     * @param {number|string} digit 
     * @param {string} anchor 
     * @returns {bool}
     */
    hasDigit(digit, anchor) {
        if (typeof digit == 'number'){
            digit = digit.toString();
        }
        if (anchor == 'P') {
            if (typeof this.#texts.P == 'undefined'){
                return false;
            }
            return (this.#texts.P.text == digit);
        }
        if (typeof ANCRES[anchor] == 'undefined') {
            throw new Error(`[${anchor}] : ancre indéfinie !`);
        }
        if (typeof this.#texts[anchor] == 'undefined') {
            return false;
        }
        let candidats = this.#texts[anchor].text;
        return (candidats.indexOf(digit) >= 0);
    }

    /**
     * supprime les candidats en un certain cardinal
     * @param {string} anchor 
     * @returns {GCell}
     */
    clearCandidats(anchor) {
        if (typeof this.#texts[anchor] != 'undefined'){
            this.#texts[anchor].removeSVG();
            delete this.#texts[anchor];
        }
        return this;
    }

    /**
     * Supprime tous les candidats
     * @returns {GCell}
     */
    clearAllCandidats() {
        for (let cardinal in ANCRES) {
            this.clearCandidats(cardinal);
        }
        return this;
    }

    /**
     * ajoute un digit à la position voulue
     * @param {number|string} digit 
     * @param {string} color
     * @returns {GCell}
     */
    setPrincipalDigit(digit, color) {
        if (typeof digit == 'number'){
            digit = digit.toString();
        }
        if (digit.length != 1) {
            throw new Error(`[${digit}] : Un seul digit à la fois !`);
        }
        this.clearAllCandidats();
        let lastColor = typeof this.#texts.P != 'undefined' ? this.#texts.P.strokeColor : '#000';
        if (typeof this.#texts.P != 'undefined'){
            this.#texts.P.removeSVG();
        }
        this.#texts.P = this.#front.text(digit, this.anchor('C'), 1).anchor('C').stroke(color||lastColor);
        return this;
    }

    /**
     * Supprime le digit principal
     * @returns {GCell}
     */
    removePrincipalDigit() {
        if (typeof this.#texts.P == 'undefined'){
            return this;
        }
        this.#texts.P.removeSVG();
        delete this.#texts['P'];
        return this;
    }

    /**
     * met à jour l'affichage des couleurs
     */
    #refreshColor() {
        this.#backGroup.clear();
        if (this.#colors.length == 1) {
            this.#backGroup.add(this.#back.square(this.#line,this.#col,1,0).fill(this.#colors[0]).stroke('none'));
        } else if (this.#colors.length == 2) {
            this.#backGroup.add(this.#back.polygon([this.anchor('NW'), this.anchor('SW'), this.anchor('NE')]).fill(this.#colors[0]).stroke('none'));
            this.#backGroup.add(this.#back.polygon([this.anchor('NE'), this.anchor('SW'), this.anchor('SE')]).fill(this.#colors[1]).stroke('none'));
        } else if (this.#colors.length == 3) {
            this.#backGroup.add(this.#back.polygon([this.anchor('NW'), this.anchor('N'), this.anchor('C'), this.anchor('SW')]).fill(this.#colors[0]).stroke('none'));
            this.#backGroup.add(this.#back.polygon([this.anchor('N'), this.anchor('C'), this.anchor('SE'), this.anchor('NE')]).fill(this.#colors[1]).stroke('none'));
            this.#backGroup.add(this.#back.polygon([this.anchor('SW'), this.anchor('SE'), this.anchor('C')]).fill(this.#colors[2]).stroke('none'));
        } else if (this.#colors.length == 4) {
            this.#backGroup.add(this.#back.polygon([this.anchor('C'), this.anchor('NE'), this.anchor('NW')]).fill(this.#colors[0]).stroke('none'));
            this.#backGroup.add(this.#back.polygon([this.anchor('C'), this.anchor('NW'), this.anchor('SW')]).fill(this.#colors[1]).stroke('none'));
            this.#backGroup.add(this.#back.polygon([this.anchor('C'), this.anchor('SW'), this.anchor('SE')]).fill(this.#colors[2]).stroke('none'));
            this.#backGroup.add(this.#back.polygon([this.anchor('C'), this.anchor('SE'), this.anchor('NE')]).fill(this.#colors[3]).stroke('none'));
        }
    }

    /**
     * renvoie la coordonnées selon le cardinal
     * @param {string} cardinal
     * @returns {Coords}
     */
    anchor(cardinal) {
        if (typeof(ANCRES[cardinal]) == 'undefined') {
            throw new Error(`Cardinal ${cardinal} invalide.`);
        }
        let dx = ANCRES[cardinal].x;
        let dy = ANCRES[cardinal].y;
        return new Coords(this.#col+dx, this.#line+dy);
    }
}

export { GCell };

