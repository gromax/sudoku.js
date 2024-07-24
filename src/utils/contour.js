/* génère un contour relatif à des numéros de cases donnés relatifs à un quadrillage
*/

import _ from 'lodash';
import { DIRECTION } from '../constantes';

class Segment {
   #x;
   #y;
   #dx;
   #dy;
   #dir;
   constructor(x, y, dir){
      this.#x = x;
      this.#y = y;
      switch (dir) {
         case DIRECTION.UP: this.#dx = 0; this.#dy=-1; break;
         case DIRECTION.DOWN: this.#dx = 0; this.#dy=1; break;
         case DIRECTION.LEFT: this.#dx = -1; this.#dy=0; break;
         default: this.#dx = 1; this.#dy=0;
      }
      this.#dir = dir;
   }

   isOpposite(other) {
      return ((this.#dx==-other.#dx) && (this.#dy==-other.#dy) && (this.#x+this.#dx==other.#x) && (this.#y+this.#dy==other.#y));
   }

   get xdeb() {
      return this.#x;
   }

   get ydeb() {
      return this.#y;
   }

   get xfin() {
      return this.#x + this.#dx;
   }

   get yfin() {
      return this.#y + this.#dy;
   }

   get dir() {
      return this.#dir;
   }

   startsOnMyEnd(other) {
      return ((other.xdeb == this.xfin) && (other.ydeb == this.yfin));
   }

}

class Contour {
   #segments;
   constructor(coords){
      let line, col;
      this.#segments = Array();
      for (let i=0; i<coords.length; i++) {
         let c = coords[i];
         if ((typeof c == 'object') && (c.constructor.name == 'Coords')) {
            [col,line] = c.xy;
         } else {
            [line, col] = coords[i];
         }
         this.#addSquare(col,line);
      }
   }

   #addSegment(x, y, dir) {
      let snew = new Segment(x, y, dir);

      for (let i=0; i<this.#segments.length; i++) {
         let s = this.#segments[i];
         if (s.isOpposite(snew)) {
            this.#segments.splice(i,1);
            return;
         }
      }
      this.#segments.push(snew);
   }

   #addSquare(x, y) {
      this.#addSegment(x, y, DIRECTION.RIGHT);
      this.#addSegment(x+1, y, DIRECTION.DOWN);
      this.#addSegment(x+1, y+1, DIRECTION.LEFT);
      this.#addSegment(x, y+1, DIRECTION.UP);
   }

   #order() {
      for (let i=0; i<this.#segments.length-1; i++) {
         for (let j=i+1; j<this.#segments.length; j++) {
            if (this.#segments[i].startsOnMyEnd(this.#segments[j])) {
               let stemp = this.#segments[i+1];
               this.#segments[i+1] = this.#segments[j];
               this.#segments[j] = stemp;
               break;
            }
         }
      }
   }

   #cut() {
      this.#order();
      let output = [];
      let i = 0;
      let current = [];
      for(let i=0; i<this.#segments.length; i++) {
         let s = this.#segments[i];
         if (current.length == 0) {
            current.push(s);
            continue;
         }
         let last = current[current.length-1];
         if (last.startsOnMyEnd(s)) {
            current.push(s);
            continue;
         }
         output.push(current);
         current = [s];
      }
      if (current.length > 0) {
         output.push(current);
      }
      return output;
   }

   #getOnePath(path, margin){
      if (path.length <4) {
         return [];
      }
      let xyValues = [];
      let N = path.length;
      for (let i=0; i<N; i++) {
         let s = path[i];
         let sdir = s.dir;
         let precsdir = path[(i-1+N)%N].dir;
         let x = s.xdeb;
         let y = s.ydeb;
         if ((sdir==DIRECTION.UP) || (precsdir==DIRECTION.UP)) {
            x += margin;
         } else if((sdir==DIRECTION.DOWN) || (precsdir==DIRECTION.DOWN)) {
            x -= margin;
         }
         if ((sdir==DIRECTION.LEFT) || (precsdir==DIRECTION.LEFT)) {
            y -= margin;
         } else if((sdir==DIRECTION.RIGHT) || (precsdir==DIRECTION.RIGHT)) {
            y += margin;
         }
         xyValues.push(x);
         xyValues.push(y);
      }

      return xyValues;
   }

   getPaths(margin) {
      let paths = this.#cut();
      let output = [];
      for (let i=0; i<paths.length; i++) {
         output.push(this.#getOnePath(paths[i], margin));
      }
      return output;
   }
}

export { Contour };