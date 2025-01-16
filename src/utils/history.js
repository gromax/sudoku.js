import { stringToInts, intsToString, ALPHABETSIZE } from './misc';
import { COLORS, ANCRES } from "../constantes"
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
        eventsGest.addEvent("load", function(e,data){
            self.load(e);
        });
    }
    /**
     * code une action
     * chaque fois, une sélection est utile et est codée par une succession de a-zA-Z;:
     * un effacement de couleur est codée "_!<selection>"
     * un choix de couleur est codé "_1<selection>" ou 1 est un exemple de code couleur
     * un choix de bord est codé "|23<selection>" 2 est le code direction, 2 le code couleur
     * un choix de digit est codé "236<selection>" 2 étant le digit, 3 l'ancre et 6 la couleur
     * un effacement de digits est codé "3<selection>" 3 étant l'ancre
     * @param {*} action 
     */
    code(action){
        let path = this.#selectionCode(action.indexes);
        if (action.type == "border") {
            let icol = COLORS.indexOf(action.color);
            let dir = action.direction>=0? action.directon : "";
            return "|"+dir+icol+path;
        }
        if (action.type == "color") {
            let icol = action.color == "" ? "!" : COLORS.indexOf(action.color);
            return "_"+icol+path;
        }
        let iDir = ANCRES[action.anchor].code;
        let icol = action.color == "" ? "!" : COLORS.indexOf(action.color);
        return ""+action.digit+iDir+icol+path;
    }

    /**
     * code l'ensemble de l'historique
     * @returns {string}
     */
    codeAll(){
        let self = this;
        return _.map(this.#liste.slice(0,this.#cursor), function(item){return self.code(item)}).join("");
    }

    /**
     * renvoie une chaîne de caractère représentant les indices sélectionnés
     * @param {number[]} selection indices sélectionnés
     * @returns {string}
     */
    #selectionCode(selection){
        if (selection.length == 0) {
            throw Error("selection est vide !");
        }
        // selection converti en un indice initial puis indices relatifs
        let deplacements = [selection[0]];
        for (let i=1; i<selection.length; i++){
            deplacements.push(selection[i] - selection[i-1]);
        }
        // premier cas, brut.
        let size = this.#height*this.#width;
        let code1 = intsToString(this.#convBase(size, ALPHABETSIZE, deplacements));
        // 2e cas, en mettant à part le premier indice
        let depart = selection[0];
        let code2 = intsToString(this.#convBase(size, ALPHABETSIZE, [depart])) + ":" + intsToString(this.#convBase(size - depart - 1, ALPHABETSIZE, deplacements.slice(1)));
        // 3e cas, en utilisant l'élément max
        let m = Math.max(...deplacements);
        let code3 = intsToString(this.#convBase(size, ALPHABETSIZE, [m])) + ";" + intsToString(this.#convBase(m+1, ALPHABETSIZE, deplacements));
        if ((code1.length <= code2.length) && (code1.length<= code3.length)) {
            return code1;
        }
        if (code2.length <= code3.length) {
            return code2;
        }
        return code3;
    }

    /**
     * Décode le code proposé en une suite d'indice
     * @param {string} code 
     * @returns {number[]}
     */
    #selectionDecode(code) {
        let i = code.indexOf(":");
        let j = code.indexOf(";");
        let size = this.#height*this.#width;
        let deplacements;
        if (i>=0) {
            let depart = this.#convBase(ALPHABETSIZE, size, stringToInts(code.substring(0,i)))[0];
            let deltas = this.#convBase(ALPHABETSIZE, size-depart-1, stringToInts(code.substring(i+1)));
            deplacements = [depart].concat(deltas);
        } else if (j>=0) {
            let b = this.#convBase(ALPHABETSIZE, size, stringToInts(code.substring(0,j)))[0] + 1;
            deplacements = this.#convBase(ALPHABETSIZE, b, stringToInts(code.substring(j+1)));
        } else {
            deplacements = this.#convBase(ALPHABETSIZE, size, stringToInts(code));
        }
        let out = [deplacements[0]];
        for (let k=1; k<deplacements.length; k++) {
            out.push(out[k-1]+deplacements[k]);
        }
        return out;
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
        this.#changeHistoryText();
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
        this.#changeHistoryText();
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
        this.#changeHistoryText();
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
        this.#changeHistoryText();
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
        this.#changeHistoryText();
        this.#eventsGest.triggerEvent("back", e, {actions:this.#liste.slice(0, this.#cursor)});
    }

    /**
     * charge le nouvel historique et place le curseur en 0
     */
    load(e) {
        let histoText = document.getElementById('history').value;
        console.log(histoText);
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
    #convBase(baseSource, baseCible, digits){
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

    #changeHistoryText() {
        document.getElementById("history").value = this.codeAll();
    }




}

export { History }