import $ from 'jquery';
import { SVG } from '@svgdotjs/svg.js';
import { Canvas } from '../graphic/canvas';
import { Events } from '../utils/events';

const PICTOS = {
    "bell":      ["./img/bell.svg", -152, -172, .13],
    "paint":     ["./img/paint.svg", 29, 29, 2],
    "eraser":    ["./img/eraser.svg", 29, 29, 2.5],
    "eraserc":   ["./img/eraser_color.svg", 29, 29, 2.5],
    "left":      ["./img/left_border.svg", 30, 30, 2.5],
    "right":     ["./img/right_border.svg", 30, 30, 2.5],
    "top":       ["./img/top_border.svg", 30, 30, 2.5],
    "bottom":    ["./img/bottom_border.svg", 30, 30, 2.5],
    "selection": ["./img/selection.svg", 30, 30, 2.5],
    "pen":       ["./img/pen.svg", 29, 29, 2.5],
    "outer":     ["./img/outer_border.svg", 29, 29, 2.5],
    "undo":      ["./img/undo.svg", 29, 29, 2.5],
    "redo":      ["./img/redo.svg", 29, 29, 2.5],
    "file":      ["./img/file.svg", 29, 29, 2.5],
};


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
    /** @type {boolean} */
    #pushOnly = false;
    /** @type {Events} */
    #eventsGest;
    /** @type {string} */
    #tag = "";
    /** @type {string[]} */
    #events;
    /** @type {*} */
    #data = null;

    /**
     * constructeur
     * @param {Canvas} parent
     * @param {number} line
     * @param {number} col
     * @param {Events} eventsGest
     * @param {Object} params
     */
    constructor(parent, line, col, eventsGest, params) {
        for (let attr in params) {
            if (["tag", "eventlistener", "event", "data", "picto", "caption", "bistable"].indexOf(attr)<0) {
                throw new Error(`L'attribut ${attr} n'est pas reconu.`)
            }
        }
        this.#tag = params.tag || "";
        this.#data = params.data || null;
        this.#events = [];
        if (params.event) {
            this.#events.push(params.event);
        }
        this.#eventsGest = eventsGest;

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

        if (params.picto) {
            this.#addPicto(params.picto);
        }
        if (params.caption) {
            this.#drawText(params.caption);
        }
        if (params.bistable) {
            this.setBistable();
        }
    }

    /**
     * ajoute un événement à déclencher au click
     * @param {string} event
     * @return {Button}
     */
    addEventTrigger(event) {
        this.#events.push(event);
        return this;
    }

    /**
     * accesseur data
     * @returns {*}
     */
    get data() {
        return this.#data;
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
        if (this.#pushOnly || (this.bistable && !this.selected)){
            this.setSelected(true);
        } else {
            this.setSelected(false);
        }
        let data = {
            "selected": this.selected,
            "tag":this.tag,
            "data":this.#data,
            "self":this
        };
        for (let event of this.#events) {
            this.#eventsGest.triggerEvent(event, e, data);
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
     * @returns {Button}
     */
    #drawText(text){
        let t = this.#canvas.text(text, [this.#col + .5, this.#line + .5], 0.7).anchor("C");
        t.stroke({'color':"#000000"}).fill('none');
        this.#group.add(t.group);
        t.group.backward();
        return this;
    }

    #addPicto(name) {
        if (typeof PICTOS[name] == 'undefined') {
            throw new Error(`Picto [${name}] inconnu !`);
        }
        let node = this.#canvas.node();
        let [filename, x, y, s] = PICTOS[name];
        let [x0, y0] = this.#canvas.unitToValue([this.#col, this.#line]);
        let selfGroup = this.#group;
        $.get(filename, function(data) {
            let $tmp = $('svg', data);
            node.svg($tmp.html());
            let picto = SVG(node.node.lastChild);
            picto.move(x0+x,y0+y).scale(s);
            selfGroup.add(picto);
            picto.backward();

        }, 'xml');
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
     * rend le bouton bistable
     * @returns {Button}
     */
    setBistable() {
        this.#bistable = true;
        this.#pushOnly = false;
        return this;
    }

    /**
     * met le bouton dans un mode où on ne peut que l'enclencher
     * @returns {Button}
     */
    setPushOnly() {
        this.#bistable = false;
        this.#pushOnly = true;
        return this;
    }


}

export { Button };