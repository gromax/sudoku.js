import { Events } from './events';
import { Selection } from './selection';
import {Action, ActionBorder, ActionColor, ActionDigit} from './action';
import { download, upload } from './misc';

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
        eventsGest.addEvent("forwardCommentClick", function(e,data){
            self.forwardComment(e);
        });
        eventsGest.addEvent("download", function(e,data){
            download(self.code, "sudoku.txt");
        });
        eventsGest.addEvent("upload", function(e,data){
            upload(function(data){ self.upload(e, data)});
        });
    }

    /**
     * code l'ensemble de l'historique
     * @returns {string}
     */
    get code(){
        return JSON.stringify(_.map(this.#liste.slice(0,this.#cursor), function(item){return item.code})).replaceAll(',{',',\n{');
    }

    /**
     * décode un historique codé
     * @param {string} code
     * @returns {Action[]}
     */
    decodeAll(code){
        let actionCodes = JSON.parse(code);
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

    setActions(actionsJSON) {
        let actions = [];
        for (let actionJSON of actionsJSON){
            let action = Action.decode(actionJSON,this.#size);
            if (action == null) {
                console.log(`${actionJSON} non reconnu`);
                return null;
            }
            actions.push(action);
        }
        this.#liste = actions;
        this.#cursor = 0;
        this.#eventsGest.triggerEvent("successMessage", e, {content:"Chargement réussi !"});
        this.#eventsGest.triggerEvent("back", e, {actions:[]});
    }

    /**
     * supprime l'historique à partir du rang #cursor
     */
    #purge() {
        this.#liste = this.#liste.slice(0, this.#cursor);
    }

    /**
     * ajoute un changement de couleur à l'historique
     * @param {Selection} selection 
     * @param {string} color 
     */
    pushCol(selection, color) {
        this.#purge();
        let action = new ActionColor(color, selection);
        this.#liste.push(action);
        this.#cursor++;
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
    }

    /**
     * Avance jusqu'à la prochain action avec commentaire
     * @param {Event} e 
     */
    forwardComment(e){
        let actions = [];
        while (this.#cursor<this.#liste.length) {
            let action = this.#liste[this.#cursor];
            this.#cursor++;
            actions.push(action);
            if (action.comment != "") {
                break;
            }
        }
        this.#eventsGest.triggerEvent("forward", e, {actions:actions});
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
        this.#eventsGest.triggerEvent("forward", e, {actions:[action]});
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
        this.#eventsGest.triggerEvent("back", e, {actions:this.#liste.slice(0, this.#cursor)});
    }

    /**
     * charge le nouvel historique et place le curseur en 0
     * @param {Event} e
     * @param {*} data
     */
    upload(e, data) {
        if (data.success) {
            let actions = this.decodeAll(data.content);
            if (actions == null) {
                this.#eventsGest.triggerEvent("errorMessage", e, {content:"Échec !"});
            }
            this.#liste = actions;
            this.#cursor = 0;
            this.#eventsGest.triggerEvent("successMessage", e, {content:"Chargement réussi !"});
            this.#eventsGest.triggerEvent("back", e, {actions:[]});
        } else {
            this.#eventsGest.triggerEvent("errorMessage", e, data);
        }
    }

    /**
     * accesseur action en cours (celle avant #cursor)
     * @returns {Action|null}
     */
    get currentAction(){
        if (this.#cursor == 0) {
            return null;
        }
        return this.#liste[this.#cursor-1];
    }

    setComment(comment) {
        if (this.#cursor==0) {
            let action = new Action("", new Selection([], this.#size), comment);
            this.#liste.splice(0, 0, action);
            this.#cursor++;

        } else {
            this.#liste[this.#cursor-1].setComment(comment);
        }
        this.#eventsGest.triggerEvent("message", null, {
            content:comment,
            clear:true
        });
    }

}

export { History }