import { SVG } from '@svgdotjs/svg.js';

import { CELLSIZE } from '../constantes';

class GCell {
    static FILL = '#fff';
    static STROKE = { color: '#000', width: 2 };
    #group;
    #back;
    #line;
    #col;
    constructor(parent, line, col) {
        this.#group = parent.nested();
        this.#back = this.#group.rect(CELLSIZE, CELLSIZE);
        this.#back.fill(GCell.FILL).stroke(GCell.STROKE);
        this.#line = line;
        this.#col = col;
    }

    move(line, col) {
        this.#group.move(col*CELLSIZE, line*CELLSIZE);
        return this;
    }

    attachSelector(selector) {
        let line = this.#line;
        let col = this.#col;
        this.#back.click(function(){ selector.clickCell(line, col); });
    }
}

export { GCell };

