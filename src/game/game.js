import { Board } from "../graphic/board";
import { History } from "../utils/history";
import { GSelection } from '../graphic/gselection';
import { Cells } from "./cells";
import { Borders } from '../graphic/borders';
import { Events } from "../utils/events";
import { Pad } from "../interface/pad";
import { Action, ActionColor, ActionDigit } from "../utils/action";
import { Selection } from "../utils/selection";
import { Messages } from "../interface/messages";
import { Saisie } from "../interface/saisie";


class Game {
    /** @type {Cells} */
    #cells
    /** @type {Borders} */
    #borders;

    /** @type {Events} */
    #eventsGest

    /** @type {Pad} */
    #pad

    /**
     * constructeur
     * @param {string} idBoard
     * @param {string} idPad
     * @param {string} format
     * @param {string} commandes
     */
    constructor(idBoard, idPad, format, commandes) {
        document.addEventListener("keyup", (e) => {
            this.keyUp(e, e.key)
        });
        let eventsGest = new Events();
        let board = new Board(idBoard, format, commandes, eventsGest);
        let gSelection = new GSelection(board.layer("selection"), board.width, board.height, eventsGest);
        let history = new History(eventsGest);
        let messages = new Messages(eventsGest);
        let saisie = new Saisie("comment", eventsGest);
        this.#pad = new Pad(idPad, eventsGest);
  
        this.#cells = new Cells(board.layer("frontCell"), board.layer("backCell"), board.width, board.height);
        this.#borders = new Borders(board.layer("frontCell"), board.width, board.height);

        let self = this;
        eventsGest.addEvent("digit", function(e,data){
            if (data == null) {
                throw new Error("data est indéfini.");
            }
            let selection = gSelection.selection;
            if (selection.length == 0) {
                return;
            }
            if (typeof data.anchor =="undefined") {
                throw new Error("data.anchor est indéfini.");
            }
            let color = data.color || "";
            let digit = data.digit || "";
            history.pushDigit(selection, digit, data.anchor, color);
            self.digit(selection, digit, data.anchor, color);
            messages.clear();
        });

        eventsGest.addEvent("paint", function(e,data){
            let selection = gSelection.selection;
            if (selection.length == 0) {
                return;
            }
            let color = data != null ? (data.color||"") : "";
            history.pushCol(selection, color);
            self.paint(selection, color);
            messages.clear();
        });

        eventsGest.addEvent("border", function(e,data){
            if (data == null) {
                throw new Error("data est indéfini.");
            }
            let selection = gSelection.selection;
            if (selection.length == 0) {
                return;
            }
            let direction = data.direction || -1;
            if (typeof data.color =="undefined") {
                throw new Error("data.color est indéfini.");
            }
            history.pushBorder(selection, data.color, direction);
            self.border(selection, data.color, direction);
            messages.clear();
        });

        eventsGest.addEvent("back", function(e, data) {
            self.clear();
            if ((data == null) || (typeof data.actions == 'undefined')) {
                return;
            }
            for (let action of data.actions) {
                self.execAction(action);
            }
            if (data.actions.length>0) {
                let last = data.actions[data.actions.length-1];
                eventsGest.triggerEvent("message", e, {
                    content:last.comment,
                    clear:true
                });
            }
        });

        eventsGest.addEvent("forward", function(e,data) {
            if ((data == null) || (typeof data.actions == 'undefined')) {
                return;
            }
            for (let action of data.actions) {
                self.execAction(action);
            }
            if (data.actions.length>0){
                eventsGest.triggerEvent("message", e, {
                    content:data.actions[data.actions.length-1].comment,
                    clear:true
                });
            }
        });

        eventsGest.addEvent("commentClick", function(e, data){
            if (!data) {
                return;
            }
            if (data.selected) {
                let action = history.currentAction;
                let comment = action==null?"":action.comment;
                saisie.show(comment);
            } else {
                saisie.hide();
            }
        });

        eventsGest.addEvent("submitSaisie", function(e, data){
            history.setComment(data.text);
        })
        this.#eventsGest = eventsGest;
    }

    /**
     * assigne un digit. Si digit vide, l'efface 
     * @param {Selection} selection
     * @param {string} digit 
     * @param {string} anchor 
     * @param {string} color 
     */
    digit(selection, digit, anchor, color) {
        if (digit == "") {
            this.#clearDigits(selection, anchor);
        } else {
            this.#toggleDigit(selection, digit, anchor, color);
        }
    }

