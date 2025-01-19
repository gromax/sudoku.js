import { SVG } from "@svgdotjs/svg.js";
import { Canvas } from "../graphic/canvas";
import { Button } from "./button";
import { Radio } from "./radio";
import { DIRECTION, COLORS } from "../constantes";
import { Events } from "../utils/events";

class Pad {
    static HEIGHT = 400;
    static WIDTH = 1000;
    static BUTTONSIZE = 80;


    /** @type {SVG.SVG} */
    #content;
    
    /** @type {Canvas} */
    #canvas;

    /** @type {Radio} */
    #radioColor;

    /** @type {Radio} */
    #radioPosition;

    /**
     * constructeur
     * @param {string} id identifiant dom du conteneur
     * @param {Events} eventsGest gestionnaire d'événements
     */
    constructor(id, eventsGest) {
        let self = this;
        this.#content = SVG().addTo(id).size(Pad.WIDTH, Pad.HEIGHT);
        this.#canvas = new Canvas(this.#content, Pad.BUTTONSIZE, 0);
        // exemple de bouton
        new Button(this.#canvas, 2, 8, eventsGest, {
            "event": "paintClick",
            "picto":"paint"
        });
        eventsGest.addEvent("paintClick", function(e, data){
            eventsGest.triggerEvent("paint", e, {color: self.selectedColor});
        });

        new Button(this.#canvas, 3, 8, eventsGest, {
            "event": "eraseColorClick",
            "picto":"eraserc"
        });
        eventsGest.addEvent("eraseColorClick", function(e, data){
            eventsGest.triggerEvent("paint", e, null);
        });

        new Button(this.#canvas, 0, 8, eventsGest, {
            "event": "borderClick",
            "picto":"left",
            "data": DIRECTION.LEFT
        });
        new Button(this.#canvas, 0, 9, eventsGest, {
            "event": "borderClick",
            "picto":"top",
            "data":DIRECTION.UP
        });
        new Button(this.#canvas, 0, 10, eventsGest, {
            "event":"borderClick",
            "picto":"right",
            "data":DIRECTION.RIGHT
        });
        new Button(this.#canvas, 0, 11, eventsGest, {
            "event":"borderClick",
            "picto":"bottom",
            "data":DIRECTION.DOWN
        });
        new Button(this.#canvas, 1, 8, eventsGest, {
            "event":"borderClick",
            "picto":"outer",
            "data":-1
        });

        eventsGest.addEvent("borderClick", function(e, data){
            eventsGest.triggerEvent("border", e, {
                color: self.selectedColor,
                direction: data.data
            });
        });        

        new Button(this.#canvas, 0, 1, eventsGest, {
            "event":"selectionClick",
            "picto":"selection",
            "bistable": true
        });
        eventsGest.addEvent("selectionClick", function(e, data){
            if (!data) {
                throw new Error("data n'est pas défini !");
            }
            eventsGest.triggerEvent("selection", e, {
                selected: data.selected
            });
        });

        new Button(this.#canvas, 0, 2, eventsGest, {
            "event":"eraseDigitClick",
            "picto":"eraser"
        });
        eventsGest.addEvent("eraseDigitClick", function(e, data){
            eventsGest.triggerEvent("digit", e, {
                anchor: self.position
            });
        });

        new Button(this.#canvas, 1, 7, eventsGest, {
            "event":"download",
            "picto":"download"
        });

        new Button(this.#canvas, 2, 7, eventsGest, {
            "event":"upload",
            "picto":"upload"
        });

        (new Button(this.#canvas, 3, 7, eventsGest, {
            "event":"commentClick",
            "picto":"bulle"
        })).setBistable();

        new Button(this.#canvas, 0, 5, eventsGest, {
            "picto":"undo",
            "event":"backClick"
        });

        new Button(this.#canvas, 0, 6, eventsGest, {
            "picto":"redo",
            "event":"forwardClick"
        });

        for (let i=0; i<3; i++) {
            for (let j=0; j<3; j++) {
                let value = `${i*3+j+1}`;
                new Button(this.#canvas, i+1, j+1, eventsGest, {
                    "caption":value,
                    "data":value,
                    "event":"digitClick"
                });
            }
        }
        eventsGest.addEvent("digitClick", function(e, data){
            eventsGest.triggerEvent("digit", e, {
                digit: data.data,
                anchor: self.position,
                color: self.selectedColor
            });
        });

        this.#radioPosition = new Radio("position", [
            (new Button(this.#canvas, 1, 4, eventsGest, { tag:"NW" })).drawSquare(Button.FILLDARKER, 0.2, 0.2, 0.3),
            (new Button(this.#canvas, 1, 5, eventsGest, { tag:"N"  })).drawSquare(Button.FILLDARKER, 0.35, 0.2, 0.3),
            (new Button(this.#canvas, 1, 6, eventsGest, { tag:"NE" })).drawSquare(Button.FILLDARKER, 0.5, 0.2, 0.3),
            (new Button(this.#canvas, 2, 4, eventsGest, { tag:"W"  })).drawSquare(Button.FILLDARKER, 0.2, 0.35, 0.3),
            (new Button(this.#canvas, 2, 5, eventsGest, { tag:"C"  })).drawSquare(Button.FILLDARKER, 0.35, 0.35, 0.3),
            (new Button(this.#canvas, 2, 6, eventsGest, { tag:"E"  })).drawSquare(Button.FILLDARKER, 0.5, 0.35, 0.3),
            (new Button(this.#canvas, 3, 4, eventsGest, { tag:"SW" })).drawSquare(Button.FILLDARKER, 0.2, 0.5, 0.3),
            (new Button(this.#canvas, 3, 5, eventsGest, { tag:"S"  })).drawSquare(Button.FILLDARKER, 0.35, 0.5, 0.3),
            (new Button(this.#canvas, 3, 6, eventsGest, { tag:"SE" })).drawSquare(Button.FILLDARKER, 0.5, 0.5, 0.3),
            (new Button(this.#canvas, 0, 4, eventsGest, { tag:"P"  })).drawSquare(Button.FILLDARKER, 0.2, 0.2, 0.6)
        ], eventsGest);

        let buttonsColor = [];
        for (let i=0; i<3; i++){
            for (let j=0; j<3; j++) {
                let cindex = i*3+j;
                let c = COLORS[cindex];
                let b = (new Button(this.#canvas, i+1, j+9, eventsGest, { tag:c })).drawSquare(c, 0.3, 0.3, 0.4);
                buttonsColor.push(b);
            }
        }
        this.#radioColor = new Radio("color", buttonsColor, eventsGest);
    }

    /**
     * Accesseur pour la couleur sélectionnée
     * @returns {string}
     */
    get selectedColor() {
        return this.#radioColor.selected;
    }

    /**
     * Accesser pour la position
     */
    get position() {
        return this.#radioPosition.selected;
    }
}

export { Pad };