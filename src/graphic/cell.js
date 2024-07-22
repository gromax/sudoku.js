import { SVG } from '@svgdotjs/svg.js';

import { CELLSIZE } from '../constantes';

class GCell {
    static FILL = '#fff';
    static STROKE = { color: '#000', width: 2 };
    #group;
    #back;
    constructor(parent) {
        this.#group = parent.nested();
        this.#back = this.#group.rect(CELLSIZE, CELLSIZE);
        this.#back.fill(GCell.FILL).stroke(GCell.STROKE);
    }

    move(line, col) {
        this.#group.move(col*CELLSIZE, line*CELLSIZE);
        return this;
    }
}

export { GCell };

