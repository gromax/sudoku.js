// Function to download data to a file

/**
 * Télécharge un contenu
 * @param {string} data 
 * @param {string} filename 
 */
function download(data, filename) {
    var file = new Blob([data], {type: 'text/plain'});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}

/**
 * Ouvre un popup de sélection de fichier
 * upload le contenu du fichier et l'envoie à callback au format
 * {success:true/false, content:"..." }
 * @param {Function} callback 
 */
function upload(callback){
    let inp = document.createElement("input");
    inp.type = 'file';
    inp.accept = '.txt';
    document.body.appendChild(inp);
    inp.addEventListener("change", function(e){ uploadCallback(e, callback)});
    inp.click();
    setTimeout(function() {
        document.body.removeChild(inp);
    }, 0); 
}

/**
 * fonction annexe de upload
 * callback du click sur le <input type="file" accept=".txt"/> généré par upload
 * @param {Event} e
 * @param {Function} callback
 */
function uploadCallback(e, callback, inp) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            callback({success:true, content:content});
        };

        // Gestion des erreurs éventuelles
        reader.onerror = function(e) {
            callback({success:false, content:`Erreur lors de la lecture du fichier : ${e.target.error}`})
        };

        reader.readAsText(file);
    } else {
        callback({success:false, content:"Aucun fichier sélectionné."})
    }
}

export { download, upload }