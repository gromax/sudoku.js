import _ from 'lodash';
import { GCell } from "../graphic/cell";
import { Canvas } from "../graphic/canvas";

class Cells {
    /** @type {Array<GCell>} */
    #cells;

    /**
     * constructeur
     * @param {Canvas} front
     * @param {Canvas} back
     * @param {number} width
     * @param {number} height
     */
    constructor(front, back, width, height) {
        this.#cells = [];
        for (let line=0; line < height; line++){
            for (let col=0; col < width; col++){
                let c = new GCell(back, front, line, col);
                this.#cells.push(c);
            }
        }
    }

    /**
     * renvoie la cellule à l'index désiré
     * ou liste de cellules aux index désirés
     * @param {number|number[]} i 
     * @returns {GCell}
     */
    get(i) {
        if (Array.isArray(i)) {
            let cells = this.#cells;
            return _.map(i, function(j){ return cells[j]; });
        }
        return this.#cells[i];
    }

    /**
     * remet les cellules à zéro
     */
    clear() {
        for (let c of this.#cells) {
            c.clearAllCandidats();
            c.clearColors();
        }
    }



}

export { Cells }