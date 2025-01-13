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
    String.fromCharCode(97 + j)
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

export { letterToInt, intToLetter }