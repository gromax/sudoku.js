import { letterToInt, intToLetter } from './misc';
import { COLORS } from "../constantes"
import { Events } from './events';

const SYMBOLS = {
    "color": "_",
    "clear": "!",
    "borderall": 'A',
    "border": '|'
}

class History {
    /** @type {number} */
    #width;
    /** @type {number} */
    #height;
    /** @type {Array<Object>} */
    #liste;
    /** @type {number} */
    #cursor;
    /** @type {Events} */
    #eventsGest;

    /**
     * constructeur
     * @param {number} width
     * @param {number} height
     */
    constructor(width, height, eventsGest){
        this.#liste = [];
        this.#width = width;
        this.#height = height;
        this.#cursor = 0;
        this.#eventsGest = eventsGest;

        let self = this;
        eventsGest.addEvent("backClick", function(e,data){
            self.back(e);
        });
        eventsGest.addEvent("forwardClick", function(e,data){
            self.forward(e);
        });
    }

    
    /**
     * renvoie [line,col] correspondant à un index
     * @param {number} index
     * @returns {[number,number]}
     */
    #lineCol(index) {
        if ((index <0) || (index >= this.#height*this.#width)) {
            throw new Error(`indice:${index} invalide !`);
        }
        let line = Math.floor(index/this.#width);
        let col = index - this.#width*line;
        return [line, col];
    }

    /**
     * supprime l'historique à partir du rang #cursor
     */
    #purge() {
        this.#liste = this.#liste.slice(0, this.#cursor);
    }

    /**
     * ajoute un changement de couleur à l'historique
     * @param {number[]} indexes 
     * @param {string} color 
     */
    pushCol(indexes, color) {
        this.#purge();
        this.#liste.push({type:"color", indexes:indexes, color:color});
        this.#cursor++;
        /*
        let code = this.#indexesToCode(indexes);
        if (color == "") {
            this.#liste.push(SYMBOLS.color + SYMBOLS.clear + code);
        } else {
            let icol = COLORS.indexOf[color];
            if (icol == -1) {
                throw new Error(`couleur ${color} invalide.`);
            }
            this.#liste.push(SYMBOLS.color + icol + code);
        }
        */
    }

    /**
     * ajoute un changement de bord à l'historique
     * @param {number[]} indexes 
     * @param {string} color 
     * @param {number|string} direction 
     */
    pushBorder(indexes, color, direction) {
        this.#purge();
        this.#liste.push({type:"border", indexes:indexes, color:color, direction:direction});
        this.#cursor++;
        /*
        let code = this.#indexesToCode(indexes);
        let icol = COLORS.indexOf[color];
        if (icol == -1) {
            throw new Error(`couleur ${color} invalide.`);
        }
        this.#liste.push(SYMBOLS.border + direction + icol + code);
        */
    }

    /**
     * ajoute un changement de digit à l'historique
     * @param {number[]} indexes 
     * @param {number|string} digit 
     * @param {string} anchor 
     * @param {string} color 
     */
    pushDigit(indexes, digit, anchor, color) {
        this.#purge();
        this.#liste.push({type:"digit", indexes:indexes, digit:digit, anchor:anchor, color:color});
        this.#cursor++;
        /*
        let code = this.#indexesToCode(indexes);
        if (digit == "") {
            this.#liste.push(anchor + SYMBOLS.clear + code);
        } else {
            let icol = COLORS.indexOf[color];
            if (icol == -1) {
                throw new Error(`couleur ${color} invalide.`);
            }
            this.#liste.push(''+ digit + anchor + color + code);
        }
        */
    }

    /**
     * fait avancer d'un pas dans l'historique
     * déclence un événement avec l'action suivante
     * @param {Event}
     */
    forward(e) {
        if (this.#cursor>=this.#liste.length){
            return;
        }
        let action = this.#liste[this.#cursor];
        this.#cursor++;
        this.#eventsGest.triggerEvent("forward", e, {action:action});
    }

    /**
     * fait reculer d'un pas dans l'historique
     * déclenche un événement contenant la liste des actions permettant de reconstruire l'état précédent
     * @param {Event}
     */
    back(e) {
        if (this.#cursor==0) {
            return;
        }
        this.#cursor--;
        this.#eventsGest.triggerEvent("back", e, {actions:this.#liste.slice(0, this.#cursor)});
    }

    /**
     * renvoie un code pour chaque cellule sélectionnée
     * @param {Array<number>}
     * @returns {string}
     */
    #indexesToCode(indexes) {
        let result = '';
        for (let i of indexes) {
            let [line, col] = this.#lineCol(i);
            result += intToLetter(line) + intToLetter(col);
        }
        return result;
    }

    /**
     * convertit un mot d'une base à une autre
     * @param {number} baseSource 
     * @param {number} baseCible 
     * @param {number[]} digits 
     * @returns {number[]}
     */
    #codage(baseSource, baseCible, digits){
        let out = [];
        while (_.sum(digits) > 0) {
            let [r, q] = this.#euclidian(baseSource, baseCible, digits);
            out.push(r);
            digits = q;
        }
        return out;
    }

    /**
     * fait la division euclidienne de digits/baseCible
     * @param {number} baseSource 
     * @param {number} baseCible 
     * @param {number[]} digits nombre exprimé en baseSource, poids faible = digits[0]
     * @returns {[number, number[]]} [reste, quotient]
     */
    #euclidian(baseSource, baseCible, digits) {
        let out = [];
        let r = 0;
        for (let i=digits.length - 1; i>=0; i--) {
            let d = digits[i] + r*baseSource;
            let q = Math.floor(d/baseCible);
            r = d % baseCible;
            out.push(q);
        }
        return [r, out.reverse()];
    }




}

export { History }