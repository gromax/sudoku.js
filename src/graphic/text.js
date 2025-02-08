import { SVG } from "@svgdotjs/svg.js";
import { Canvas } from "./canvas";
import { ANCRES } from "../constantes";

class Text {
    /** @type {SVG.G} */
    #group;

    /** @type {SVG.Text} */
    #svgText;

    /** @type {string} */
    #text;

    /** @type {SVG.Rect} */
    #cadre;

    /** @type {number} */
    #width;

    /** @type {number} */
    #height;

    /** @type {number} */
    #x = 0;
    
    /** @type {number} */
    #y = 0;
    
    /** @type {string} */
    #anchor = 'NW';

    /** @type {number} */
    #xAnchor = 0;

    /** @type {number} */
    #yAnchor = 0;

    /**@type {string|Object} */
    #stroke = '#000';

    /**
     * constructeur
     * @param {Canvas} parent 
     * @param {string} chaine 
     * @param {number} size 
     */
    constructor(parent, chaine, size) {
        this.#group = parent.group();
        this.#svgText = this.#group.text(chaine).fill('#000').css('font-size', size);
        let box = this.#svgText.node.getBBox();
        this.#svgText.dmove(-box.x + 0.1*box.width, -box.y + 0.1*box.height); // ancre NW
        this.#svgText.css({"pointer-events": "none"});
        this.#width = box.width*1.2;
        this.#height = box.height*1.2;
        this.#cadre = this.#group.rect(this.#width, this.#height).fill('none');
        this.#cadre.after(this.#svgText);
        this.#cadre.stroke('none');
        this.#text = chaine;
    }

    /**
     * si ancre donné, assigne l'ancre,
     * sinon renvoie l'ancre
     * @param {string|undefined} ancre 
     * @returns {Text}
     */
    anchor(ancre) {
        if (typeof(ancre) == 'undefined') {
            return this.#anchor;
        }
        if (typeof(ANCRES[ancre]) == 'undefined') {
            throw new Error(`Ancre ${ancre} invalide.`);
        }
        let xAnchor = ANCRES[ancre].x * this.#width;
        let yAnchor = ANCRES[ancre].y * this.#height;
        this.#anchor = ancre;
        this.#dmove(this.#xAnchor - xAnchor, this.#yAnchor - yAnchor);
        this.#xAnchor = xAnchor;
        this.#yAnchor = yAnchor;
        return this;
    }

    /**
     * déplacement relatif seulement du cadre et du texte
     * sans modifier l'assignation x,y de l'ancre
     * @param {number} dx 
     * @param {number} dy 
     */
    #dmove(dx, dy) {
        this.#svgText.dmove(dx,dy);
        this.#cadre.dmove(dx,dy);
    }

    /**
     * assigne couleur du cadre et du texte
     * @param {string|Object} color 
     * @returns {Text}
     */
    stroke(color) {
        this.#stroke = color;
        this.#svgText.fill(color);
        if (this.#cadre.fill() != 'none') {
            this.#cadre.stroke(color);
        }
        return this;
    }

    /**
     * assigne la couleur du fond
     * @param {string|object} color 
     * @returns {Text}
     */
    fill(color) {
        if (color == 'none') {
            this.#cadre.fill('none').stroke('none');
        } else {
            this.#cadre.fill(color).stroke(this.#svgText.fill());
        }
        return this;
    }

    /**
     * positionne aux coordonnées voulues
     * @param {number} x 
     * @param {number} y 
     * @returns {Text}
     */
    move(x, y) {
        this.#dmove(x - this.#x, y-this.#y);
        this.#x = x;
        this.#y = y;
        return this;
    }

    /**
     * déplacement relatif en ajustant l'asignation x, y de l'ancre
     * @param {number} dx 
     * @param {number} dy
     * @returns {Text}
     */
    dmove(dx, dy) {
        this.#dmove(dx, dy);
        this.#x += dx;
        this.#y += dy;
        return this;
    }

    /**
     * accesseur pour couleur stroke
     * @returns {string|object}
     */
    get strokeColor() {
        return this.#stroke;
    }

    /**
     * accesseur pour la largeur
     * @returns {number}
     */
    get width() {
        return this.#width;
    }

    /**
     * accesseur pour la hauteur
     * @returns {number}
     */
    get height() {
        return this.#height;
    }

    /**
     * accesseur pour l'assignation x de l'ancre
     * @returns {number}
     */
    get x() {
        return this.#x;
    }

    /**
     * accesseur pour l'assignation y de l'ancre
     * @returns {number}
     */
    get y() {
        return this.#y;
    }

    /**
     * accesseur pour le contenu texte
     * @returns {string}
     */
    get text() {
        return this.#text;
    }

    /**
     * accesseur vers group
     * @returns {SVG.G}
     */
    get group() {
        return this.#group;
    }

    /**
     * Fait pivoter dans le sens horaire
     * @param {number} angle
     * @returns {Text}
     */
    turnClockWise(angle=90) {
        this.#svgText.rotate(angle,this.#x,this.#y);
        this.#cadre.rotate(angle,this.#x,this.#y);
        return this;
    }

    /**
     * fait pivoter dans le sens anti-horaire
     * @param {number} angle
     * @returns {Text}
     */
    turnCounterClockWise(angle=90) {
        this.#svgText.rotate(-angle,this.#x,this.#y);
        this.#cadre.rotate(-angle,this.#x,this.#y);
        return this;
    }

    /**
     * supprime le noeud
     */
    removeSVG() {
        this.#svgText.remove();
    }
}

export { Text };