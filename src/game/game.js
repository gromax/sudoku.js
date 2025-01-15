import { Board } from "../graphic/board";
import { History } from "../utils/history";
import { Selection } from '../graphic/selection';
import { Cells } from "./cells";
import { Borders } from '../graphic/borders';
import { Events } from "../utils/events";
import { Pad } from "../interface/pad";

class Game {
    /** @type {Cells} */
    #cells
    /** @type {Borders} */
    #borders;

    /**
     * constructeur
     * @param {string} idBoard
     * @param {string} idPad
     * @param {string} format
     * @param {string} commandes
     */
    constructor(idBoard, idPad, format, commandes) {
        let eventsGest = new Events();
        let board = new Board(idBoard, format, commandes, eventsGest);
        let selection = new Selection(board.layer("selection"), board.width, board.height, eventsGest);
        let history = new History(board.width, board.height, eventsGest);
        new Pad(idPad, eventsGest);
  
        this.#cells = new Cells(board.layer("frontCell"), board.layer("backCell"), board.width, board.height);
        this.#borders = new Borders(board.layer("frontCell"), board.width, board.height);

        let self = this;
        eventsGest.addEvent("digit", function(e,data){
            if (data == null) {
                throw new Error("data est indéfini.");
            }
            let indexes = selection.get_selecteds_index();
            if (indexes.length == 0) {
                return;
            }
            if (typeof data.anchor =="undefined") {
                throw new Error("data.anchor est indéfini.");
            }
            let color = data.color || "";
            let digit = data.digit || "";
            history.pushDigit(indexes, digit, data.anchor, color);
            self.digit(indexes, digit, data.anchor, color);
        });

        eventsGest.addEvent("paint", function(e,data){
            let indexes = selection.get_selecteds_index();
            if (indexes.length == 0) {
                return;
            }
            let color = data != null ? (data.color||"") : "";
            history.pushCol(indexes, color);
            self.paint(indexes, color);
        });

        eventsGest.addEvent("border", function(e,data){
            if (data == null) {
                throw new Error("data est indéfini.");
            }
            let indexes = selection.get_selecteds_index();
            if (indexes.length == 0) {
                return;
            }
            let direction = data.direction || -1;
            if (typeof data.color =="undefined") {
                throw new Error("data.color est indéfini.");
            }
            history.pushBorder(indexes, data.color, direction);
            self.border(indexes, data.color, direction);
        });

        eventsGest.addEvent("back", function(e, data) {
            self.clear();
            if ((data == null) || (typeof data.actions == 'undefined')) {
                return;
            }
            for (let action of data.actions) {
                self.execAction(action);
            }
        });

        eventsGest.addEvent("forward", function(e,data) {
            if ((data == null) || (typeof data.action == 'undefined')) {
                return;
            }
            self.execAction(data.action);
        })
    }

    /**
     * assigne un digit. Si digit vide, l'efface 
     * @param {number[]} indexes 
     * @param {string} digit 
     * @param {string} anchor 
     * @param {string} color 
     */
    digit(indexes, digit, anchor, color) {
        if (digit == "") {
            this.#clearDigits(indexes, anchor);
        } else {
            this.#toggleDigit(indexes, digit, anchor, color);
        }
    }

    /**
     * assigne une couleur. Si color vide, efface
     * @param {number[]} indexes 
     * @param {string} color 
     */
    paint(indexes, color) {
        if (color == "") {
            this.#clearColors(indexes);
        } else {
            this.#toggleSelColor(indexes, color);
        }
    }

    /**
     * assigne un bord. Si direction pas dans DIRECTIONS, les 4 bords
     * @param {number[]} indexes 
     * @param {string} color 
     * @param {number} direction 
     */
    border(indexes, color, direction) {
        this.#toggleBorderColor(indexes, color, direction);
    }

    /**
     * change l'état de la couleur donnée pour les cellules de la sélection
     * @param {number[]} indexes
     * @param {string} color
     */
    #toggleSelColor(indexes, color) {
        let cells = this.#cells.get(indexes);
        if (_.every(cells, function(c){ return c.hasColor(color); })) {
            _.forEach(cells, function(c){ c.removeColor(color); });
        } else {
            _.forEach(cells, function(c){ c.addColor(color); });
        }
    }

    /**
     * supprime les couleurs de la sélection
     * @param {number[]} indexes
     */
    #clearColors(indexes) {
        let cells = this.#cells.get(indexes);
        _.forEach(cells, function(c){ c.clearColors(); });
    }

    /**
     * change l'état de des segments dans la direction indiquée sur la sélection
     * @param {number[]} indexes
     * @param {string} color
     * @param {number} direction
     */
    #toggleBorderColor(indexes, color, direction) {
        let segs = this.#borders.get(indexes, direction);
        if (_.every(segs, function(s){ return s.color == color})) {
            _.forEach(segs, function(s){ s.hide(); });
        } else {
            _.forEach(segs, function(s){ s.setColor(color); });
        }
    }

    /**
     * ajoute ou supprime un digit
     * @param {number[]} indexes
     * @param {number|string} digit
     * @param {string} anchor
     * @param {string} color
     */
    #toggleDigit(indexes, digit, anchor, color) {
        let cells = this.#cells.get(indexes);
        if (_.every(cells, function(c){ return c.hasDigit(digit, anchor); })) {
            _.forEach(cells, function(c){ c.removeDigit(digit, anchor); });
        } else {
            _.forEach(cells, function(c){ c.addDigit(digit, anchor, color); });
        }
    }

    /**
     * supprime les candidats
     * @param {number[]} indexes
     * @param {string} anchor 
     */
    #clearDigits(indexes, anchor) {
        let cells = this.#cells.get(indexes);
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
     * @param {Object} action 
     */
    execAction(action) {
        if (["color", "digit", "border"].indexOf(action.type) <0){
            throw new Error(`Le type d'action ${action.type} est inconnu.`);
        };
        if (action.type == "color") {
            this.paint(action.indexes, action.color);
        } else if (action.type == "digit") {
            this.digit(action.indexes, action.digit, action.anchor, action.color);
        } else {
            this.border(action.indexes, action.color, action.direction);
        }
    }


}

export { Game }