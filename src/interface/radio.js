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

export { Radio }