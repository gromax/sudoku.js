class Selection {
    /** @type {number[]} */
    #indexes;
   
    /**
     * permet le codage et le décodage de sélection d'indices
     * @param {number[]} indexes 
     */
    constructor(indexes) {
        this.#indexes = indexes;
    }

    /** accesseur indexes
     * @returns {number[]}
     */
    get indexes() {
        return [...this.#indexes];
    }

    /** accesseur taille sélection
     * @returns {number}
     */
    get length() {
        return this.#indexes.length;
    }


}

export { Selection }