import { letterToInt, intToLetter } from './misc';
import { COLORS } from "../constantes"

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
    /** @type {Array<string>} */
    #liste;

    /**
     * constructeur
     * @param {number} width
     * @param {number} height
     */
    constructor(width, height){
        this.#liste = [];
        this.#width = width;
        this.#height = height;
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
     * ajoute un changement de couleur à l'historique
     * @param {string} color 
     * @param {number[]} indexes 
     */
    pushCol(color, indexes) {
        let code = this.#indexesToCode(indexes);
        let icol = COLORS.indexOf[color];
        if (icol == -1) {
            throw new Error(`couleur ${color} invalide.`);
        }
        this.#liste.push(SYMBOLS.color + icol + code);
    }

    /**
     * Ajoute un effacement de couleur à l'historique
     * @param {number[]} indexes 
     */
    pushClearCol(indexes) {
        let code = this.#indexesToCode(indexes);
        this.#liste.push(SYMBOLS.color + SYMBOLS.clear + code);
    }

    /**
     * ajoute un changement de bord à l'historique
     * @param {number[]} indexes 
     * @param {string} color 
     * @param {number|string} direction 
     */
    pushBorder(indexes, color, direction) {
        let code = this.#indexesToCode(indexes);
        let icol = COLORS.indexOf[color];
        if (icol == -1) {
            throw new Error(`couleur ${color} invalide.`);
        }
        this.#liste.push(SYMBOLS.border + direction + icol + code);
    }

    /**
     * ajoute un changement de digit à l'historique
     * @param {number[]} indexes 
     * @param {number|string} digit 
     * @param {string} anchor 
     * @param {string} color 
     */
    pushDigit(indexes, digit, anchor, color) {
        let code = this.#indexesToCode(indexes);
        let icol = COLORS.indexOf[color];
        if (icol == -1) {
            throw new Error(`couleur ${color} invalide.`);
        }
        this.#liste.push(''+ digit + anchor + color + code);
    }

    /**
     * ajoute une suppression de digit à l'historique
     * @param {number[]} indexes 
     * @param {string} anchor 
     */
    pushClearDigit(indexes, anchor) {
        let code = this.#indexesToCode(indexes);
        this.#liste.push(''+ digit + anchor + SYMBOLS.clear + code);
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



}

export { History }