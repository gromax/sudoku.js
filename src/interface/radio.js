import { Button } from "./button";
import { Events } from "../utils/events";

class Radio {
    /** @type {Array<Button>} */
    #buttons;

    /**
     * constructeur
     * @param {string} name
     * @param {Array<Button>} buttons 
     * @param {Events} eventsGest
     */
    constructor(name, buttons, eventsGest) {
        this.#buttons = buttons;
        if (buttons.length == 0) {
            throw new Error('Liste de boutons vide dans Radio !');
        }

        eventsGest.addEvent(name+"RadioClick", function(e, data) {
            if (!data){
                throw new Error("data n'est pas défini !");
            }
            for (let b of buttons){
                if (b!=data.self){
                    b.unselect();
                }
            }
        });
        
        buttons[0].setSelected(true);
        
        for (let b of buttons) {
            b.setPushOnly();
            b.addEventTrigger(name + "RadioClick");
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