import { Canvas } from './canvas';

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
     * sélection d'une cellule
     * @param {number} x coordonnée x du click
     * @param {number} y coordonnée y du click
     * @param {boolean} shiftPressed touche shift pressée
     */
    select(x, y, shiftPressed) {
        let line = Math.floor(this.#canvas.valueToUnit(y));
        let col = Math.floor(this.#canvas.valueToUnit(x));
        if (!shiftPressed){
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



}

export { Selection };