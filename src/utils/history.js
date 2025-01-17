import { COLORS, DIRECTION } from "../constantes"
import { Events } from './events';
import { Selection } from './selection';
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
     * @returns {Action[]}
     */
    decodeAll(code){
        let actionCodes = code.split(',');
        let actions = [];
        for (let actionCode of actionCodes){
            let action = Action.decode(actionCode,this.#size);
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
     * @param {Selection} selection
     * @param {string} color 
     * @param {number|string} direction 
     */
    pushBorder(selection, color, direction) {
        this.#purge();
        let action = new ActionBorder(color, direction, selection);
        this.#liste.push(action);
        this.#cursor++;
        this.#changeHistoryText();
    }

    /**
     * ajoute un changement de digit à l'historique
     * @param {Selection} selection 
     * @param {number|string} digit 
     * @param {string} anchor 
     * @param {string} color 
     */
    pushDigit(selection, digit, anchor, color) {
        this.#purge();
        let action = new ActionDigit(digit, anchor, color, selection);
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