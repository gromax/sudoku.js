/* Objet contenant une paire de coordonnées */

import _ from 'lodash';

class Coords {
    /** @type {Number} */
    #x;
    /** @type {Number} */
    #y;

    static REGEX = "[A-Za-z][A-Za-z0-9]"

    /**
     * renvoie le tableau de coordonnées correspondant à une chaîne
     * @param {string} chaine suite de forme "ABbDCa"
     * @returns {Array<Coords>}
     */
    static strToCoords(chaine) {
        let n = chaine.length;
        if (n%2 != 0) {
            throw new Error(`chaine = ${chaine} n'est pas valide`);
        }
        let output = [];
        for (let i=0; i<n; i+=2) {
            output.push(Coords.paireToCoord(chaine.substring(i,i+2)));
        }
        return output;
    }

    /**
     * la paire est une chaîne de deux caractères représentant line,col
     * leur valeur est ainsi définies :
     * a = -1 ; A = -0.5
     * b = 0 ; B = 0.5
     * etc.
     * la 2e lettre peut aussi être un digit 0-9
     * renvoie la coordonnée correspondante
     * @param {string} paire chaine de deux lettres
     * @returns {Coords}
     */
    static paireToCoord(paire) {
        if (paire.length != 2) {
            throw new Error(`paire = ${paire} n'est pas valide`);
        }
        let [y, x] = _.map(paire, Coords.letterToValue);
        return new Coords(x, y);
    }

    /**
     * renvoie la valeur associée à une lettre
     * a = -1 ; A = -0.5
     * ou digit 0-9
     * @param {string} letter un caractère
     * @returns {Number}
     */
    static letterToValue(letter) {
        if (letter.length != 1) {
            throw new Error(`letter = ${letter} n'est pas valide`);
        }
        if (!isNaN(letter)) {
            return parseInt(letter)+0.5;
        }
        let Letter = letter.toUpperCase();
        let value = Letter.charCodeAt(0) - 65;
        if ((value < 0) || (value>25)) {
            throw new Error(`letter = ${letter} n'est pas valide`);
        }
        if (letter == Letter) {
            return value -0.5;
        } else {
            return value-1;
        }
    }

    /**
     * Constructeur
     * @param {Number} x 
     * @param {Number} y 
     */
    constructor(x,y) {
       this.#x = x;
       this.#y = y; 
    }

    /**
     * Accesseur x
     * @returns {Number}
     */
    get x() {
        return this.#x;
    }

    /**
     * Accesseur y
     * @returns {Number}
     */
    get y() {
        return this.#y;
    }

    /**
     * Accesseur line = y
     * @returns {Number}
     */
    get line() {
        return this.#y;
    }

    /**
     * Accesseur col = x
     * @returns {Number}
     */
    get col() {
        return this.#x;
    }

    /**
     * Accesseur paire [x,y]
     * @returns {Array<Number>}
     */
    get xy() {
        return [this.#x, this.#y];
    }
}

export { Coords };