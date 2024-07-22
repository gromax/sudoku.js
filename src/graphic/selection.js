import { SVG } from '@svgdotjs/svg.js';
import { CELLSIZE, GRIDSIZE } from '../constantes';
import { Contour } from '../utils/contour';

class Selection {
    static STROKE = { width:10, color:"#0066ff" };

    #group;
    #states;
    constructor(parent) {
        this.#group = parent.nested();
        this.#states = Array(GRIDSIZE*GRIDSIZE).fill(false);
    }

    #draw() {
        let coords = [];
        for (let i=0; i<GRIDSIZE; i++) {
            for (let j=0; j<GRIDSIZE; j++) {
                if (this.#states[i*GRIDSIZE+j]) {
                    coords.push([i,j]);
                }
            }
        }
        let c = new Contour(coords);
        let paths = c.getPaths(CELLSIZE, 5);
        for (let p of paths) {
            this.#group.polygon(p).stroke(Selection.STROKE).fill('none');
        }
    }

    clear() {
        this.#states = Array(GRIDSIZE*GRIDSIZE).fill(false);
        this.#group.clear();
        return this;
    }

    remove(line, col) {
        if ((line<0) || (line>=GRIDSIZE)){
            return;
        }
        if ((col<0) || (col>=GRIDSIZE)){
            return;
        }
        let index = line*GRIDSIZE+col;
        if (!this.#states[index]){
            return;
        }
        this.#states[index] = false;
        this.#group.clear();
        this.#draw();
    }

    add(line, col) {
        if ((line<0) || (line>=GRIDSIZE)){
            return;
        }
        if ((col<0) || (col>=GRIDSIZE)){
            return;
        }
        let index = line*GRIDSIZE+col;
        if (this.#states[index]){
            return;
        }
        this.#states[index] = true;
        this.#group.clear();
        this.#draw();
    }

    toggle(line, col) {
        if ((line<0) || (line>=GRIDSIZE)){
            return;
        }
        if ((col<0) || (col>=GRIDSIZE)){
            return;
        }
        let index = line*GRIDSIZE+col;
        this.#states[index] = !this.#states[index];
        this.#group.clear();
        this.#draw();
        return this;
    }

    clickCell(line, col) {
        this.toggle(line, col);
    }


}

export { Selection };