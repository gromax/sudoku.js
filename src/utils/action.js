import { COLORS, DIRECTION, ANCRES } from "../constantes";
import { Selection } from "./selection";


/** renvoie la couleur correspondant à un caractère représentant un indice de couleur
 * renvoie "" en cas de problème
 * @param {string} strCol
 * @returns {string}
 */
function getColor(strCol){
    let iCol = parseInt(strCol);
    if ((strCol.length==0)||(strCol.length>1)){
        throw new Error(`${strCol} : invalide, il faut un caractère.`);
    }
    if (isNaN(iCol)) {
        return "";
    }
    if (iCol>= COLORS.length){
        return "";
    }
    return COLORS[iCol];
}

/**
 * renvoie le code de direction correspondant à un caractère codant cette direction
 * en cas de défaut, renvoie -1
 * @param {string} strDir
 * @returns {number}
 */
function getDirection(strDir){
    if ((strDir.length==0)||(strDir.length>1)){
        throw new Error(`${strDir} : invalide, il faut un caractère.`);
    }
    let iDir = parseInt(strDir);
    if (isNaN(iDir)) {
        return -1;
    }
    for (let key in DIRECTION) {
        if (DIRECTION[key]==iDir){
            return iDir
        }
    }
    return -1;
}

/**
 * renvoie le code d'ancre correspondant à un caractère codant cette ancre
 * en cas de défaut, renvoie -1
 * @param {string} strAnchor
 * @returns {string}
 */
function getAnchor(strAnchor){
    if ((strAnchor.length==0)||(strAnchor.length>1)){
        throw new Error(`${strDir} : invalide, il faut un caractère.`);
    }
    let iAnchor = parseInt(strAnchor);
    if (isNaN(iAnchor)) {
        return "";
    }
    for (let anchor in ANCRES){
        if (ANCRES[anchor] == iAnchor) {
            return anchor;
        }
    }
    return "";
}

class Action {
    /** @type {Selection} */
    #selection
    /** @type {string} */
    #color

    /**
     * décode un code d'historique
     * @param {string} actionCode 
     * @param {number} size
     * @returns {Action|null}
     */
    static decode(actionCode, size) {
        if (actionCode.length==0){
            return null;
        }
        if (actionCode.charAt(0) == "C") {
            return ActionColor.decode(actionCode, size);
        } else if (actionCode.charAt(0) == "B") {
            return ActionBorder.decode(actionCode, size);
        } else if (actionCode.charAt(0) == "D") {
            return ActionDigit.decode(actionCode, size);
        }
        return null;
    }


    /**
     * constructeur
     * @param {string} color 
     * @param {Selection} selection
     */
    constructor(color, selection){
        this.#color = color;
        this.#selection = selection;
    }

    get selection() {
        return this.#selection;
    }

    get color() {
        return this.#color;
    }

    get iCol() {
        let i = COLORS.indexOf(this.#color);
        if (i>=0) {
            return i;
        }
        return -1;
    }
}

class ActionBorder extends Action {
    /** @type {number} */
    #direction

    /**
     * constructeur
     * @param {string} color 
     * @param {number} direction 
     * @param {Selection} selection 
     */
    constructor(color, direction, selection){
        super(color, selection);
        if (Object.values(DIRECTION).indexOf(direction) <0){
            this.#direction = -1;
        } else {
            this.#direction = direction;
        }
    }

    get direction() {
        return this.#direction;
    }

    get code() {
        let strCol = this.iCol<0 ? "_" : this.iCol;
        let strDir = this.direction<0 ? "_" : this.direction;
        return "B" + strCol + strDir + this.selection.code;
    }

    /**
     * Décode un code d'historique correspondant à un bord
     * @param {string} actionCode 
     * @param {number} size 
     * @returns {ActionBorder|null}
     */
    static decode(actionCode, size) {
        if (actionCode.length<3){
            return null;
        }
        let color = getColor(actionCode.charAt(1));
        if (color=="") {
            return null;
        }
        let iDir = getDirection(actionCode.charAt(2));
        let path = actionCode.substring(3);
        let selection = new Selection(path, size);
        return new ActionBorder(color, iDir,selection);
    }

}


class ActionColor extends Action {
    /**
     * constructeur
     * @param {string} color 
     * @param {Selection} selection 
     */
    constructor(color, selection){
        super(color, selection);
    }

    get code() {
        let strCol = this.iCol<0 ? "_" : this.iCol;
        return "C" + strCol + this.selection.code;
    }

    /**
     * Décode un code d'historique correspondant à une couleur
     * @param {string} actionCode 
     * @param {number} size 
     * @returns {ActionColor|null}
     */
    static decode(actionCode, size) {
        if (actionCode.length<3){
            return null;
        }
        let color = getColor(actionCode.charAt(1));
        let path = actionCode.substring(2);
        let selection = new Selection(path, size);
        return new ActionColor(color, selection);
    }
}

class ActionDigit extends Action {
    /** @type {string} */
    #digit
    /** @type {anchor} */
    #anchor

    /**
     * constructeur
     * @param {string} digit 
     * @param {string} anchor 
     * @param {string} color 
     * @param {Selection} selection 
     */
    constructor(digit, anchor, color, selection){
        super(color, selection);
        this.#digit = digit;
        if (typeof ANCRES[anchor] == "undefined") {
            this.#anchor = "P";
        } else {
            this.#anchor = anchor;
        }
    }

    get digit() {
        return this.#digit;
    }

    get anchor() {
        return this.#anchor;
    }

    get iAnchor() {
        return ANCRES[this.#anchor].code;
    }

    get code() {
        if (this.iCol<0) {
            return "D_" + this.iAnchor + this.selection.code;
        }
        return "D" + this.digit + this.iAnchor + this.iCol + this.selection.code;
    }

    /**
     * Décode un code d'historique correspondant à un digit
     * @param {string} actionCode 
     * @param {number} size 
     * @returns {ActionColor|null}
     */
    static decode(actionCode, size) {
        if (actionCode.length<4){
            return null;
        }
        let anchor = getAnchor(actionCode.charAt(2));
        if (anchor == ""){
            return null;
        }
        if (actionCode.charAt(1) == "_") {
            let path = actionCode.substring(3);
            let selection = new Selection(path, size);
            return new ActionDigit("", anchor, "", selection);
        } else {
            let digit = actionCode.charAt(1);
            if (isNaN(digit)) {
                return null;
            }
            let color = getColor(actionCode.charAt(3));
            let path = actionCode.substring(4);
            let selection = new Selection(path, size);
            return new ActionDigit(digit, anchor, color, selection);
        }
    }
}

export {Action, ActionBorder, ActionColor, ActionDigit }