    load(filename){
        let self = this;
        fetch(`./files/${filename}.txt`).then(response => {
            if (response.ok){
                response.json().then(data => {
                    self.events.triggerEvent("load", null, data);
                });
            } else {
                self.events.triggerEvent("errorMessage", null, {content:`./files/${filename}.txt not found.`});
            }
        });
    }

    /**
     * assigne une couleur. Si color vide, efface
     * @param {Selection} selection 
     * @param {string} color 
     */
    paint(selection, color) {
        if (color == "") {
            this.#clearColors(selection);
        } else {
            this.#toggleSelColor(selection, color);
        }
    }

    /**
     * assigne un bord. Si direction pas dans DIRECTIONS, les 4 bords
     * @param {Selection} selection 
     * @param {string} color 
     * @param {number} direction 
     */
    border(selection, color, direction) {
        this.#toggleBorderColor(selection, color, direction);
    }

    /**
     * change l'état de la couleur donnée pour les cellules de la sélection
     * @param {Selection} selection
     * @param {string} color
     */
    #toggleSelColor(selection, color) {
        let cells = this.#cells.get(selection.indexes);
        if (_.every(cells, function(c){ return c.hasColor(color); })) {
            _.forEach(cells, function(c){ c.removeColor(color); });
        } else {
            _.forEach(cells, function(c){ c.addColor(color); });
        }
    }

    /**
     * supprime les couleurs de la sélection
     * @param {Selection} selection
     */
    #clearColors(selection) {
        let cells = this.#cells.get(selection.indexes);
        _.forEach(cells, function(c){ c.clearColors(); });
    }

    /**
     * change l'état de des segments dans la direction indiquée sur la sélection
     * @param {Selection} selection
     * @param {string} color
     * @param {number} direction
     */
    #toggleBorderColor(selection, color, direction) {
        let segs = this.#borders.get(selection.indexes, direction);
        if (_.every(segs, function(s){ return s.color == color})) {
            _.forEach(segs, function(s){ s.hide(); });
        } else {
            _.forEach(segs, function(s){ s.setColor(color); });
        }
    }

    /**
     * ajoute ou supprime un digit
     * @param {Selection} selection
     * @param {number|string} digit
     * @param {string} anchor
     * @param {string} color
     */
    #toggleDigit(selection, digit, anchor, color) {
        let cells = this.#cells.get(selection.indexes);
        if (_.every(cells, function(c){ return c.hasDigit(digit, anchor); })) {
            _.forEach(cells, function(c){ c.removeDigit(digit, anchor); });
        } else {
            _.forEach(cells, function(c){ c.addDigit(digit, anchor, color); });
        }
    }

    /**
     * supprime les candidats
     * @param {Selection} selection
     * @param {string} anchor 
     */
    #clearDigits(selection, anchor) {
        let cells = this.#cells.get(selection.indexes);
        if (_.every(cells, function(c){ return !c.hasAnchor(anchor); })) {
            _.forEach(cells, function(c){ c.clearAllCandidats(); });
        } else {
            _.forEach(cells, function(c){ c.clearCandidats(anchor); });
        }
    }

    /**
     * met à zéro cellules et bords
     */
    clear() {
        this.#cells.clear();
        this.#borders.clear();
    }

    /**
     * exécute une entrée d'historique
     * @param {Action} action 
     */
    execAction(action) {
        if (action instanceof ActionColor) {
            this.paint(action.selection, action.color);
        } else if (action instanceof ActionDigit) {
            this.digit(action.selection, action.digit, action.anchor, action.color);
        } else {
            this.border(action.selection, action.color, action.direction);
        }
    }

    /**
     * accesseur events
     * @returns {Events}
     */
    get events(){
        return this.#eventsGest;
    }

    keyUp(e, key) {
        if (key === "Delete") {
            this.#eventsGest.triggerEvent("digit", e, { anchor:this.#pad.position })
        } else  if(["1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(key)) {
            const n = parseInt(key)
            this.#eventsGest.triggerEvent("digit", e, {digit:n, color:this.#pad.selectedColor, anchor:this.#pad.position})
        }
    }
}

export { Game }