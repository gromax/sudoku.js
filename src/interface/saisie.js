/**
 * gère la zone de saisie de texte
 */

import { Events } from "../utils/events";

const DIVID = "saisie";

class Saisie {
    #node;
    /** @type {string} */
    #name;
    /** @type {Events} */
    #eventsGest;

    /**
     * constructeur
     * @param {string} name
     * @param {Events} eventsGest 
     */
    constructor(name, eventsGest) {
        this.#node = document.getElementById(DIVID);
        this.#name = name;
        this.#eventsGest = eventsGest;
    }

    /**
     * accesseur name
     * @returns {string}
     */
    get name() {
        return this.#name;
    }

    /**
     * affiche le champ de saisie
     * @param {string} text 
     */
    show(text){
        if (!this.#node) {
            return;
        }
        this.#node.innerHTML = "";
        let form = document.createElement("form");
        let textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.placeholder = "Entrez un commentaire."
        let inp = document.createElement("input");
        inp.type = "submit";
        inp.value = "valider";
        inp.classList.add("validation");
        form.appendChild(textarea);
        form.appendChild(inp);
        let self = this;
        let evG = this.#eventsGest
        form.addEventListener("submit", function(e){
            evG.triggerEvent("submitSaisie", e, {
                name:self.name,
                text:textarea.value
             })
            e.preventDefault();
        });
        this.#node.appendChild(form);
    }

    hide() {
        if (this.#node) {
            this.#node.innerHTML = "";
        }
    }

}

export {Saisie}