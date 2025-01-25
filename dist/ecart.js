let coms = [
    'Tag{24}AB:k.Cs50',
    'Tag{0}AC:k.Cs50',
    'Tag{24}AD:k.Cs50',
    'Tag{22}AE:k.Cs50',
    'Tag{4}AF:k.Cs50',
    'Tag{22}AG:k.Cs50',
    'Tag{24}AH:k.Cs50',
    'Tag{0}AI:k.Cs50',
    'Tag{30}AJ:k.Cs50',
    'Tag{22}BA:k.Cs50',
    'Tag{14}CA:k.Cs50',
    'Tag{18}DA:k.Cs50',
    'Tag{10}EA:k.Cs50',
    'Tag{20}FA:k.Cs50',
    'Tag{12}GA:k.Cs50',
    'Tag{20}HA:k.Cs50',
    'Tag{18}IA:k.Cs50',
    'Tag{22}JA:k.Cs50',
    'Tag{2}BF:k.Cs80',
    'Tag{1}EF:k.Cs80',
    'Tag{8}GE:k.Cs80',
    'Tag{7}GG:k.Cs80',
    'Tag{1}JB:k.Cs80',
    'Tag{3}JJ:k.Cs80',

  ].join(';');
  
let g = new GameModule.Game("#board", "#pad", '9x9S', coms);

let url = window.location.href;
let i = url.indexOf('#');
if (i>=0) {
  g.load(url.substring(i+1));
}