const CELLSIZE = 100;
const GRIDSIZE = 9;
const SUBGRIDSIZE = 3;

const DIRECTION = {
    UP    : 1,
    DOWN  : 2,
    LEFT  : 3,
    RIGHT : 4
 }

const ANCRES = {
    "N" : {x:0.5, y:0,   clockwise:"E",  counterclockwise:"W" },
    "NE": {x:1,   y:0,   clockwise:"SE", counterclockwise:"NW"},
    "NW": {x:0,   y:0,   clockwise:"NE", counterclockwise:"SW"},
    "E" : {x:1,   y:0.5, clockwise:"S",  counterclockwise:"N" },
    "SE": {x:1,   y:1,   clockwise:"SW", counterclockwise:"NE"},
    "S" : {x:0.5, y:1,   clockwise:"W",  counterclockwise:"E" },
    "SW": {x:0,   y:1,   clockwise:"NW", counterclockwise:"SE"},
    "W" : {x:0,   y:0.5, clockwise:"N",  counterclockwise:"S" },
    "C" : {x:0.5, y:0.5, clockwise:"C",  counterclockwise:"C" },
}

const COLORS = [
    "#4287f5",
    "#d42215",
    "#0be629",
    "#f2ee07",
    "#000000",
    "#8a8a8a",
    "#f58a07",
    "#eb42df",
    "#b207f5"
]

export { CELLSIZE, GRIDSIZE, SUBGRIDSIZE, DIRECTION, ANCRES, COLORS };