let coms = [
    'Tag{71>}bb:k.Es40r45',
    'Tag{16>}bg:k.Es40r45',
    'Tag{10>}bi:k.Es40r45',
    'Tag{<21}bk:k.Ws40r315',
    'Tag{71>}db:k.Es40r315',
    'Tag{25>}fb:k.Es40r315',
    'Tag{30>}gb:k.Es40r315',
    'Tag{<10}kd:k.Ws40r45',
    'Tag{<16}kf:k.Ws40r45',
    'Tag{<3}ik:k.Ws40r315',
    'DiIE:pw80',
    'Tag{8}HH:k.Cs80'

  ].join(';');
  
let g = new GameModule.Game("#board", "#pad", '9x9S', coms);

let url = window.location.href;
let i = url.indexOf('#');
if (i>=0) {
  g.load(url.substring(i+1));
}