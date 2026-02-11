# Sudoku.js

## Mise en route

* Commande pour mettre les dépendance npm : `npm install`
* Commande pour compiler le tout : `npm run build`

## Qu'est-ce ?

Il s'agit d'une interface graphique permettant de proposer des sudukus élaborés et aussi tout un jeu de commande pour mettre en couleurs, mettre des bords... afin de résoudre le Sudoku

## Mettre un sudoku en place

### La page web

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Le titre</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="icon" type="image/vnd.icon" href="favicon.ico">
    <script src="game.js"></script>
  </head>
  <body class="largeur">
    <div id="board"></div>
	  
    <div id="messages">
      <div class="message">
        <p>Ici le text pour donner les règles particulières de cette grille</p>
      </div>
    </div>
    <div id="saisie"></div>
    <div id="pad"></div>
    <script src="lescript.js"></script> <!-- script définissant le dessin de la grille -->
  </body>
</html>
```

### Le script

```js
let coms = [ // Liste de commandes texte

  ].join(';');
  
let g = new GameModule.Game("#board", "#pad", '9x9S', coms);

let url = window.location.href;
let i = url.indexOf('#');
if (i>=0) {
  g.load(url.substring(i+1));
}
```

### Game

En ligne 5 du script précédent, on doit faire un choix de grille.

Dans cet exemple, le format est `"9x9S"`, c'est à dire une grille de Sudoku classique.

  * On pourrait ne placer qu'un chiffre comme `"10"` et alors la grille sera 10x10
  * On pourrait ne placer qu'un chiffre comme `"10x6"` et alors la hauteur est 10 et la largeur est 6
  * Le suffixe `"S"` indique que l'on veut une grille interne comme pour un Sudoku. Fonctionnera pour toute dimension multiple de 3.

### Les Commandes

#### Les primitives

##### Chaine de coordonnées

Pour les divers commendes ci-dessous, on a besoin de coder des chemins de coordonnées ou des coordonnées simples. Pour cela on dispose d'un codage texte.

Une coordonnée simple est composée de deux symboles :
  * Une lettre majuscule de `A` à `Z` représentant les centres des cases.
  * Une lettre minuscule de `a` à `z`, représentant le bord gauche
  * Un chiffre (seulement en 2e) de `0` à `9` représentant un centre de case
  * Le premier symbole est forcément une lettre
  * **Attention :** le `a` correspond à -1
  * Le premier symbole représente la ligne, le second est la colonne

 Voici des exemples :

  * `"BB"` ou  est le centre de la case en haut à gauche.
  * `"B0"` est aussi le centre de la case en haut à gauche
  * `"bb"` est le coin haut gauche
  * `"Ce"` `C = 2` et `e = 4` désigne la case en ligne 2 et colonne 4. Comme `C` est majuscule, le point est centré verticalement. `e` en minuscule indique que l'on considère le bord gauche.

**Important :** Dans ce qui suit, j'écrirai `<COORDS>` pour une chaine de texte composée de 1 ou plusieurs paires de coordonnées, comme `ABeFA2`

###### Couleur

Dans certains cas, on peut ajouter une couleur optionnelle. La numéro de la couleur est spécifié par une lettre.

Par exemple on pourra avoir : `:d`

**Important :** Dans la suite, pour un bloc couleur optionel, j'écrirai <COL?>

Il peut arriver que l'on puisse préciser 2 couleurs comme `:dB`. Cand ce cas je mettrai `<COL2?>`

Les couleurs connues sont :
  * b : blue
  * r : red
  * p : purple
  * o : orange
  * y : yellow
  * _ : gray
  * v : violet
  * w : white
  * g : green
  * t : turquoise
  * m : marron
  * x : transparent
  * sinon : noir

#### Les commandes

##### Thermo

Dessine un thermomètre avec son bulbe dans la case initiale.

Format de la commande : `Th<COORDS><COL?>`


##### Line

Dessine une ligne brisée.

Format de la commande

  * `Li<COORDS><COL.>` pour un trait épais
  * `li<COORDS><COL.>` pour un trait fin

##### Disc

Dessine un cercle ou un disque.

Format de la commande : `Di<COORDS><COL2?><#2?>` ou `di<COORDS><COL2?><#2?>`

* `Di` pour un gros trait, `Di` pour un trait fin.
* Ici `<COORDS>` ne devrait être constitué que d'une paire
* La première couleur désigne le trait, la seconde désigne le remplissage
* le dernier item `<#2>` est un nombre de 1 ou 2 chiffres représentant la taille en % de la case. En l'absence de cette information, la valeur par défaut est 100 %.

##### Cage

Dessine une cage, c'est à dire une zone encadrée en pointillé comme dans Kenken. On peut ajouter une étiquette à cette cage.

Format de la commande : `Cag<COORDS><COL2?><:#2?><-|=?><{tag}?>`

  * `<COORDS>` indique les cases à cager,
  * La première couleur indique la couleur du trait, la 2e est la couleur du fond,
  * `<:#2?>`, composé de deux chiffres, est la marge en %. Par défaut 10 %.
  * `<-|=?>` indique le type de ligne désiré. `=` pour un gros trait continu, `-` pour un trait fin continu et rien pour un trait fin pointillé.
  * `<{tag}>` est l'étiquette éventuelle.

Exemple : `Cageefeff:g:0-{2x}`


##### Digit

Place un chiffre.

Format de la commande : `<Digit><COORDS><COL?><s#2?>`

  * `<Digit>` est naturellement le chiffre de 0 à 9,
  * `<COORDS>` ne devrait contenir qu'une paire,
  * `<COL?>` indique la couleur
  * `<s#2?>` indique une taille en %. Par défait 80.

##### Tag

Place une étiquette.

Format de la commande : `Tag<{contenu}><COORDS><COL2?><.anchor?><s#2?><r#?>`

  * `<{contenu}> ` : ce que l'on veut afficher. Contenu libre mais sans `;`.
  * `<COORDS>` : une seule paire.
  * `<COLS2?>` : couleur d'une bord de la boîte et couleur du fond.
  * `<.anchor>` : anchre de la boîte par rapport à la position. On a le choix parmi N, NE, E, SE, S, SW, W, NW, C.
  * `<s#2?>` : indique une taille en pourcents. Par défaut 100 %.
  * `<r#?>` : indique une rotation du texte. R pour Right, L pour Left, D pour Demi tour, ou une paire de chiffres pour un angle

Exemple : `Tag{truc}Ee:gb.NEh45r90`
  * place le tag `truc`
  * en position `Ee`, c'est à dire centre 4e ligne, bord gauche 4e colonne
  * couleurs g et b : cadre vert sur fond bleu
  * ancré au Nord Est,
  * taille de 45 %
  * tourné de 90°

##### ColorCell

Colore une cellule ou un groupe de cellules.

Format de la commande : `Col<COORDS><COL?><:#2?><.#2?>`

  * `<COORDS>` désigne les centrs cases à colorer.
  * `<COL?>` est bien sûr la couleur désirée.
  * `<:#2?>` indique une marge en %, par défaut 0 %.
  * `<.#2>` indique l'opacité en %, par défaut 100 %.

Exemple : `ColE3E4F4:g:0.95` color le groupe de cases en vert avec une marge de 0 et une opacité de 95 %.

