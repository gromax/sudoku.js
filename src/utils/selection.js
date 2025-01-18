const ALPHABETSIZE = 52;

/**
 * code un entier en une lettre
 * A = 0; Z = 25; a = 26 ; z = 51
 * @param {number} i 
 * @returns {string}
 */
function intToLetter(i) {
    if ((i>=52) || (i<0)) {
        throw new Error(`${i} : ne convient pas, il faut un entier entre 0 et 51 compris.`);
    }
    if (i<26) {
        return  String.fromCharCode(65 + i);
    }
    String.fromCharCode(97 - 26 + i)
}

/**
 * renvoie l'entier correspondant à une lettre codée
 * A = 0; Z = 25; a = 26 ; z = 51
 * @param {string} letter 
 * @returns {number}
 */
function letterToInt(letter) {
    let i = letter.charCodeAt(0) - 65;
    if (i<0) {
        throw new Error(`${letter} : ne convient pas, il faut un symbole alphabétique.`);
    }
    if (i<26) {
        return i;
    }
    i -= 32;
    if (i<26) {
        return i + 26;
    }
    throw new Error(`${letter} : ne convient pas, il faut un symbole alphabétique.`);
}

/**
 * convertit une suite d'entiers en une chaîne de caractères
 * @param {number[]} liste 
 * @returns {string}
 */
function intsToString(liste){
    return _.map(liste, intToLetter).join("");
}

/**
 * convertit une chaîne de caractères en suite d'entiers
 * @param {string} message 
 * @returns {number[]}
 */
function stringToInts(message) {
    let n = (message.length);
    let out = [];
    for (let i=0; i<n; i++) {
        let car = message.charAt(i);
        let e = letterToInt(car);
        out.push(e);
    }
    return out;
}


















class Selection {
    /** @type {number} */
    #size;
    /** @type {number[]} */
    #indexes;

    
    /**
     * permet le codage et le décodage de sélection d'indices
     * @param {number[]|string} indexes 
     * @param {number} size
     */
    constructor(indexes, size) {
        this.#size = size;
        if (Array.isArray(indexes)){
            this.#indexes = indexes;
        } else {
            this.#indexes = this.#selectionDecode(indexes);
        }
    }

    /** accesseur indexes
     * @returns {number[]}
     */
    get indexes() {
        return [...this.#indexes];
    }

    /** accesseur taille sélection
     * @returns {number}
     */
    get length() {
        return this.#indexes.length;
    }

    /**
     * renvoie une chaîne de caractère représentant les indices sélectionnés
     * @returns {string}
     */
    get code(){
        if (this.length == 0) {
            return "";
        }
        // selection converti en un indice initial puis indices relatifs
        let deplacements = [this.#indexes[0]];
        for (let i=1; i<this.#indexes.length; i++){
            deplacements.push(this.#indexes[i] - this.#indexes[i-1]);
        }
        // premier cas, brut.
        let code1 = intsToString(this.#convBase(this.#size, ALPHABETSIZE, deplacements));
        return code1;
        /*
        // 2e cas, en mettant à part le premier indice
        let depart = this.#indexes[0];
        let code2 = intsToString(this.#convBase(this.#size, ALPHABETSIZE, [depart])) + ":" + intsToString(this.#convBase(this.#size - depart - 1, ALPHABETSIZE, deplacements.slice(1)));
        // 3e cas, en utilisant l'élément max
        let m = Math.max(...deplacements);
        let code3 = intsToString(this.#convBase(this.#size, ALPHABETSIZE, [m])) + ";" + intsToString(this.#convBase(m+1, ALPHABETSIZE, deplacements));
        if ((code1.length <= code2.length) && (code1.length<= code3.length)) {
            return code1;
        }
        if (code2.length <= code3.length) {
            return code2;
        }
        return code3;
        */
    }

    /**
     * Décode le code proposé en une suite d'indice
     * @param {string} code 
     * @returns {number[]}
     */
    #selectionDecode(code) {
        let i = code.indexOf(":");
        let j = code.indexOf(";");
        let deplacements;
        if (i>=0) {
            let depart = this.#convBase(ALPHABETSIZE, this.#size, stringToInts(code.substring(0,i)))[0];
            let deltas = this.#convBase(ALPHABETSIZE, this.#size-depart-1, stringToInts(code.substring(i+1)));
            deplacements = [depart].concat(deltas);
        } else if (j>=0) {
            let b = this.#convBase(ALPHABETSIZE, this.#size, stringToInts(code.substring(0,j)))[0] + 1;
            deplacements = this.#convBase(ALPHABETSIZE, b, stringToInts(code.substring(j+1)));
        } else {
            deplacements = this.#convBase(ALPHABETSIZE, this.#size, stringToInts(code));
        }
        let out = [deplacements[0]];
        for (let k=1; k<deplacements.length; k++) {
            out.push(out[k-1]+deplacements[k]);
        }
        return out;
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


}

export { Selection }