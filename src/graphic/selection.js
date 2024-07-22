import { SVG } from '@svgdotjs/svg.js';
import { GRIDSIZE } from '../constantes';

class Selection {
    static FILL = { color:"#1d6ba3", opacity:"0.5" };
    static BORDER = { width:5, color:"#2a5a7d" };

    #group;
    #cells;
    constructor(parent) {
        this.#group = parent.nested();
        this.#cells = Array();
    }

    #draw() {
        
    }

    clear() {
        this.#cells = Array();
        this.#group.clear();
        return this;
    }

    remove(line, col) {
        if ((line<0) || (line>=GRIDSIZE)){
            return this;
        }
        if ((col<0) || (col>=GRIDSIZE)){
            return this;
        }
        let index = line*GRIDSIZE+col;
        if (this.#cells.indexOf(index)<0){
            return this;
        }
        this.#cells.remove(index);
        this.#group.clear();
        this.#draw();
        return this;
    }

    add(line, col) {
        if ((line<0) || (line>=GRIDSIZE)){
            return this;
        }
        if ((col<0) || (col>=GRIDSIZE)){
            return this;
        }
        let index = line*GRIDSIZE+col;
        if (this.#cells.indexOf(index)>=0){
            return this;
        }
        this.#cells.push(index);
        this.#group.clear();
        this.#draw();
        return this;
    }



}