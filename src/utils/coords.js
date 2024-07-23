class Coords {
    #x;
    #y;
    constructor(x,y) {
       this.#x = x;
       this.#y = y; 
    }

    get x() {
        return this.#x;
    }

    get y() {
        return this.#y;
    }

    get line() {
        return this.#y;
    }

    get col() {
        return this.#x;
    }
}

export { Coords };