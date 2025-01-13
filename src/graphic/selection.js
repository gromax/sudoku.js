import { Canvas } from './canvas';
import { DIRECTION } from '../constantes';


class Selection {
    static STROKE = { color:"#AAAAFF", width:5};
    static FILL = { color:"#AAAAFF", opacity:0.5};
    /** @type {Canvas} */
    #canvas;
    /** @type {Array<boolean>} */
    #states; // grille contenant false/true indiquant cellule sélectionnée
    /** @type {number} */
    #height;    // nombre de cellules en hauteur
    /** @type {number} */
    #width;     // nombre de cellules en largeur
    /** @type {boolean} */
    #verrou = false;
    

    /**
     * constructeur
     * @param {Canvas} parent
     * @param {number} width
     * @param {number} height
     */
    constructor(parent, width, height) {
        this.#canvas = parent;
        this.#states = Array(width*height).fill(false);
        this.#width = width;
        this.#height = height;
    }

    /**
     * renvoie l'index correspondant à une paire line, col
     * renvoie -1 en cas de positon illégale
     * @param {number} line 
     * @param {number} col
     * @returns {number}
     */
    index(line, col) {
        if ((line <0) || (line >= this.#width) || (col <0) || (col>=this.#height)) {
            return -1;
        }
        return line*this.#width + col;
    }

    /**
     * renvoie [line,col] correspondant à un index
     * @param {number} index
     * @returns {[number,number]}
     */
    lineCol(index) {
        if ((index <0) || (index >= this.#states.length)) {
            throw new Error(`indice:${index} invalide !`);
        }
        let line = Math.floor(index/this.#width);
        let col = index - this.#width*line;
        return [line, col];
    }

    /**
     * sélection d'une cellule
     * @param {number} x coordonnée x du click
     * @param {number} y coordonnée y du click
     * @param {boolean} shiftPressed touche shift pressée
     */
    select(x, y, shiftPressed) {
        let line = Math.floor(this.#canvas.valueToUnit(y));
        let col = Math.floor(this.#canvas.valueToUnit(x));
        if (!shiftPressed && !this.#verrou){
            this.#states = Array(this.#width*this.#height).fill(false);
        }
        this.#addSquare(line, col); 
     }

    /**
     * dessine un carré
     * @param {number} line
     * @param {number} col
     */
    #addSquare(line, col) {
        this.#toggle(line, col);
        this.#refresh();
    }

    /**
     * rafraîchit le tracé de la sélection
     */
    #refresh(){
        this.#canvas.clear();
        let coords = [];
        for (let line=0; line<this.#height; line++){
            for (let col=0; col<this.#width; col++){
                if (this.isSelected(line, col)) {
                    coords.push([line, col]);
                }
            }
        }
        if (coords.length!=0) {
            let polys = this.#canvas.cadre(coords, 0);
            for (let poly of polys){
                poly.stroke(Selection.STROKE).fill(Selection.FILL);
            }
        }
    }

    /**
     * 
     * @param {number} line 
     * @param {number} col 
     */
    #toggle(line, col){
        let i = this.index(line, col);
        if (i==-1) {
            return;
        }
        this.#states[i] = !this.#states[i];
    }

    /**
     * renvoie les index des cellules sélectionnées
     * @returns {Array<number>}
     */
    get_selecteds_index() {
        let out = [];
        for (let i=0; i<this.#states.length; i++){
            if (this.#states[i]) {
                out.push(i);
            }
        }
        return out;
    }

    /**
     * indique si la cellule en line, col est sélectionnée
     * @param {number} line
     * @param {number} col
     * @returns {boolean}
     */
    isSelected(line, col) {
        let i = this.index(line, col);
        if (i==-1) {
            return false;
        }
        return this.#states[i];
    }

    /**
     * renvoie les indices des cellules sur le bord demandé
     * @param {number} direction
     * @returns {Array<number>}
     */
    getBorder(direction) {
        if (direction == DIRECTION.LEFT) {
            return this.#getLeft();
        } else if (direction == DIRECTION.RIGHT) {
            return this.#getRight();
        } else if (direction == DIRECTION.UP) {
            return this.#getTop();
        } else if (direction == DIRECTION.DOWN) {
            return this.#getBottom();
        }
        throw new Error(`direction ${direction} invalide !`);
    }

    /**
     * renvoie les indices des cellules sur le bord gauche
     * @returns {Array<number>}
     */
    #getLeft() {
        let out = [];
        for (let line=0; line<this.#height; line++) {
            for (let col=0; col<this.#width; col++) {
                if (this.isSelected(line, col) && !this.isSelected(line, col-1)) {
                    out.push(this.index(line, col));
                }
            }
        }
        return out;
    }

    /**
     * renvoie les indices des cellules sur le bord droit
     * @returns {Array<number>}
     */
    #getRight() {
        let out = [];
        for (let line=0; line<this.#height; line++) {
            for (let col=0; col<this.#width; col++) {
                if (this.isSelected(line, col) && !this.isSelected(line, col+1)) {
                    out.push(this.index(line, col));
                }
            }
        }
        return out;
    }

    /**
     * renvoie les indices des cellules sur le bord haut
     * @returns {Array<number>}
     */
    #getTop() {
        let out = [];
        for (let line=0; line<this.#height; line++) {
            for (let col=0; col<this.#width; col++) {
                if (this.isSelected(line, col) && !this.isSelected(line-1, col)) {
                    out.push(this.index(line, col));
                }
            }
        }
        return out;
    }

    /**
     * renvoie les indices des cellules sur le bord haut
     * @returns {Array<number>}
     */
    #getBottom() {
        let out = [];
        for (let line=0; line<this.#height; line++) {
            for (let col=0; col<this.#width; col++) {
                if (this.isSelected(line, col) && !this.isSelected(line+1, col)) {
                    out.push(this.index(line, col));
                }
            }
        }
        return out;
    }

    /**
     * désactive le verrou
     */
    resetVerrou() {
        this.#verrou = false;
    }

    /**
     * active le verrouillage
     */
    setVerrou() {
        this.#verrou = true;
    }

}

export { Selection };