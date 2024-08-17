/* Objet contenant une paire de coordonnées */

import _ from 'lodash';

class Coords {
    #x;
    #y;
    static REGEX = "[A-Za-z][A-Za-z0-9]"

    static strToCoords(chaine) {
        /* chaine est une suite de forme ABbDCa
           une paire de coordonnées est formée de deux lettres
           renvoie un tableau de Coords correspondant
        */
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

    static paireToCoord(paire) {
        /* paire = chaine de deux lettres alphabétiques, minuscule ou minuscules
           a = -1 ; A = -0.5
           b = 0 ; B = 0.5
           etc.
           La 2e peut-être un digit 0-9
           La première pour la ligne (y), la seconde pour la colonne (x)
           renvoie la coordonnée correspondante
        */
        if (paire.length != 2) {
            throw new Error(`paire = ${paire} n'est pas valide`);
        }
        let [y, x] = _.map(paire, Coords.letterToValue);
        return new Coords(x, y);
    }

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

    constructor(x,y) {
       this.#x = x;
       this.#y = y; 
    }

    get x() {
        return this.#x;
    }

    get y() {
        return this.#y;
    }

    get line() {
        return this.#y;
    }

    get col() {
        return this.#x;
    }

    get xy() {
        return [this.#x, this.#y];
    }
}

export { Coords };