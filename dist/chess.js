let coms = [
  'Tag{1}FD:k.Cs80',
  'Tag{2}GH:k.Cs80'
].join(';');

let g = new GameModule.Game("#board", "#pad", '9x9S', coms);

let url = window.location.href;
let i = url.indexOf('#');
if (i>=0) {
  g.load(url.substring(i+1));
}