import { CELLSIZE, GRIDSIZE } from '../constantes';
import { Canvas } from './canvas';

class Selection {
    static STROKE = { color:"#AAAAFF", width:5};
    static FILL = { color:"#AAAAFF", opacity:0.5};
    #canvas;
    #group;
    #states; // grille contenant false/true indiquant cellule sélectionnée
    
    /**
     * constructeur
     * @param {Canvas} parent 
     */
    constructor(parent) {
        this.#canvas = parent;
        this.#states = Array(GRIDSIZE*GRIDSIZE).fill(false);
    }

    /**
     * sélection d'une cellule
     * @param {Number} x coordonnée x du click
     * @param {Number} y coordonnée y du click
     * @param {boolean} shiftPressed touche shift pressée
     */
    select(x, y, shiftPressed) {
        let line = Math.floor(y/CELLSIZE) - 1;
        let col = Math.floor(x/CELLSIZE) - 1;
        if (!shiftPressed){
            this.#states = Array(GRIDSIZE*GRIDSIZE).fill(false);
        }
        this.#addSquare(line, col); 
     }

    /**
     * dessine un carré
     * @param {Number} line
     * @param {Number} col
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
        for (let line=0; line<GRIDSIZE; line++){
            for (let col=0; col<GRIDSIZE; col++){
                if (this.#states[line*GRIDSIZE+col]) {
                    //let s = this.#canvas.square(line, col, 1);
                    //s.fill(Selection.FILL).stroke('none');
                    coords.push([line, col]);
                }
            }
        }
        let polys = this.#canvas.cadre(coords, 0);
        for (let poly of polys){
            poly.stroke(Selection.STROKE).fill(Selection.FILL);
        }
    }

    /**
     * 
     * @param {Number} line 
     * @param {Number} col 
     */
    #toggle(line, col){
        if ((line<0) || (line>=GRIDSIZE) || (col<0) || (col>=GRIDSIZE)) {
            return;
        }
        this.#states[line*GRIDSIZE+col] = !this.#states[line*GRIDSIZE+col];
    }



}

export { Selection };