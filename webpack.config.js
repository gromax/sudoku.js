const path = require('path');
var webpack = require('webpack');
module.exports = {
	mode: "development",
	entry: './src/game/game.js',
	output: {
		filename: 'game.js',
		path: path.resolve(__dirname, 'dist'),
		library: 'GameModule', // Nom de la bibliothèque (optionnel, utile pour UMD)
    	libraryTarget: 'umd', // Cible pour rendre le module universel (UMD)
    	globalObject: 'this', // Assure la compatibilité pour Node.js et le navigateur
	},
	plugins: [
		new webpack.ProvidePlugin({
		    $: 'jquery',
		    jQuery: 'jquery',
	    })
	]
};
