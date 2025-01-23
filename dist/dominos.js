let coms = [
    'DiBd:kw30',
    'DiBf:kw30',
    'DiBj:kw30',
    'DiCc:kw30',
    'DiDd:kw30',
    'DiDf:kw30',
    'DiDi:kw30',
    'DiHd:kw30',
    'DiHg:kw30',
    'DiHj:kw30',
    'DiId:kw30',
    'DiIf:kw30',
    'DiJd:kw30',
    'DiJj:kw30',
    'DicG:kw30',
    'DicH:kw30',
    'DifB:kw30',
    'DifD:kw30',
    'DifF:kw30',
    'DifG:kw30',
    'DifH:kw30',
    'DifI:kw30',
    'DiiH:kw30',
    'DijG:kw30',
    'DigE:kk30',
  ].join(';');
  
let g = new GameModule.Game("#board", "#pad", '9x9S', coms);

let url = window.location.href;
let i = url.indexOf('#');
if (i>=0) {
  g.load(url.substring(i+1));
}