import _ from 'lodash';

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


export { ALPHABETSIZE, intsToString, stringToInts }