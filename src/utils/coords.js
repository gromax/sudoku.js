/* Objet contenant une paire de coordonnées */

class Coords {
    #x;
    #y;

    static strToCoords(chaine, border=false) {
        /* chaine est une suite de forme A3B5C4
           Une lettre majuscule indique que l'on veut une coordonnée au centre de la case.
           Une lettre minuscule indique que l'on veut une coordonnée au coin sup gauche
           border: ignoré majuscule/minuscule et toujours prendre la coordonnée au coin sup gauche
           renvoie un tableau de Coords
        */
        let r2 = new RegExp("([A-Za-z])([0-9]+)", "g");
        let points = chaine.match(r2);
        if (points === null) {
            throw new Error(chaine + ": pas une chaine de coordonnées valide");
        }
        let output = [];
        let delta = border?0:0.5;
        for (let p of points) {
            let car = p.charAt(0);
            if (car.toUpperCase() == car) {
                let line = p.charCodeAt(0) - 65 + delta;
                let colonne =  parseInt(p.substring(1)) + delta;
                output.push(new Coords(colonne, line));
            } else {
                let line = p.charCodeAt(0) - 97;
                let colonne =  parseInt(p.substring(1));
                output.push(new Coords(colonne, line));
            }
        }
        return output;
    }

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

    get xy() {
        return [this.#x, this.#y];
    }
}

export { Coords };