import { SVG } from "@svgdotjs/svg.js";
import { Canvas } from "../graphic/canvas";
import { Button } from "./button";
import { Radio } from "./radio";
import { Board } from "../graphic/board";
import { DIRECTION, COLORS } from "../constantes";



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
        (new Button(this.#canvas, 2, 8, "paint")).addPicto("paint").assignCallBack(
            function(b, e){
                board.toggleSelColor(self.selectedColor);
            }
        );
        (new Button(this.#canvas, 3, 8, "eraser")).addPicto("eraserc").assignCallBack(
            function(b,e) {
                board.clearColors();
            }
        );
        (new Button(this.#canvas, 0, 8, "border-left")).addPicto("left").assignCallBack(
            function(b, e){
                board.toggleBorderColor(self.selectedColor, DIRECTION.LEFT);
            }
        );
        (new Button(this.#canvas, 0, 9, "border-top")).addPicto("top").assignCallBack(
            function(b, e){
                board.toggleBorderColor(self.selectedColor, DIRECTION.UP);
            }
        );
        (new Button(this.#canvas, 0, 10, "border-right")).addPicto("right").assignCallBack(
            function(b, e){
                board.toggleBorderColor(self.selectedColor, DIRECTION.RIGHT);
            }
        );
        (new Button(this.#canvas, 0, 11, "border-bottom")).addPicto("bottom").assignCallBack(
            function(b, e){
                board.toggleBorderColor(self.selectedColor, DIRECTION.DOWN);
            }
        );
        (new Button(this.#canvas, 1, 8, "border-outer")).addPicto("outer").assignCallBack(
            function(b, e){
                board.toggleOuterBorderColor(self.selectedColor, DIRECTION.DOWN);
            }
        );
        (new Button(this.#canvas, 0, 1, "selection")).addPicto("selection").setBistable().assignCallBack(
            function(b, e){
                if (b.selected) {
                    board.setSelectionVerrou();
                } else {
                    board.resetSelectionVerrou();
                }
            }
        );

        (new Button(this.#canvas, 0, 2, "eraser")).addPicto("eraser").assignCallBack(
            function(b, e){
                board.clearDigits(self.position);
            }
        );

        (new Button(this.#canvas, 0, 5, "undo")).addPicto("undo").assignCallBack(
            function(b, e){
                ;
            }
        );

        (new Button(this.#canvas, 0, 6, "redo")).addPicto("redo").assignCallBack(
            function(b, e){
                ;
            }
        );


        for (let i=0; i<3; i++) {
            for (let j=0; j<3; j++) {
                let tag = `${i*3+j+1}`;
                (new Button(this.#canvas, i+1, j+1, tag)).drawText(tag).assignCallBack(
                    function(b, e){
                        board.toggleDigit(b.tag, self.position, self.selectedColor);
                    }
                );
            }
        }

        this.#radioPosition = new Radio([
            (new Button(this.#canvas, 1, 4, "NW")).drawSquare(Button.FILLDARKER, 0.2, 0.2, 0.3),
            (new Button(this.#canvas, 1, 5, "N")).drawSquare(Button.FILLDARKER, 0.35, 0.2, 0.3),
            (new Button(this.#canvas, 1, 6, "NE")).drawSquare(Button.FILLDARKER, 0.5, 0.2, 0.3),
            (new Button(this.#canvas, 2, 4, "W")).drawSquare(Button.FILLDARKER, 0.2, 0.35, 0.3),
            (new Button(this.#canvas, 2, 5, "C")).drawSquare(Button.FILLDARKER, 0.35, 0.35, 0.3),
            (new Button(this.#canvas, 2, 6, "E")).drawSquare(Button.FILLDARKER, 0.5, 0.35, 0.3),
            (new Button(this.#canvas, 3, 4, "SW")).drawSquare(Button.FILLDARKER, 0.2, 0.5, 0.3),
            (new Button(this.#canvas, 3, 5, "S")).drawSquare(Button.FILLDARKER, 0.35, 0.5, 0.3),
            (new Button(this.#canvas, 3, 6, "SE")).drawSquare(Button.FILLDARKER, 0.5, 0.5, 0.3),
            (new Button(this.#canvas, 0, 4, "P")).drawSquare(Button.FILLDARKER, 0.2, 0.2, 0.6)
        ]);

        let buttonsColor = [];
        for (let i=1; i<3; i++){
            for (let j=1; j<3; j++) {
                let cindex = i*3+j;
                let c = COLORS[cindex];
                let b = (new Button(this.#canvas, c)).drawSquare(c, 0.3, 0.3, 0.4);
                buttonsColor.push(b);
            }
        }
        this.#radioColor = new Radio(buttonsColor);
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