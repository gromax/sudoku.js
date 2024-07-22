import { SVG } from '@svgdotjs/svg.js';

import { CELLSIZE, GRIDSIZE, SUBGRIDSIZE } from '../constantes';
import { GCell } from './cell';

class GGrid {
    #group;
    #cells;
    static BIGSTROKE = { color: '#000', width: 5 };
    constructor(parent, cellSelector){
        this.#cells = Array();
        this.#group = parent.nested();
        this.#group.attr("xmlns","http://www.w3.org/1999/xhtml");
        for (let i=0; i<GRIDSIZE; i++) {
            for (let j=0; j<GRIDSIZE; j++) {
                let c = new GCell(this.#group, i, j);
                c.move(i, j);
                this.#cells.push(c);
            }
        }
        for (let i=0; i<=GRIDSIZE; i+=SUBGRIDSIZE) {
            this.#group.line(0, i*CELLSIZE, GRIDSIZE*CELLSIZE, i*CELLSIZE).stroke(GGrid.BIGSTROKE);
            this.#group.line(i*CELLSIZE, 0, i*CELLSIZE, GRIDSIZE*CELLSIZE).stroke(GGrid.BIGSTROKE);
        }
        
    }

}

export { GGrid };