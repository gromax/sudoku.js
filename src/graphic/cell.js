import { SVG } from '@svgdotjs/svg.js';

import { Canvas } from './canvas';

class GCell {
    static OPACITY = 0.5;
    /** @type {Number} */
    #line;
    /** @type {Number} */
    #col;
    /** @type {Canvas} */
    #front;
    /** @type {Canvas} */
    #back;
    /** @type {SVG.G} */
    #backGroup;
    /** @type {SVG.G} */
    #frontGroup;
    /** @type {Array<string>} */
    #colors;


    /**
     * constructeur
     * @param {Canvas} back 
     * @param {Canvas} front 
     * @param {Number} line 
     * @param {Number} col 
     */
    constructor(back, front, line, col) {
        this.#back = back;
        this.#front = front;
        this.#line = line;
        this.#col = col;
        this.#backGroup = back.group();
        this.#frontGroup = front.group();
        this.#colors = [];
    }

    /**
     * ajoute une couleur à la liste
     * Ne fait rien s'il y a déjà 4 couleurs
     * @param {string} color 
     * @returns {GCell}
     */
    addColor(color) {
        if (this.#colors.length >= 4) {
            return this;
        }
        this.#colors.push({color:color, opacity:GCell.OPACITY});
        this.#backGroup.clear();
        if (this.#colors.length == 1) {
            this.#backGroup.add(this.#back.square(this.#line,this.#col,1,0).fill(this.#colors[0]).stroke('none'));

        } else if (this.#colors.length == 2) {
            this.#backGroup.add(this.#back.rect(this.#line,this.#col,.5, 1).fill(this.#colors[0]).stroke('none'));
            this.#backGroup.add(this.#back.rect(this.#line,this.#col+.5,.5, 1).fill(this.#colors[1]).stroke('none'));
        } else if (this.#colors.length == 3) {
            let x = this.#col;
            let y = this.#line;
            let A = [x, y];      // coint sup gauche
            let B = [x+.5, y]    // centre haut
            let C = [x+1, y]     // coint sup droit
            let D = [x+.5, y+.5] // centre
            let E = [x, y+1]     // coin inf gauche
            let F = [x+1, y+1]   // coin inf droit
            this.#backGroup.add(this.#back.polygon([A, B, D, E]).fill(this.#colors[0]).stroke('none'));
            this.#backGroup.add(this.#back.polygon([B, C, F, D]).fill(this.#colors[1]).stroke('none'));
            this.#backGroup.add(this.#back.polygon([E, D, F]).fill(this.#colors[2]).stroke('none'));
        } else if (this.#colors.length == 4) {
            this.#backGroup.add(this.#back.square(this.#line,this.#col,.5,0).fill(this.#colors[0]).stroke('none'));
            this.#backGroup.add(this.#back.square(this.#line,this.#col+.5,.5,0).fill(this.#colors[1]).stroke('none'));
            this.#backGroup.add(this.#back.square(this.#line+.5,this.#col,.5,0).fill(this.#colors[2]).stroke('none'));
            this.#backGroup.add(this.#back.square(this.#line+.5,this.#col+.5,.5,0).fill(this.#colors[3]).stroke('none'));
        }
        return this;
    }



}

export { GCell };

