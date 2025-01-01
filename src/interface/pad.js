import { SVG } from "@svgdotjs/svg.js";
import { Canvas } from "../graphic/canvas";
import { Button } from "./button";


class Radio {
    /** @type {Array<Button>} */
    #buttons;

    /**
     * constructeur
     * @param {Array<Button>} buttons 
     */
    constructor(buttons) {
        this.#buttons = buttons;
        if (buttons.length == 0) {
            throw new Error('Liste de boutons vide dans Radio !');
        }
        let f = function(buttonClicked, event) {
            for (let b of buttons) {
                if (b!=buttonClicked) {
                    b.unselect();
                }
            }
        }
        buttons[0].setSelected(true);
        for (let b of buttons) {
            b.setBistable();
            b.assignCallBack(f);
        }
    }

    /**
     * Accesseur vers selected
     * @returns {string}
     */
    get selected() {
        for (let b of this.#buttons) {
            if (b.selected) {
                return b.tag;
            }
        }
        throw new Error('Aucun bouton validé !');
    }

}

class Pad {
    static HEIGHT = 400;
    static WIDTH = 1000;
    static BUTTONSIZE = 80;


    /** @type {SVG.SVG} */
    #content;
    /** @type {Canvas} */
    #canvas;


    /**
     * constructeur
     * @param {string} id identifiant dom du conteneur
     */
    constructor(id) {
        this.#content = SVG().addTo(id).size(Pad.WIDTH, Pad.HEIGHT);
        this.#canvas = new Canvas(this.#content, Pad.BUTTONSIZE, 0);
        // exemple de bouton
        new Button(this.#canvas, 0, 0, "a");
        new Button(this.#canvas, 0, 1, "b");
        new Button(this.#canvas, 0, 2, "c");
        new Button(this.#canvas, 0, 3, "d");

        let radioPosition = new Radio([
            (new Button(this.#canvas, 0, 5, "nw")).drawSquare(Button.FILLDARKER, 0.2, 0.2, 0.3),
            (new Button(this.#canvas, 0, 6, "n")).drawSquare(Button.FILLDARKER, 0.35, 0.2, 0.3),
            (new Button(this.#canvas, 0, 7, "ne")).drawSquare(Button.FILLDARKER, 0.5, 0.2, 0.3),
            (new Button(this.#canvas, 1, 5, "w")).drawSquare(Button.FILLDARKER, 0.2, 0.35, 0.3),
            (new Button(this.#canvas, 1, 6, "c")).drawSquare(Button.FILLDARKER, 0.35, 0.35, 0.3),
            (new Button(this.#canvas, 1, 7, "e")).drawSquare(Button.FILLDARKER, 0.5, 0.35, 0.3),
            (new Button(this.#canvas, 2, 5, "sw")).drawSquare(Button.FILLDARKER, 0.2, 0.5, 0.3),
            (new Button(this.#canvas, 2, 6, "s")).drawSquare(Button.FILLDARKER, 0.35, 0.5, 0.3),
            (new Button(this.#canvas, 2, 7, "se")).drawSquare(Button.FILLDARKER, 0.5, 0.5, 0.3)
        ]);

        let radioColor = new Radio([
            (new Button(this.#canvas, 0, 9, "#4287f5")).drawSquare("#4287f5", 0.3, 0.3, 0.4),
            (new Button(this.#canvas, 0, 10, "#d42215")).drawSquare("#d42215", 0.3, 0.3, 0.4),
            (new Button(this.#canvas, 0, 11, "#0be629")).drawSquare("#0be629", 0.3, 0.3, 0.4),
            (new Button(this.#canvas, 1, 9, "#f2ee07")).drawSquare("#f2ee07", 0.3, 0.3, 0.4),
            (new Button(this.#canvas, 1, 10, "#000000")).drawSquare("#000000", 0.3, 0.3, 0.4),
            (new Button(this.#canvas, 1, 11, "#8a8a8a")).drawSquare("#8a8a8a", 0.3, 0.3, 0.4),
            (new Button(this.#canvas, 2, 9, "#f58a07")).drawSquare("#f58a07", 0.3, 0.3, 0.4),
            (new Button(this.#canvas, 2, 10, "#eb42df")).drawSquare("#eb42df", 0.3, 0.3, 0.4),
            (new Button(this.#canvas, 2, 11, "#b207f5")).drawSquare("#b207f5", 0.3, 0.3, 0.4)
        ]);

       
    }
}

export { Pad };