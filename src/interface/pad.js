import { SVG } from "@svgdotjs/svg.js";
import { Canvas } from "../graphic/canvas";
import { Button } from "./button";
import { Radio } from "./radio";
import { Board } from "../graphic/board";
import { DIRECTION } from "../constantes";



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
     * @param {Board} board
     */
    constructor(id, board) {
        let self = this;
        this.#content = SVG().addTo(id).size(Pad.WIDTH, Pad.HEIGHT);
        this.#canvas = new Canvas(this.#content, Pad.BUTTONSIZE, 0);
        // exemple de bouton
        (new Button(this.#canvas, 0, 0, "a")).addPicto("bell");
        (new Button(this.#canvas, 0, 1, "b")).addPicto("pen");
        (new Button(this.#canvas, 0, 2, "c")).addPicto("paint").assignCallBack(
            function(b, e){
                board.toggleSelColor(self.selectedColor);
            }
        );
        (new Button(this.#canvas, 0, 3, "eraser")).addPicto("eraser");
        (new Button(this.#canvas, 1, 0, "border-left")).addPicto("left").assignCallBack(
            function(b, e){
                board.toggleBorderColor(self.selectedColor, DIRECTION.LEFT);
            }
        );
        (new Button(this.#canvas, 1, 1, "border-top")).addPicto("top").assignCallBack(
            function(b, e){
                board.toggleBorderColor(self.selectedColor, DIRECTION.UP);
            }
        );
        (new Button(this.#canvas, 1, 2, "border-right")).addPicto("right").assignCallBack(
            function(b, e){
                board.toggleBorderColor(self.selectedColor, DIRECTION.RIGHT);
            }
        );
        (new Button(this.#canvas, 1, 3, "border-bottom")).addPicto("bottom").assignCallBack(
            function(b, e){
                board.toggleBorderColor(self.selectedColor, DIRECTION.DOWN);
            }
        );
        (new Button(this.#canvas, 2, 0, "border-outer")).addPicto("outer").assignCallBack(
            function(b, e){
                board.toggleOuterBorderColor(self.selectedColor, DIRECTION.DOWN);
            }
        );
        (new Button(this.#canvas, 2, 1, "d")).addPicto("selection").setBistable().assignCallBack(
            function(b, e){
                if (b.selected) {
                    board.setSelectionVerrou();
                } else {
                    board.resetSelectionVerrou();
                }
            }
        );

        this.#radioPosition = new Radio([
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

        this.#radioColor = new Radio([
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

    /**
     * Accesseur pour la couleur sélectionnée
     * @returns {string}
     */
    get selectedColor() {
        return this.#radioColor.selected;
    }


}

export { Pad };