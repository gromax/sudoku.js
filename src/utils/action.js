import { COLORS, DIRECTION, ANCRES } from "../constantes";
import { Selection } from "./selection";


class Action {
    /** @type {Selection} */
    #selection
    /** @type {string} */
    #color
    /** @type {string} */
    #comment

    /**
     * décode un code d'historique
     * @param {string} actionCode 
     * @param {number} size
     * @returns {Action|null}
     */
    static decode(actionCode, size) {
        if (typeof actionCode != "object"){
            return null;
        }
        if (actionCode.type == "color") {
            return ActionColor.decode(actionCode, size);
        } else if (actionCode.type == "border") {
            return ActionBorder.decode(actionCode, size);
        } else if (actionCode.type == "digit") {
            return ActionDigit.decode(actionCode, size);
        } else if (actionCode.type == "comment") {
            return new Action("", new Selection([], size), actionCode.comment);
        }
        return null;
    }

    /**
     * constructeur
     * @param {string} color 
     * @param {Selection} selection
     * @param {string} comment
     */
    constructor(color, selection, comment=""){
        this.#color = color;
        this.#selection = selection;
        this.#comment = comment;
    }

    get selection() {
        return this.#selection;
    }

    get comment() {
        return this.#comment;
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

    setComment(comment){
        this.#comment = comment;
    }

    /**
     * @returns {Object}
     */
    get code() {
        return {
            type:"comment",
            comment:this.comment
        };
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
     * @param {string} comment
     */
    constructor(color, direction, selection, comment=""){
        super(color, selection, comment);
        if (Object.values(DIRECTION).indexOf(direction) <0){
            this.#direction = -1;
        } else {
            this.#direction = direction;
        }
    }

    get direction() {
        return this.#direction;
    }

    /**
     * @returns {Object}
     */
    get code() {
        return {
            type:"border",
            direction:this.direction,
            color:this.color,
            selection:this.selection.indexes,
            comment:this.comment
        };
    }

    /**
     * Décode un code d'historique correspondant à un bord
     * @param {string} actionCode 
     * @param {number} size 
     * @returns {ActionBorder|null}
     */
    static decode(actionCode, size) {
        for (let key of ["direction", "color", "selection"]){
            if (typeof actionCode[key] == "undefined") {
                return null;
            }
        }
        let selection = new Selection(actionCode.selection, size);
        return new ActionBorder(actionCode.color, actionCode.direction,selection, actionCode.comment);
    }

}


class ActionColor extends Action {
    /**
     * constructeur
     * @param {string} color 
     * @param {Selection} selection
     * @param {string} comment
     */
    constructor(color, selection, comment=""){
        super(color, selection, comment);
    }

    get code() {
        return {
            type:"color",
            color:this.color,
            selection:this.selection.indexes,
            comment:this.comment
        };
    }

    /**
     * Décode un code d'historique correspondant à une couleur
     * @param {string} actionCode 
     * @param {number} size 
     * @returns {ActionColor|null}
     */
    static decode(actionCode, size) {
        for (let key of ["color", "selection"]){
            if (typeof actionCode[key] == "undefined") {
                return null;
            }
        }
        let selection = new Selection(actionCode.selection, size);
        return new ActionColor(actionCode.color, selection, actionCode.comment);
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
     * @param {string} comment
     */
    constructor(digit, anchor, color, selection, comment=""){
        super(color, selection, comment);
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
        return {
            type:"digit",
            color:this.color,
            digit:this.digit,
            anchor:this.anchor,
            selection:this.selection.indexes,
            comment:this.comment
        };
    }

    /**
     * Décode un code d'historique correspondant à un digit
     * @param {string} actionCode 
     * @param {number} size 
     * @returns {ActionColor|null}
     */
    static decode(actionCode, size) {
        for (let key of ["digit", "color", "anchor", "selection"]){
            if (typeof actionCode[key] == "undefined") {
                return null;
            }
        }
        let selection = new Selection(actionCode.selection, size);
        return new ActionDigit(actionCode.digit, actionCode.anchor, actionCode.color, selection, actionCode.comment);
    }
}

export {Action, ActionBorder, ActionColor, ActionDigit }