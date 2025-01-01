//import { SVG } from '@svgdotjs/svg.js';
//import { GGrid } from './graphic/grid';
//import { Selection } from './graphic/selection';

import { Board } from "./graphic/board";
import { Pad } from "./interface/pad";

var board = new Board('#board', '9x9S', 'ThBEBGEGED:Y;LibBIBIFgF:b;CagEFFCFB:py-;Cagffgfgh:o:20{2÷};lala;liCdEdEf:b;8FH:r;5BE:w;Tag{>}Gd:r.Cs80rR;CagJIJJIJ:gv:0=;ColBIBJCJ:v.50');
var pad = new Pad("#pad");


//var selector = new Selection(board);
//board.click(function(e){ selector.clickEvent(e); });

//$('#selection').on("click", function(e){ selector.selectMode($(this).is(':checked'));})
//$('#border').on("click", function(e){ selector.selectBorderMode($(this).is(':checked'));})
