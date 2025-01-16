import { COLORS, DIRECTION } from "../constantes"
import { Events } from './events';
import { SelectionCoder } from './selectioncoder';
import {Action, ActionBorder, ActionColor, ActionDigit} from './action';

const SYMBOLS = {
    "color": "_",
    "clear": "!",
    "borderall": 'A',
    "border": '|'
}

class History {
    /** @type {number} */
    #size;
    /** @type {Array<Action>} */
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
        this.#size = height*width;
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


    decode(actionCode){
        if (actionCode.lengh==0){
            return null;
        }
        if (actionCode.charAt(0) == "|") {
            if (actionCode.lengh<3){
                return null;
            }
            let color = this.#getColor(actionCode.charAt(1));
            if (color=="") {
                return null;
            }
            let iDir = this.#getDirection(actionCode.charAt(2));
            let selection = iDir<0 ? new SelectionCoder(actionCode.substring(2), this.#size):new SelectionCoder(actionCode.substring(3), this.#size);
            return { type:"border", indexes:selection, direction:iDir, color:color };
        }
        if (action.charAt(0) == "_") {
            return null;
        }
        return null;
    }

    /** renvoie la couleur correspondant à un caractère représentant un indice de couleur
     * renvoie "" en cas de problème
     * @param {string} strCol
     * @returns {string}
     */
    #getColor(strCol){
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
    #getDirection(strDir){
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
     * code l'ensemble de l'historique
     * @returns {string}
     */
    get code(){
        return _.map(this.#liste.slice(0,this.#cursor), function(item){return item.code}).join(",");
    }

    /**
     * décode un historique codé
     * @param {string} code
     * @returns {Object[]}
     */
    decodeAll(code){
        let actionCodes = code.split(',');
        let actions = [];
        for (let actionCode of actionCodes){
            let action = this.decode(actionCode);
            if (action == null) {
                console.log(`${actionCode} non reconnu`);
                return null;
            }
            actions.push(action);
        }
        return actions;
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
        let action = new ActionColor(color, [this.#size, indexes]);
        this.#liste.push(action);
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
        let action = new ActionBorder(color, direction, [this.#size, indexes]);
        this.#liste.push(action);
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
        let action = new ActionDigit(digit, anchor, color, [this.#size, indexes]);
        this.#liste.push(action);
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
        let actions = this.decodeAll(histoText);
        if (actions == null) {
            console.log("Échec !");
        }
        this.#liste = actions;
        console.log(actions);
        this.#cursor = 0;
        this.#eventsGest.triggerEvent("back", e, {actions:[]});
    }





    #changeHistoryText() {
        document.getElementById("history").value = this.code;
    }




}

export { History }