/**
 * @typedef {Object.<string,Function[]>} CallBacks
 */

class Events {
    /** @type {CallBacks} */
    #callBacks;

    constructor() {
        this.#callBacks = {};
    }

    /**
     * attache un callback à un nom d'événement
     * @param {string} name 
     * @param {Function} callback 
     */
    addEvent(name, callback) {
        if (typeof this.#callBacks[name] == 'undefined') {
            this.#callBacks[name] = [];
        }
        this.#callBacks[name].push(callback);
    }

    /**
     * déclenche un événement en fournissant des données
     * @param {string} name 
     * @param {Event} e 
     * @param {*} data 
     * @returns 
     */
    triggerEvent(name, e, data) {
        if (typeof this.#callBacks[name] == 'undefined') {
            return;
        }
        for (let cb of this.#callBacks[name]) {
            cb(e, data);
        }
    }
}

export { Events }