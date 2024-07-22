import _ from 'lodash';
import { GRIDSIZE } from '../constantes';



class Grid {
    #values;

    constructor() {
        this.#values = Array(GRIDSIZE*GRIDSIZE).fill(0);
    }

    value(line, col) {
        if ((line<0) || (line>=GRIDSIZE)){
            return -1;
        }
        if ((col<0) || (col>=GRIDSIZE)){
            return -1;
        }
        return this.#values[line*GRIDSIZE + col];
    }
}