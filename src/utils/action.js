import { COLORS, DIRECTION, ANCRES } from "../constantes";
import { SelectionCoder } from "./selectioncoder";


class Action {
    /** @type {SelectionCoder} */
    #selection
    /** @type {string} */
    #color

    /**
     * constructeur
     * @param {string} color 
     * @param {[number,number[]]} sindexes 
     */
    constructor(color, sindexes){
        this.#color = color;
        let [size, indexes] = sindexes;
        this.#selection = new SelectionCoder(indexes, size);
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

    get indexes() {
        return this.#selection.indexes;
    }
}

class ActionBorder extends Action {
    /** @type {number} */
    #direction

    /**
     * constructeur
     * @param {string} color 
     * @param {number} direction 
     * @param {[number,number[]]} sindexes 
     */
    constructor(color, direction, sindexes){
        super(color, sindexes);
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
        let strCol = this.iCol<0 ? "!" : this.iCol;
        let strDir = this.direction<0 ? "" : this.direction;
        return "|" + strCol + strDir + this.selection.code;
    }

}


class ActionColor extends Action {
    get code() {
        let strCol = this.iCol<0 ? "!" : this.iCol;
        return "_" + strCol + this.selection.code;
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
     * @param {[number,number[]]} sindexes 
     */
    constructor(digit, anchor, color, sindexes){
        super(color, sindexes);
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
            return "" + this.iAnchor + this.selection.code;
        }
        return "" + this.digit + this.iAnchor + this.iCol + this.selection.code;
    }
}

export {Action, ActionBorder, ActionColor, ActionDigit }