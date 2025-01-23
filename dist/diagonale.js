let coms = [
    'Tag{1}JB:k.C',
    'Tag{2}JD:k.C'
  ].join(';');
  
let g = new GameModule.Game("#board", "#pad", '9x9S', coms);

let url = window.location.href;
let i = url.indexOf('#');
if (i>=0) {
  g.load(url.substring(i+1));
}