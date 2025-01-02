import { SVG } from '@svgdotjs/svg.js';
import { Canvas } from '../graphic/canvas';

class Button {
    static STROKE = { width:10, color:"#888888" };
    static STROKEON = { width:10, color:"#FF8888" };
    static FILL   = { color:"#BBBBBB" };
    static FILLDARKER   = { color:"#888888" };
    static FILLON = { color:"#EEBBBB" };
    static FILLOVER   = { color:"#CCCCCC" };
    static RADIUS = 0.1;
    /** @type {Canvas} */
    #canvas;
    /** @type {SVG.G} */
    #group;
    /** @type {SVG.Rect} */
    #line;
    /** @type {number} */
    #col;
    /** @type {boolean} */
    #selected;
    /** @type {boolean} */
    #bistable = false;
    /** @type {Function} */
    #callBack = null;
    /** @type {string} */
    #tag = "";

    /**
     * constructeur
     * @param {Canvas} parent
     * @param {number} line
     * @param {number} col
     * @param {string} tag
     */
    constructor(parent, line, col, tag) {
        this.#tag = tag;
        this.#canvas = parent;
        this.#group = this.#canvas.group();
        let square = this.#canvas.square(line+.05, col+.05, .9, Button.RADIUS);
        square.fill(Button.FILL).stroke(Button.STROKE);
        this.#group.add(square);
        let button = this.#canvas.square(line, col, 1, 0);
        button.fill({color:'#FFFFFF', opacity:"0.01"}).stroke('none');
        this.#group.add(button);
        this.#line = line;
        this.#col = col;
        this.#selected = false;

        let self = this;
        button.mouseover(function(e){
            self.mouseover(e);
        });

        button.mouseout(function(e){
            self.mouseout(e);
            
        });

        button.mousedown(function(e){
            self.mousedown(e);
        });

        button.mouseup(function(e){
            self.mouseup(e);
        });
    }

    /**
     * proxy pour evénement mouseover
     * @param {Event} e 
     */
    mouseover(e) {
        let square = this.#group.children()[0];
        if ((e.buttons==1)||this.selected) {
            square.fill(Button.FILLON);
            square.stroke(Button.STROKEON);
        } else {
            square.fill(Button.FILLOVER);
        }
    }

    /**
     * proxy pour événement mouseout
     * @param {Event} e 
     */
    mouseout(e) {
        if (!this.selected){
            let square = this.#group.children()[0];
            square.fill(Button.FILL);
            square.stroke(Button.STROKE);
        }
    }

    /**
     * proxy pour événement mousedown
     * @param {Event} e 
     */
    mousedown(e){
        let square = this.#group.children()[0];
        square.fill(Button.FILLON);
        square.stroke(Button.STROKEON);
    }

    /**
     * proxy pour événement mouseup
     * @param {Event} e 
     */
    mouseup(e){
        if (this.#callBack != null) {
            this.#callBack(this, e);
        }
        if (this.bistable && !this.selected){
            this.setSelected(true);
        } else {
            this.setSelected(false);
        }
    }

    /**
     * trace un carré de couleur sur le bouton
     * @param {Object|string} fill 
     * @param {number} xoffset
     * @param {number} yoffset
     * @param {number} width
     * @returns {Button}
     */
    drawSquare(fill, xoffset, yoffset, size){
        if (typeof fill == 'string') {
            fill = {'color':fill};
        }
        let s = this.#canvas.square(this.#line+yoffset, this.#col+xoffset, size);
        s.stroke('none').fill(fill);
        this.#group.add(s);
        s.backward();
        return this;
    }

    /**
     * trace un carré de couleur sur le bouton
     * @param {string} text
     * @param {number} xoffset
     * @param {number} yoffset
     * @param {string} color
     * @returns {Button}
     */
    drawText(text, xoffset, yoffset, color = "#000000"){
        let t = this.#canvas.text(text, [this.#col + xoffset, this.#line + yoffset], 0.5);
        t.stroke('none').fill({'color':color});
        this.#group.add(t);
        t.backward();
        return this;
    }

    /**
     * Accesseur vers selected
     * @returns {boolean}
     */
    get bistable() {
        return this.#bistable;
    }

    /**
     * Accesseur vers tag
     * @returns {string}
     */
    get tag() {
        return this.#tag;
    }

    /**
     * Accesseur vers selected
     * @returns {boolean}
     */
    get selected() {
        return this.#selected;
    }

    /**
     * modifie valeur de selected
     * @param {boolean} value 
     */
    setSelected(value){
        this.#selected = value;
        let square = this.#group.children()[0];
        if (this.#selected) {
            square.fill(Button.FILLON);
            square.stroke(Button.STROKEON);
        } else {
            square.stroke(Button.STROKE);
            square.fill(Button.FILL);
        }
    }

    /**
     * éteint le bouton
     */
    unselect() {
        this.setSelected(false);
    }

    /**
     * assigne la fonction callBack
     * @param {Function|null} callBack
     * @returns {Button}
     */
    assignCallBack(callBack){
        this.#callBack = callBack;
        return this;
    }

    /**
     * rend le bouton bistable
     * @returns {Button}
     */
    setBistable() {
        this.#bistable = true;
        return this;
    }


}

export { Button };